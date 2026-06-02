---
name: configure-from-spec
version: 2.2.0
description: Configure un nouveau site fork-é depuis emd-template À PARTIR D'UN FICHIER SPEC pré-rempli par le wizard nano-mentionbox. Lit `init-spec.md` à la racine du repo, analyse les exports Semrush bruts dans `semrush-exports/` pour clusteriser les mots-clés et déterminer l'arborescence du site (categories), écrit `niche.config.ts` + tous les fichiers `content/*` + `docs/AUTHOR-*` en miroir dans toutes les locales, délègue à `integrate-claude-design` si `design-incoming/` contient des fichiers (extraits par le wizard, pas un zip) OU exécute `docs/AUTO-DESIGN.md` pour composer une vraie DA si aucun design n'est fourni, génère un `content/calendrier-edito.md` avec 50 articles prêts à rédiger classés par priorité (volume × intent / KD), et crée la scheduled task de rédaction quotidienne avec la règle absolue de SERP analysis avant chaque article. À utiliser dans CE cas et CE cas SEULEMENT : un init-spec.md fraîchement poussé par le wizard est présent à la racine du repo et l'utilisateur dit explicitement « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration », « setup le repo ». Ne JAMAIS utiliser pour un site déjà configuré (niche.config.ts.market défini → utiliser init-site classique pour amender). Ne JAMAIS proposer ce skill si init-spec.md n'existe pas — proposer init-site à la place.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
---

# configure-from-spec v2.2 — Configurer un site depuis un init-spec.md du wizard

> **Changement v2.1 → v2.2** : L'étape 12 (design) ne laisse plus JAMAIS les placeholders quand
> aucun Claude Design n'est fourni. Si `design-incoming/` est vide, on exécute désormais
> `docs/AUTO-DESIGN.md` : composition d'une vraie DA depuis `lib/da-presets/` + la référence
> `docs/design-reference/comparateur-energie/`. Le site sort de l'init avec une direction
> artistique propre et distincte, même sans livrable design.
>
> **Changement v2.0 → v2.1** : Le wizard nano-mentionbox décompresse le zip Claude Design **côté backend** avant de pousser. Donc `design-incoming/` du repo contient maintenant directement les fichiers extraits (.jsx, .html, .json, .png, .css...), pas de zip à décompresser.

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
- `## Design (Claude Design)` (optionnel — fichiers extraits dans `design-incoming/`)

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

(Voir gabarit dans la v2.0 — inchangé.)

---

## Étape 5 — Écrire `content/mots-cles.md`

Sections : Positionnement, Méthodologie, Clusters (avec tableaux head/longue traîne/quick wins/à éviter), Divers, Exports bruts (références aux CSV).

---

## Étape 6 — Écrire `content/calendrier-edito.md` (50 articles)

⚠️ **Règle absolue en tête du fichier** :

> ⚠️ RÈGLE ABSOLUE — SERP analysis du mot-clé via WebSearch OBLIGATOIRE avant rédaction.
> Top 3 Google.[market_tld] → content gap → exploitation dans l'article. Non-skippable.

Calendrier : 50 articles classés par priorité = volume × (intent commercial = 2, transactional = 1.5, informational = 1) / max(KD, 1).

10 articles par cluster majeur, jusqu'à 50 au total.

Pour chaque article : head term + vol + KD + intent + format suggéré.

---

## Étape 7 — Écrire `content/ton-of-voice.md`

À partir du Bloc 1 (mode manuel) OU dérivé du marché/concurrents/clusters Semrush (mode auto).

Si `voiceMode === 'per-language'` : créer aussi les variantes par locale.

---

## Étape 8 — Écrire `content/concurrents.md`

À partir du Bloc 4 (mode manuel) OU dérivé via WebSearch sur les head terms (mode auto).

---

## Étape 9 — Écrire `content/faq-base.md`

