---
name: configure-from-spec
version: 2.3.0
description: Configure un nouveau site fork-é depuis emd-template À PARTIR D'UN FICHIER SPEC pré-rempli par le wizard nano-mentionbox. Lit `init-spec.md` à la racine du repo, analyse les exports Semrush bruts dans `semrush-exports/` pour clusteriser les mots-clés et déterminer l'arborescence du site (categories), écrit `niche.config.ts` + tous les fichiers `content/*` + `docs/AUTHOR-*` en miroir dans toutes les locales, délègue à `integrate-claude-design` si `design-incoming/` contient des fichiers (extraits par le wizard, pas un zip) OU exécute `docs/AUTO-DESIGN.md` pour composer une vraie DA si aucun design n'est fourni, génère un `content/calendrier-edito.md` avec 50 articles prêts à rédiger classés par priorité (volume × intent / KD), et crée la scheduled task de rédaction quotidienne selon le gabarit canonique `docs/SCHEDULED-TASK-REDACTION.md` (SERP analysis obligatoire avant chaque article). À utiliser dans CE cas et CE cas SEULEMENT : un init-spec.md fraîchement poussé par le wizard est présent à la racine du repo et l'utilisateur dit explicitement « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration », « setup le repo ». Ne JAMAIS utiliser pour un site déjà configuré (niche.config.ts.market défini → utiliser init-site classique pour amender). Ne JAMAIS proposer ce skill si init-spec.md n'existe pas — proposer init-site à la place.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
---

# configure-from-spec v2.3 — Configurer un site depuis un init-spec.md du wizard

> **Changement v2.2 → v2.3** : L'étape 13 (scheduled task) ne ré-embarque plus un prompt complet.
> Elle pointe vers le gabarit canonique **`docs/SCHEDULED-TASK-REDACTION.md`** (SERP-first, GEO 2026,
> images V2, miroir i18n conditionnel, année dynamique). Une seule source de vérité à maintenir.
>
> **Changement v2.1 → v2.2** : L'étape 12 (design) ne laisse plus JAMAIS les placeholders quand
> aucun Claude Design n'est fourni. Si `design-incoming/` est vide, on exécute `docs/AUTO-DESIGN.md`.
>
> **Changement v2.0 → v2.1** : Le wizard décompresse le zip Claude Design côté backend ; `design-incoming/`
> contient directement les fichiers extraits.

Ce skill prend en entrée un fichier `init-spec.md` à la racine du repo + (optionnel) des exports Semrush bruts dans `semrush-exports/` + (optionnel) un dossier `design-incoming/` rempli de fichiers Claude Design extraits. Il produit en sortie une configuration complète du site en un seul commit atomique.

## Pré-requis vérifiés au démarrage

1. **`init-spec.md` existe** à la racine. Si absent → ne PAS exécuter, proposer `init-site` classique.
2. **`niche.config.ts.market` est vide ou placeholder**. Si déjà rempli → demander confirmation.
3. **Git status clean** ou changements non liés.

---

## Étape 1 — Parser le init-spec.md

Lire `init-spec.md`. Structure attendue : sections Markdown avec codeblocks YAML.

Sections attendues :
- `## Identité du site` (YAML)
- `## Bloc 0 — Marché et langues` (YAML)
- `## Bloc 1 — Voix éditoriale` (YAML ou bloc 🤖 Mode AUTO)
- `## Bloc 2 — Mots-clés` (positioning + références aux fichiers `semrush-exports/*.csv` + clusters manuels optionnels)
- `## Bloc 3 — Calendrier éditorial` (YAML ou bloc 🤖 Mode AUTO)
- `## Bloc 4 — Concurrents` (manuel ou 🤖 Mode AUTO si absent)
- `## Bloc 5 — FAQ de base` (toujours 🤖 Mode AUTO — Claude dérive des PAA)
- `## Bloc 6 — Mentions légales` (YAML)
- `## Bloc 7 — Auteur` (YAML, optionnel)
- `## Design` (bloc questionnaire `source: questionnaire` OU `source: zip` — cf. docs/WIZARD-DESIGN-STEP.md)

Si une section critique manque (Bloc 0, 1, 6), arrêter et expliquer.

**Détecter les modes AUTO** : pour chaque bloc, si tu vois "🤖 **Mode AUTO**" en tête, suivre les directives spécifiques du bloc et NE PAS chercher un YAML normal.

---

## Étape 2 — Validation sémantique

Avant d'écrire, vérifier :

| Check | Action si échec |
|---|---|
| `market` ∈ ['BE', 'FR', 'CA', 'CH', autre ISO valide] | Demander confirmation |
| `locales[0]` === `defaultLocale` | Forcer alignement |
| Si `localePrefix === 'as-needed'` → `locales.length >= 2` | Sinon retirer |
| Mentions légales : email contact présent | Bloquer si absent (RGPD) |
| Auteur (si présent) : slug en kebab-case | Forcer normalisation |
| Cohérence market ↔ locales | Demander si suspicieux |

