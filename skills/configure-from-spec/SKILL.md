---
name: configure-from-spec
version: 2.7.0
description: Configure un nouveau site fork-é depuis emd-template À PARTIR D'UN FICHIER SPEC pré-rempli par le wizard nano-mentionbox. Lit `init-spec.md` à la racine du repo, analyse les exports Semrush bruts dans `semrush-exports/` pour clusteriser les mots-clés et déterminer l'arborescence du site (categories), écrit `niche.config.ts` + tous les fichiers `content/*` (dont `content/personas.md` auto-dérivé) + `docs/AUTHOR-*` en miroir dans toutes les locales, délègue à `integrate-claude-design` si `design-incoming/` contient des fichiers OU exécute `docs/AUTO-DESIGN.md` pour reproduire la structure + appliquer un skin Voltéo si aucun design n'est fourni, génère les images structurelles via le MCP nano-mentionbox, génère un `content/calendrier-edito.md` avec 50 articles classés par priorité, et crée la scheduled task de rédaction quotidienne selon `docs/SCHEDULED-TASK-REDACTION.md`. À utiliser dans CE cas et CE cas SEULEMENT : un init-spec.md fraîchement poussé par le wizard est présent à la racine du repo et l'utilisateur dit explicitement « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration », « setup le repo ». Ne JAMAIS utiliser pour un site déjà configuré (niche.config.ts.market défini → utiliser init-site classique pour amender). Ne JAMAIS proposer ce skill si init-spec.md n'existe pas — proposer init-site à la place.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
  - mcp__nano-mentionbox__generate_image
  - mcp__nano-mentionbox__wait_for_image
  - mcp__nano-mentionbox__github_push_images
---

# configure-from-spec v2.7 — Configurer un site depuis un init-spec.md du wizard

> **Changement v2.6 → v2.7** : étape 12 (Design) — la **STRUCTURE des pages** Voltéo (sections + ordre,
> à partir des HTML de référence `docs/design-reference/volteo/`) devient une sous-étape **non sautable**,
> en plus des tokens. Appliquer seulement les couleurs sur le squelette par défaut = bug d'init.
>
> **Changement v2.5 → v2.6** : étape 12 (Design) passe à la **doctrine Voltéo** — lire `skin` + `vertical`
> du bloc `## Design`, appliquer le **bloc prêt à coller** du skin, puis muter (au lieu de composer via
> `composePreset`). Source design unique : `docs/design-reference/volteo/`.
>
> **Changement v2.4 → v2.5** : **Chemin wizard = zéro question.** La présence d'`init-spec.md`
> vaut consentement : le skill déroule TOUT d'une traite — y compris la création de la scheduled
> task (étape 13) — **sans demander de confirmation**. Il ne s'arrête QUE sur un vrai bloqueur
> (MCP absent, ou champ critique manquant dans la spec). But : stagiaire remplit le wizard →
> `/nouveau-site` → site fini + tâche programmée, sans rien valider.

Ce skill prend en entrée un `init-spec.md` à la racine + (optionnel) des exports Semrush dans `semrush-exports/` + (optionnel) un dossier `design-incoming/`. Il produit une configuration complète du site en un seul commit atomique, **sans interview**.

## Pré-requis vérifiés au démarrage (les seuls points d'arrêt autorisés)

1. **`init-spec.md` existe** à la racine. Si absent → ne PAS exécuter, proposer `init-site`.
2. **MCP nano-mentionbox disponible** (`mcp__nano-mentionbox__generate_image`). Si absent → STOP : sans lui, le site sort sans images = échec d'init. Demander de brancher le MCP, puis reprendre.
3. **Champs critiques de la spec présents** : Bloc 0 (marché + langues), Bloc 1 (voix), Bloc 6 (mentions légales avec email contact). Si l'un manque → STOP et expliquer précisément ce qui manque.
4. **`niche.config.ts.market` vide ou placeholder.** S'il est déjà rempli (site déjà configuré) → STOP et demander, pour ne pas écraser un site existant.

En dehors de ces 4 points, **ne JAMAIS s'interrompre pour demander une validation** : la spec fait foi.

---

## Étape 1 — Parser le init-spec.md

Lire `init-spec.md`. Sections Markdown avec codeblocks YAML :
`## Identité du site`, `## Bloc 0 — Marché et langues`, `## Bloc 1 — Voix éditoriale`,
`## Bloc 2 — Mots-clés`, `## Bloc 3 — Calendrier éditorial`, `## Bloc 4 — Concurrents`,
`## Bloc 5 — FAQ de base`, `## Bloc 6 — Mentions légales`, `## Bloc 7 — Auteur` (optionnel),
`## Design`.

**Détecter les modes AUTO** : si un bloc porte "🤖 **Mode AUTO**" en tête, suivre ses directives et NE PAS chercher un YAML normal.

---

## Étape 2 — Validation sémantique