**Toujours en mode auto** (le wizard ne demande plus la FAQ manuellement) :
1. Pour les head terms majeurs, simuler les PAA Google.[market_tld]
2. Regrouper en 3-5 thèmes
3. Réponse-cadre 2-4 phrases factuelle, sans tic IA (cf. `humaniser-fr`)

---

## Étape 10 — Écrire `content/pages/mentions-legales.yaml`

À partir du Bloc 6 + variantes locales si N langues.

---

## Étape 11 — Écrire `docs/AUTHOR-[slug].md` (si Bloc 7 présent)

À partir du Bloc 7.

---

## Étape 12 — Design : intégrer le livrable OU composer une DA auto

Deux cas, mutuellement exclusifs. Vérifier d'abord ce que contient `design-incoming/` :

```bash
ls -la design-incoming/ 2>/dev/null
```

### Cas A — `design-incoming/` contient des fichiers (livrable Claude Design)

Le dossier contient les **fichiers déjà extraits** du zip Claude Design (le wizard a décompressé côté backend). Tu y trouveras directement des `.jsx`, `.html`, `.json`, `.png`, `.css`, etc. Déléguer au skill `integrate-claude-design` qui :
- Lit chaque fichier
- Mappe pages → `app/`, composants → `components/`, tokens → `niche.config.ts.palette` / `fonts` / `signature`
- Applique les conversions techniques (var CSS, next/image, RSC vs 'use client')
- Nettoie le dossier `design-incoming/` après intégration

**⚠️ NE PAS faire `unzip`** : il n'y a PAS de zip dans `design-incoming/`. Si tu vois un fichier `design.zip` (cas d'un repo créé avec une vieille version du wizard avant v2.1), tu peux le décompresser via `unzip -o design-incoming/design.zip -d design-incoming/ && rm design-incoming/design.zip`. Sinon, ignore cette étape.

### Cas B — `design-incoming/` est vide ou absent (AUCUN livrable design)

**NE JAMAIS laisser les placeholders palette/fonts/signature de `niche.config.ts`** (le thème par défaut : rouge `#FF3D57`, fonts Unbounded/Space Grotesk, dark + aurora). Les garder = tous les sites se ressemblent, et le site sort « moche/générique ».

➡️ **Exécuter `docs/AUTO-DESIGN.md`** : composer une vraie DA depuis `lib/da-presets/` (161 presets via `lib/da-presets/index.ts` → `composePreset(productType, moods)`) en s'inspirant de la barre qualité `docs/design-reference/comparateur-energie/`. Écrire palette + fonts + variantes structurelles (`niche.style`) + `niche.signature` dans `niche.config.ts`. Respecter les `antiPatterns` du preset.

Le site doit sortir de l'init avec une direction artistique **propre, distincte, adaptée à la niche** — un Claude Design sur-mesure pourra la remplacer plus tard pour un site qui performe.

### Dans les DEUX cas

**⚠️ Le design (livrable OU auto) NE DOIT PAS écraser `niche.config.ts.categories`** que tu viens d'écrire depuis les clusters Semrush. Le design fournit palette + fonts + signature DA + composants visuels — pas l'arborescence éditoriale.

---

## Étape 13 — Créer la scheduled task de rédaction quotidienne

Demander confirmation à l'utilisateur AVANT (effet de bord global Cowork).

TaskId : `[repoName]-article-daily`
Cron : selon cadence Bloc 3 (`0 8 * * *` par défaut)

Prompt de la task (gabarit) :