Regrouper tous les warnings en un seul message avant d'écrire.

---

## Étape 3 — Analyser les exports Semrush

### 3.1 Détection

```bash
ls semrush-exports/*.csv 2>/dev/null
```

Lire chaque CSV (`head -1` pour le header, puis tout le fichier).

Format attendu Semrush : `Keyword, Intent, Volume, Keyword Difficulty, CPC (EUR), SERP Features`.

### 3.2 Agrégation et dédoublonnage

Pour chaque keyword :
- Normaliser : minuscules, retirer accents, normaliser apostrophes, espaces multiples
- Dédoublonner : forme normalisée identique → garder volume max
- Conserver les variants dans `aliases`

Si > 2000 keywords après dédoublonnage : filtrer volume ≥ 10. Documenter la troncature dans `content/mots-cles.md`.

### 3.3 Classification d'intent

Inférer si la colonne Semrush Intent est vide :
- **informational** : "comment", "pourquoi", "qu'est-ce que", "quel", "guide", "définition"
- **commercial** : "comparer", "vs", "meilleur", "avis", "test", "top", "classement"
- **transactional** : "prix", "tarif", "souscrire", "commander", "acheter", "abonnement"
- **navigational** : marque connue ou nom de produit identifiable

### 3.4 Clustering sémantique

5 à 10 clusters par thème :
1. Identifier les termes pivots récurrents
2. Affecter chaque keyword au pivot dominant
3. Cluster "Divers" pour les orphelins
4. Fusionner les clusters de < 5 keywords avec leur voisin

Pour chaque cluster :
- **head term** : keyword volume max + KD ≤ 50
- **longue traîne** : volume 30-500
- **quick wins** : KD ≤ 30 ET volume ≥ 20
- **à éviter** : volume = 0 OU KD > 70

### 3.5 Détermination de l'arborescence du site

⚠️ **Règle absolue** : `niche.config.ts.categories` est TOUJOURS écrit depuis les clusters Semrush, même si un design est présent.

Convertir 5-8 clusters majeurs en categories :

```ts
categories: [
  {
    slug: 'cluster-1-slug',
    label: 'Nom du cluster',
    accent: '#XXX',
    description: 'Phrase courte',
  },
],
```

Slug : kebab-case dérivé du head term, court et SEO-friendly.

---

## Étape 4 — Écrire `niche.config.ts`

Mapping spec → niche.config.ts. Dériver `entity`, `entities`, `entityVerb`, `heroPrefix`, `rotatingWords` des clusters Semrush. Marquer TODO uniquement si ambigu.

---

## Étape 5 — Écrire `content/mots-cles.md`

Sections : Positionnement, Méthodologie, Clusters (avec tableaux head/longue traîne/quick wins/à éviter), Divers, Exports bruts (références aux CSV).

---

## Étape 6 — Écrire `content/calendrier-edito.md` (50 articles)

⚠️ **Règle absolue en tête du fichier** :

> ⚠️ RÈGLE ABSOLUE — SERP analysis du mot-clé via WebSearch OBLIGATOIRE avant rédaction.
> Top 3 Google.[market_tld] → content gap → exploitation dans l'article. Non-skippable.

Calendrier : 50 articles classés par priorité = volume × (intent commercial = 2, transactional = 1.5, informational = 1) / max(KD, 1).

10 articles par cluster majeur, jusqu'à 50 au total. Pour chaque article : head term + vol + KD + intent + format suggéré.

---

## Étape 7 — Écrire `content/ton-of-voice.md`

À partir du Bloc 1 (mode manuel) OU dérivé du marché/concurrents/clusters Semrush (mode auto).
Si `voiceMode === 'per-language'` : créer aussi les variantes par locale.

---

## Étape 8 — Écrire `content/concurrents.md`

À partir du Bloc 4 (mode manuel) OU dérivé via WebSearch sur les head terms (mode auto).

---

## Étape 9 — Écrire `content/faq-base.md`

**Toujours en mode auto** : simuler les PAA Google.[market_tld] des head terms majeurs, regrouper en 3-5 thèmes, réponse-cadre 2-4 phrases factuelle sans tic IA (cf. `humaniser-fr`).

---

## Étape 10 — Écrire `content/pages/mentions-legales.yaml`

À partir du Bloc 6 + variantes locales si N langues.

---

## Étape 11 — Écrire `docs/AUTHOR-[slug].md` (si Bloc 7 présent)

À partir du Bloc 7.

---

## Étape 12 — Design : intégrer le livrable OU composer une DA auto

Vérifier ce que contient `design-incoming/` :

```bash
ls -la design-incoming/ 2>/dev/null
```

### Cas A — `design-incoming/` contient des fichiers (livrable Claude Design)