| Check | Action si échec |
|---|---|
| `market` ∈ ['BE','FR','CA','CH', ISO valide] | Corriger au plus proche, noter dans PROGRESS |
| `locales[0]` === `defaultLocale` | Forcer alignement (silencieux) |
| `localePrefix === 'as-needed'` → `locales.length >= 2` | Sinon retirer (silencieux) |
| Mentions légales : email contact présent | **STOP** (RGPD) — c'est un bloqueur |
| Auteur (si présent) : slug kebab-case | Normaliser (silencieux) |

Les incohérences mineures se corrigent **sans demander** (et se notent dans PROGRESS.md). Seul un champ critique manquant (cf. pré-requis 3) arrête le run.

---

## Étape 3 — Analyser les exports Semrush

### 3.1 Détection
```bash
ls semrush-exports/*.csv 2>/dev/null
```
Format Semrush : `Keyword, Intent, Volume, Keyword Difficulty, CPC (EUR), SERP Features`.

### 3.2 Agrégation et dédoublonnage
Normaliser (minuscules, sans accents, apostrophes), dédoublonner (garder volume max), variants en `aliases`. Si > 2000 keywords : filtrer volume ≥ 10, documenter la troncature.

### 3.3 Classification d'intent (si colonne Intent vide)
- **informational** : comment, pourquoi, qu'est-ce que, quel, guide, définition
- **commercial** : comparer, vs, meilleur, avis, test, top, classement
- **transactional** : prix, tarif, souscrire, commander, acheter, abonnement
- **navigational** : marque ou produit identifiable

### 3.4 Clustering sémantique
5 à 10 clusters. Pour chacun : head term (volume max, KD ≤ 50), longue traîne (30-500), quick wins (KD ≤ 30 ET volume ≥ 20), à éviter (volume 0 OU KD > 70).

### 3.5 Arborescence du site
⚠️ `niche.config.ts.categories` est TOUJOURS écrit depuis les clusters Semrush, même si un design est présent. Convertir 5-8 clusters majeurs en categories (slug kebab-case dérivé du head term).

---

## Étape 4 — Écrire `niche.config.ts`
Mapping spec → config. Dériver `entity`, `entities`, `entityVerb`, `heroPrefix`, `rotatingWords` des clusters. TODO uniquement si réellement ambigu (et noté dans PROGRESS).

## Étape 5 — Écrire `content/mots-cles.md`
Positionnement, méthodologie, clusters (tableaux head/longue traîne/quick wins/à éviter), divers, références aux CSV.

## Étape 6 — Écrire `content/calendrier-edito.md` (50 articles)
En tête : « ⚠️ RÈGLE ABSOLUE — SERP analysis via WebSearch OBLIGATOIRE avant rédaction. » 50 articles classés par priorité = volume × (commercial 2, transactional 1.5, informational 1) / max(KD, 1). 10 par cluster majeur.

## Étape 7 — Écrire `content/ton-of-voice.md`
Depuis le Bloc 1 (manuel) OU dérivé marché/concurrents/clusters (auto). Variantes par locale si `voiceMode === 'per-language'`.

## Étape 7bis — Écrire `content/personas.md` (auto-dérivé)
`seo-geo-redaction` exige ce fichier. Le **dériver** (sans question) de l'audience (Bloc 1) + clusters/intentions (mots-cles) + marché. 2 à 4 personas : situation, expertise, vocabulaire, déclencheur d'achat, et « Questions par étape de funnel » (découverte/comparaison/décision). Archétypes ancrés dans les clusters réels, pas de démographie inventée.

## Étape 8 — Écrire `content/concurrents.md`
Bloc 4 (manuel) OU dérivé via WebSearch sur les head terms (auto).

## Étape 9 — Écrire `content/faq-base.md`
Toujours auto : simuler les PAA Google.[market_tld] des head terms, regrouper en 3-5 thèmes, réponses 2-4 phrases factuelles (cf. `humaniser-fr`).

## Étape 10 — Écrire `content/pages/mentions-legales.yaml`
Bloc 6 + variantes locales si N langues.

## Étape 11 — Écrire `docs/AUTHOR-[slug].md` (si Bloc 7)

---

## Étape 12 — Design : intégrer le livrable OU reproduire + appliquer un skin Voltéo

```bash
ls -la design-incoming/ 2>/dev/null
```