```
Tu es chargé de rédiger et publier UN seul nouvel article par run sur [siteName]
(repo `[repoOwner]/[repoName]`, branche `main`).

⚠️ RÈGLE ABSOLUE NON-SKIPPABLE : SERP analysis du mot-clé via WebSearch AVANT rédaction.
Top 3 Google.[market_tld] → content gap → exploitation. Pas de SERP = run échoué.

Miroir strict : N versions (une par locale). Si tu bloques sur une traduction, ne pousse RIEN.

# 0 — Lecture obligatoire
PROGRESS.md · niche.config.ts · content/calendrier-edito.md · content/ton-of-voice.md ·
content/mots-cles.md · content/concurrents.md · content/faq-base.md ·
skills/seo-geo-redaction · skills/humaniser-fr

# 1 — Choisir le sujet
Premier article non publié de content/calendrier-edito.md. Pas d'invention.

# 2 — SERP analysis OBLIGATOIRE (étape non-skippable)
WebSearch sur le head term. Top 3 → content gap documenté dans le commit.

# 3 — Brief + Outline + Rédaction FR (1000-1500 mots)
Voix [authorName]. ≥70% H2 questions. Answer-Explanation-Example. ≥3 signaux Expérience.
Sources autorité datées (priorité .[market_tld]).

# 4 — Images (cover + mid via mcp__nano-mentionbox__generate_image)
Fire-and-poll. Prompts ≤20 mots. WebP 1024×576.

# 5 — Traduction dans TOUTES les locales (miroir strict)
Slug naturel par langue. Alt FR/EN/NL.

# 6 — Mapping i18n
Couple FR↔EN↔NL dans lib/i18n/article-slugs.ts (ou équivalent).

# 7 — Commit atomique
Tous les fichiers MDX + mapping + images en UN commit.
Message : feat(content): publish [slug] (locales: fr+en+...)

# 8 — Update calendrier-edito.md
Marquer [x] + date.

# 9 — Update PROGRESS.md

# Hard rules
- JAMAIS publier sans SERP analysis (étape 2)
- JAMAIS publier dans une seule locale si miroir strict
- JAMAIS prompts image > 30 mots
- JAMAIS marques réelles dans prompts
- TOUJOURS alt FR + EN + NL
- TOUJOURS sources datées .[market_tld]

# Si échec : NE pousse RIEN. Ligne dans PROGRESS.md "Bloqué".

# Output final 8-12 lignes max.
```

---

## Étape 14 — PROGRESS.md + DECISIONS.md

Sections en tête. Inchangé vs v2.0. Documenter dans PROGRESS.md la DA retenue (livrable Claude Design intégré OU DA composée via AUTO-DESIGN : productType, palette, fonts, mode).

---

## Étape 15 — Commit atomique

UN commit avec tous les fichiers. Message Conventional Commits anglais.

---

## Étape 16 — Récap utilisateur

```
✓ Site bootstrappé.

Marché : [market]
Locales : [...] (miroir strict)
Clusters Semrush analysés : K (N keywords)
Categories proposées : 6
Calendrier : 50 articles classés par priorité
Auteur : [name + slug]
Design : intégré depuis design-incoming/ (X fichiers traités) OU DA composée via AUTO-DESIGN (productType + palette + fonts)
Scheduled task : [repoName]-article-daily, cron 0 8 * * *

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
- **NE JAMAIS laisser la palette/fonts par défaut** quand aucun design n'est fourni → exécuter `docs/AUTO-DESIGN.md`.
- **TOUJOURS un commit atomique**.
- **TOUJOURS demander confirmation** avant scheduled task.
- **TOUJOURS appliquer miroir strict** si `locales.length >= 2`.
- **TOUJOURS dériver categories des clusters Semrush** (jamais du design).
- **TOUJOURS inscrire règle SERP analysis** dans calendrier ET scheduled task.
- **NE PAS chercher de design.zip** dans `design-incoming/` (déjà extrait par le wizard).

---

## Lien avec les autres skills

- `init-site` v2 : alternatif sans init-spec.md (applique aussi AUTO-DESIGN si pas de design).
- `integrate-claude-design` : appelé à l'étape 12 (Cas A) si `design-incoming/` non vide. **Ne touche pas à `niche.config.ts.categories`**.
- `docs/AUTO-DESIGN.md` : exécuté à l'étape 12 (Cas B) si `design-incoming/` vide — compose la DA depuis `lib/da-presets/` + la référence énergie.
- `seo-geo-redaction`, `ton-of-voice`, `humaniser-fr` : utilisés par la scheduled task à chaque rédaction.