Déléguer au skill `integrate-claude-design` (mapping pages → `app/`, composants → `components/`, tokens → `niche.config.ts`, conversions techniques, nettoyage du dossier). NE PAS faire `unzip` (déjà extrait).

### Cas B — `design-incoming/` est vide ou absent (AUCUN livrable design)

**NE JAMAIS laisser les placeholders palette/fonts/signature.** Exécuter **`docs/AUTO-DESIGN.md`** :
lire le bloc `## Design` de init-spec (archétype + mood + brandColor + mode), choisir l'archétype
(comparateur / magazine / hybride → home + hero + référence), composer la DA via `composePreset()`
sur `lib/da-presets/`, écrire palette + fonts + `niche.style` + `niche.signature`.

### Images structurelles (les deux cas)

Après la DA, **générer les images structurelles** (hero + fonds par catégorie) via
`mcp__nano-mentionbox__generate_image` à partir des prompts de `lib/image-slots.ts`, alignés sur la
DA, push WebP sous `public/images/`. Cf. `docs/IMAGES-WORKFLOW.md`. Un site neuf en placeholders = bug.

**⚠️ Le design NE DOIT PAS écraser `niche.config.ts.categories`** (issu des clusters Semrush).

---

## Étape 13 — Créer la scheduled task de rédaction quotidienne

Demander confirmation à l'utilisateur AVANT (effet de bord global Cowork).

Créer la tâche en suivant le **gabarit canonique `docs/SCHEDULED-TASK-REDACTION.md`** : y remplacer
les `[placeholders]` depuis `niche.config.ts` + la spec (`[siteName]`, `[repoOwner]/[repoName]`,
`[market]`, `[authorName]`, `[authorSlug]`, `[locales]`, `[cron]`). Ne PAS réécrire un prompt à la
main — le gabarit est la source de vérité (SERP-first, GEO 2026, images V2, miroir i18n conditionnel,
année dynamique via `currentYear()`).

- TaskId : `[repoName]-article-daily`
- Cron : cadence du Bloc 3 (`0 8 * * *` par défaut)

---

## Étape 14 — PROGRESS.md + DECISIONS.md

Sections en tête. Documenter la DA retenue (livrable intégré OU composée via AUTO-DESIGN : archétype, palette, fonts, mode) et les images structurelles générées.

---

## Étape 15 — Commit atomique

UN commit avec tous les fichiers. Message Conventional Commits anglais.

---

## Étape 16 — Récap utilisateur

```
✓ Site bootstrappé.

Marché : [market]
Locales : [...] (miroir strict si >= 2)
Clusters Semrush analysés : K (N keywords)
Categories : 6
Calendrier : 50 articles classés par priorité
Auteur : [name + slug]
Design : intégré depuis design-incoming/ OU DA composée via AUTO-DESIGN (archétype + palette + fonts)
Images structurelles : générées (hero + catégories)
Scheduled task : [repoName]-article-daily, cron 0 8 * * * (gabarit SCHEDULED-TASK-REDACTION)

Prochaines étapes :
1. Valider niche.config.ts.categories
2. pnpm dev → vérifier rendu local
3. Premier déploiement Vercel
4. Run now sur la scheduled task

Lien repo : https://github.com/[owner]/[name]
```

---

## Règles strictes

- **NE JAMAIS exécuter** sans `init-spec.md`.
- **NE JAMAIS écraser** un `niche.config.ts` rempli sans confirmation.
- **NE JAMAIS inventer** si spec incomplète → TODO + avertir.
- **NE JAMAIS laisser la palette/fonts par défaut** quand aucun design n'est fourni → `docs/AUTO-DESIGN.md`.
- **NE JAMAIS laisser un site neuf en placeholders** → générer les images structurelles.
- **TOUJOURS un commit atomique** · **demander confirmation avant scheduled task**.
- **TOUJOURS miroir strict** si `locales.length >= 2`.
- **TOUJOURS dériver categories des clusters Semrush** (jamais du design).
- **TOUJOURS la scheduled task depuis `docs/SCHEDULED-TASK-REDACTION.md`** (pas de prompt maison).

---

## Lien avec les autres skills / docs

- `init-site` v2 : alternatif sans init-spec.md (applique aussi AUTO-DESIGN + images si pas de design).
- `integrate-claude-design` : étape 12 Cas A. **Ne touche pas à `niche.config.ts.categories`**.
- `docs/AUTO-DESIGN.md` : étape 12 Cas B (compose la DA depuis `lib/da-presets/` + référence).
- `docs/IMAGES-WORKFLOW.md` : génération des images (structurelles à l'init, cover/mid par la tâche).
- `docs/SCHEDULED-TASK-REDACTION.md` : gabarit de la tâche quotidienne (étape 13).
- `seo-geo-redaction` (+ `references/mirror-i18n.md`), `ton-of-voice`, `humaniser-fr` : utilisés à chaque rédaction.