- **`design-incoming/` non vide** → déléguer à `integrate-claude-design` (NE PAS `unzip`, déjà extrait).
- **`design-incoming/` vide** → exécuter `docs/AUTO-DESIGN.md` (**doctrine Voltéo**). Lire le bloc `## Design`
  de la spec (`archetype`, `skin`, `vertical`, `brandColor`) puis :
  1. **Template** depuis `archetype` (comparateur/magazine/hybride) → `niche.style.hero` + `homeSections` + **la structure des pages**.
  2. **Reproduire la STRUCTURE (NON négociable)** : reconstruire les composants du moteur (`components/`,
     `app/`) pour produire **les sections + l'ordre** des pages HTML de référence du template
     (`docs/design-reference/volteo/DESIGN-NOTES.md` §0) : `home-comparateur.html` **ou**
     `home-magazine.html` (home), `hub-categorie.html` (`/blog` + `/blog/[categorie]`), `article.html`
     (`/blog/[categorie]/[slug]`). Appliquer seulement les couleurs sur le squelette par défaut = bug d'init.
  3. **Appliquer le skin (tokens)** : copier le **bloc prêt à coller** du `skin` (V1–V4) depuis
     `docs/design-reference/volteo/DESIGN-NOTES.md` §5 dans `niche.palette`/`niche.fonts`/`niche.style` ;
     reporter la `vertical` (§4) dans les accents catégorie ; reporter rayons + correctifs (§3b — V3
     angles 0/zéro ombre, V4 sections sombres) dans `app/globals.css`.
  4. Si `skin`/`vertical` valent `auto` ou manquent → les **déduire** de la niche (intent des clusters).
  5. **Muter** (teinte/fonts/rayons — §6), écrire `niche.signature` (anchor/oneRule/forbidden — `docs/DA-ANTI-IA.md`),
     dérouler la **checklist** (§7). **JAMAIS** les placeholders par défaut, **ni** la structure par défaut, **ni** un clone brut du skin.
     (Fallback `lib/da-presets/` seulement si aucun skin ne colle — `docs/DA-PRESETS.md`.)

**Images structurelles (les deux cas)** : après la DA, générer hero + fonds par catégorie via `mcp__nano-mentionbox__generate_image` (fire-and-poll → `wait_for_image`), prompts + `lib/image-slots.ts` alignés sur le **skin appliqué**, push WebP via `mcp__nano-mentionbox__github_push_images` sous `public/images/`. Cf. `docs/IMAGES-WORKFLOW.md`. Site neuf en placeholders = bug.

⚠️ Le design NE DOIT PAS écraser `niche.config.ts.categories` (issu des clusters Semrush).

---

## Étape 13 — Créer la scheduled task de rédaction quotidienne (SANS demander)

**Chemin wizard = la spec vaut consentement.** Créer la tâche **directement, sans confirmation**, en suivant le gabarit canonique `docs/SCHEDULED-TASK-REDACTION.md` : remplacer les `[placeholders]` depuis `niche.config.ts` + la spec (`[siteName]`, `[repoOwner]/[repoName]`, `[market]`, `[authorName]`, `[authorSlug]`, `[locales]`, `[cron]`). Ne PAS réécrire un prompt à la main.

- TaskId : `[repoName]-article-daily`
- Cron : cadence du Bloc 3 (`0 8 * * *` par défaut)

(La confirmation n'est demandée que dans le chemin SANS spec — c'est `init-site` qui gère ce cas.)

---

## Étape 14 — PROGRESS.md + DECISIONS.md
Documenter la DA retenue (template, skin, verticale, structure reproduite, mutations), les images générées, les corrections silencieuses faites à l'étape 2.

## Étape 15 — Commit atomique
UN commit, message Conventional Commits anglais.

## Étape 16 — Récap utilisateur
```
✓ Site bootstrappé (zéro question — spec wizard).
Marché : [market] · Locales : [...] · Clusters : K (N keywords)
Categories : 6 · Personas : [N] (auto) · Calendrier : 50 articles
Design : intégré OU skin Voltéo appliqué ([template] · [Vn] · [verticale] · structure reproduite · muté)
Images structurelles : générées · Scheduled task : [repoName]-article-daily (cron 0 8 * * *)
Repo : https://github.com/[owner]/[name]
Prochaines étapes : valider categories · pnpm dev · déploiement Vercel · Run now sur la tâche
```

---

## Règles strictes

- **NE JAMAIS exécuter** sans `init-spec.md`.
- **NE JAMAIS écraser** un `niche.config.ts` rempli sans STOP.
- **Chemin wizard = zéro question** : ne s'arrêter QUE sur les 4 pré-requis bloqueurs. Tout le reste se décide et se note, sans demander.
- **NE JAMAIS laisser la palette/fonts par défaut**, **ni la structure de pages par défaut** du moteur, ni un **clone brut d'un skin**, ni un site en placeholders.
- **TOUJOURS** un commit atomique · miroir strict si `locales.length >= 2` · categories dérivées des clusters Semrush · scheduled task depuis le gabarit canonique.

## Lien avec les autres skills / docs
`nouveau-site` (routeur) · `init-site` (chemin sans spec, AVEC confirmations) · `integrate-claude-design` (étape 12 cas A) · `docs/AUTO-DESIGN.md` (doctrine Voltéo) · `docs/design-reference/volteo/DESIGN-NOTES.md` · `docs/IMAGES-WORKFLOW.md` · `docs/SCHEDULED-TASK-REDACTION.md` · `seo-geo-redaction` + `ton-of-voice` + `humaniser-fr` (rédaction).
