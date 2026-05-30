---
name: configure-from-spec
version: 2.0.0
description: Configure un nouveau site fork-é depuis emd-template À PARTIR D'UN FICHIER SPEC pré-rempli par le wizard nano-mentionbox. Lit `init-spec.md` à la racine du repo, analyse les exports Semrush bruts dans `semrush-exports/` pour clusteriser les mots-clés et déterminer l'arborescence du site (categories), écrit `niche.config.ts` + tous les fichiers `content/*` + `docs/AUTHOR-*` en miroir dans toutes les locales, délègue à `integrate-claude-design` si `design-incoming/design.zip` est présent, génère un `content/calendrier-edito.md` avec 50 articles prêts à rédiger classés par priorité (volume × intent / KD), et crée la scheduled task de rédaction quotidienne avec la règle absolue de SERP analysis avant chaque article. À utiliser dans CE cas et CE cas SEULEMENT : un init-spec.md fraîchement poussé par le wizard est présent à la racine du repo et l'utilisateur dit explicitement « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration », « setup le repo ». Ne JAMAIS utiliser pour un site déjà configuré (niche.config.ts.market défini → utiliser init-site classique pour amender). Ne JAMAIS proposer ce skill si init-spec.md n'existe pas — proposer init-site à la place.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
---

# configure-from-spec v2 — Configurer un site depuis un init-spec.md du wizard

Ce skill prend en entrée un fichier `init-spec.md` à la racine du repo + (optionnel) des exports Semrush bruts dans `semrush-exports/` + (optionnel) un design Claude Design dans `design-incoming/design.zip`. Il produit en sortie une configuration complète du site en un seul commit atomique.

**Différence v1 → v2** : v2 lit les CSV Semrush pour clusteriser automatiquement les mots-clés, déterminer l'arborescence du site (`niche.config.ts.categories`) et générer un calendrier-edito.md avec 50 articles prêts à rédiger. La règle "SERP analysis obligatoire avant chaque article" est inscrite dans le calendrier ET dans le prompt de la scheduled task.

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
- `## Bloc 1 — Voix éditoriale` (YAML)
- `## Bloc 2 — Mots-clés` (positioning + références aux fichiers `semrush-exports/*.csv` + clusters manuels optionnels)
- `## Bloc 3 — Calendrier éditorial` (YAML)
- `## Bloc 4 — Concurrents`
- `## Bloc 5 — FAQ de base`
- `## Bloc 6 — Mentions légales` (YAML)
- `## Bloc 7 — Auteur` (YAML, optionnel)
- `## Design (Claude Design)` (optionnel)

Si une section critique manque (Bloc 0, 1, 6), arrêter et expliquer.

---

## Étape 2 — Validation sémantique

Avant d'écrire, vérifier la cohérence :

| Check | Action si échec |
|---|---|
| `market` ∈ ['BE', 'FR', 'CA', 'CH', autre ISO valide] | Demander confirmation |
| `locales[0]` === `defaultLocale` | Forcer alignement, prévenir |
| Si `localePrefix === 'as-needed'` → `locales.length >= 2` | Sinon retirer |
| Mentions légales : email contact présent | Bloquer si absent (RGPD) |
| Auteur (si présent) : slug en kebab-case | Forcer normalisation |
| Cohérence market ↔ locales | Demander confirmation si suspicieux |

Regrouper tous les warnings en un seul message avant d'écrire.

---

## Étape 3 — Analyser les exports Semrush (NOUVEAU v2)

### 3.1 Détection

```bash
ls semrush-exports/*.csv 2>/dev/null
```

Si présents, c'est la **source principale** pour les Bloc 2 + categories + calendrier. Lire chaque CSV avec :

```bash
head -1 semrush-exports/[file].csv  # header pour confirmer format
wc -l semrush-exports/*.csv         # nombre de lignes total
```

Format attendu Semrush : `Keyword, Intent, Volume, Keyword Difficulty, CPC (EUR), SERP Features` (l'ordre peut varier — vérifier le header).

### 3.2 Agrégation et dédoublonnage

Lire toutes les lignes des CSV. Pour chaque keyword :
- Normaliser : minuscules, retirer accents (`é` → `e`), normaliser apostrophes (`'` ≡ `'` ≡ rien), retirer espaces multiples
- Dédoublonner : si deux keywords ont la même forme normalisée, garder celle avec le plus haut volume
- Conserver les variants exactes dans un champ `aliases` pour le contenu plus tard

Si tu as plus de 2000 keywords après dédoublonnage : filtrer par volume ≥ 10 pour rester dans tes tokens. Mentionner cette troncature dans le `content/mots-cles.md` final.

### 3.3 Classification d'intent

Si la colonne Semrush Intent est vide (c'est fréquent), inférer toi-même :
- **informational** : commence par "comment", "pourquoi", "qu'est-ce que", "quel", "guide", "définition"
- **commercial** : contient "comparer", "vs", "meilleur", "avis", "test", "top", "classement"
- **transactional** : contient "prix", "tarif", "souscrire", "commander", "acheter", "abonnement"
- **navigational** : contient un nom de marque connue ou un nom de produit identifiable

### 3.4 Clustering sémantique

Grouper les keywords par thème en 5 à 10 clusters. Heuristique :
1. Identifier les **termes pivots** récurrents (les noms communs / verbes qui reviennent : "fournisseur", "prix", "comparateur", "changer", etc.)
2. Pour chaque keyword, choisir le pivot le plus représentatif → cluster correspondant
3. Si un keyword ne match aucun cluster, le mettre dans "Divers"
4. Fusionner les clusters de < 5 keywords avec leur voisin sémantique

Pour chaque cluster :
- **head term** : keyword avec volume max et KD ≤ 50 (si tous les KD sont > 50, garder le volume max)
- **longue traîne** : keywords de volume 30-500 du même cluster
- **quick wins** : keywords avec KD ≤ 30 ET volume ≥ 20 (à attaquer en priorité)
- **à éviter** : volume = 0 OU KD > 70

### 3.5 Détermination de l'arborescence du site (categories)

⚠️ **Règle absolue** : `niche.config.ts.categories` est TOUJOURS écrit par Claude depuis les clusters Semrush, même si un design Claude Design a été uploadé. Le design est en placeholder pour la nav — la vraie arborescence vient des données SEO.

Convertir les 5 à 8 clusters majeurs en categories :

```ts
categories: [
  {
    slug: 'cluster-1-slug',       // kebab-case, dérivé du nom du cluster
    label: 'Nom du cluster',
    accent: '#XXX',               // depuis design.tokens.palette si présent, sinon var(--accent-1..5) tournants
    description: 'Phrase courte décrivant ce que le silo couvre',
  },
  // ...
],
```

Choix du slug : version slugifiée du head term du cluster (ex : head term "fournisseur eau belgique" → slug "fournisseurs-eau"). Garder courts et SEO-friendly.

---

## Étape 4 — Écrire `niche.config.ts`

Mapping spec → niche.config.ts :

```ts
{
  siteName: spec.identity.siteName,
  domain: spec.identity.domain,
  tagline: spec.identity.tagline,

  // Vocabulaire de la niche — DÉRIVER des head terms des clusters
  // (au lieu de laisser TODO comme en v1)
  // Exemple : si le cluster principal est "fournisseur eau belgique" :
  //   entity: 'fournisseur d\'eau'
  //   entities: 'fournisseurs d\'eau'
  //   entityVerb: 'comparer'
  //   dealWord: 'offres'
  entity: '...',
  entities: '...',
  entityVerb: '...',
  dealWord: 'offres',

  // Hero — dériver du head term principal
  heroPrefix: 'Trouvez votre',  // ou similaire selon le verb
  heroSuffix: 'en 10 minutes',
  rotatingWords: [/* 4-6 head terms variantes des clusters majeurs */],
  subtitle: spec.identity.tagline,
  ctaPrimary: { text: 'Comparer →', url: '/comparer' },
  ctaSecondary: { text: 'Quiz', url: '/quiz' },

  // Categories — depuis l'Étape 3.5 (clusters Semrush)
  categories: [/* 5-8 entries */],

  // Style et palette — depuis design si présent, sinon placeholders
  style: { mode: 'light', hero: 'split', effects: 'subtle', cards: 'bordered', uiStyle: '' },
  palette: spec.design?.extractedTokens?.palette ?? niche.palette,
  fonts: spec.design?.extractedTokens?.fonts ?? { display: 'Unbounded', body: 'Inter' },

  // Auteur depuis Bloc 7 si présent
  author: spec.block6_7?.author ? { ... } : { name: '', slug: '', /* ... */ },

  // i18n — Bloc 0 — PILOTE TOUT
  market: spec.block0.market,
  defaultLocale: spec.block0.defaultLocale,
  locales: spec.block0.locales,
  localePrefix: spec.block0.locales.length >= 2 ? 'as-needed' : undefined,

  // Signature DA
  signature: spec.design?.extractedTokens?.signature ?? { anchor: '', oneRule: '', inspiration: [], forbidden: [], components: [] },

  vercelRegion: 'fra1',
  repo: `${spec.identity.repoOwner}/${spec.identity.repoName}`,
  branch: 'main',

  affiliateTag: '',
  defaultStore: 'Amazon',

  logo: spec.identity.siteName,
  homeSections: ['ticker', 'deals', 'articles', 'categories', 'tools', 'author'],
}
```

Tu peux dériver `entity`, `entities`, `entityVerb`, `heroPrefix`, `rotatingWords` directement des clusters Semrush — pas besoin de laisser des TODO si les clusters sont assez clairs. Marquer TODO uniquement si ambigu.

---

## Étape 5 — Écrire `content/mots-cles.md` (enrichi v2)

Format :

```markdown
# Mots-clés — [siteName]

## Positionnement

[spec.block2.positioning]

## Méthodologie

Mots-clés agrégés depuis N exports Semrush (`semrush-exports/*.csv`) sur le marché [market].
Après dédoublonnage (variants accents/apostrophes) et filtrage volume ≥ 10 : K keywords retenus.
Classification d'intent inférée quand absente du Semrush original.

## Clusters

### Cluster 1 — [Nom du cluster]

- **Head term** : `[keyword]` (vol: X, KD: Y, intent: informational|commercial|transactional)
- **Quick wins** (KD ≤ 30, à attaquer en priorité) :
  - `[keyword]` (vol: X, KD: Y)
  - ...
- **Longue traîne** (vol 30-500) :
  - `[keyword]` (vol: X, KD: Y)
  - ...
- **À éviter** (vol = 0 ou KD > 70) :
  - `[keyword]` (KD: Y)

### Cluster 2 — ...

[idem pour chaque cluster]

## Mots-clés transversaux (Divers)

[keywords qui n'entrent dans aucun cluster majeur]

## Exports bruts

Fichiers source dans `semrush-exports/` :
- `[filename1].csv` — N keywords, vol min/max X/Y
- ...
```

---

## Étape 6 — Écrire `content/calendrier-edito.md` (enrichi v2 avec 50 articles)

⚠️ **Règle absolue à inscrire en tête du fichier** : la SERP analysis du mot-clé via WebSearch est OBLIGATOIRE avant chaque rédaction. Pas optionnel.

Format :

```markdown
# Calendrier éditorial — [siteName]

> ⚠️ RÈGLE ABSOLUE — Chaque article publié exige une SERP analysis du mot-clé via WebSearch
> AVANT rédaction. Lire les 3 premiers résultats Google.[market_tld] → titre exact, chapô,
> longueur, H2 visibles, FAQ présente, schemas détectés → identifier le content gap →
> l'exploiter dans l'article. Cette règle est non-skippable. Pas de SERP analysis = run échoué.
>
> Le pipeline de la scheduled task `[repo]-article-daily` inscrit déjà cette règle dans son
> prompt. Si rédaction manuelle, l'auteur applique la règle aussi.

## Cadence

- Cible : [spec.block3.cadenceCible]
- Plancher : [spec.block3.cadencePlancher]
- Locales miroir : [spec.block0.locales.join(', ')] — chaque article publié dans toutes les locales

## Formats récurrents

| Format | Longueur cible | Fréquence |
|---|---|---|
| [name] | [longueurCible] | [frequence] |

## Rotation d'angles

[spec.block3.rotationAngles bullet list]

## Refresh policy

[spec.block3.refreshPolicy]

---

## Calendrier — 50 premiers articles à rédiger

Classés par priorité = volume × (intent commercial = 2, transactional = 1.5, informational = 1) / max(KD, 1).
Chaque ligne = 1 article (= N traductions en miroir strict).

### Cluster 1 — [Nom]

1. **[Head term]** — vol: X, KD: Y, intent: ... | Format suggéré : [guide/comparatif/FAQ]
2. **[Quick win 1]** — ...
3. **[Quick win 2]** — ...
4. **[Longue traîne 1]** — ...
5. **[Longue traîne 2]** — ...

### Cluster 2 — ...

[10 articles par cluster majeur, jusqu'à 50 au total]

---

## Comment l'utiliser

- La scheduled task `[repo]-article-daily` consomme cette liste **dans l'ordre** chaque matin.
- Quand un article est publié, marquer la ligne avec `[x]` et la date.
- Au-delà des 50 articles initiaux, Claude peut générer de nouvelles entrées à partir des
  CSV `semrush-exports/` ou de nouveaux exports Semrush ajoutés ultérieurement.
```

---

## Étape 7 — Écrire `content/ton-of-voice.md`

À partir du Bloc 1, gabarit standard `skills/ton-of-voice`. Si `voiceMode === 'per-language'` : créer aussi `content/ton-of-voice.[locale].md` avec TODO sur les adaptations.

---

## Étape 8 — Écrire `content/concurrents.md`

À partir du Bloc 4 + (si données issues des CSV) ajouter une section "Concurrents détectés via SERP analyses" avec les domaines récurrents observés dans les SERP Features.

---

## Étape 9 — Écrire `content/faq-base.md`

À partir du Bloc 5.

---

## Étape 10 — Écrire `content/pages/mentions-legales.yaml`

À partir du Bloc 6 + variantes locales si N langues (miroir strict).

---

## Étape 11 — Écrire `docs/AUTHOR-[slug].md` (si Bloc 7 présent)

À partir du Bloc 7.

---

## Étape 12 — Intégrer le design (si présent)

Si `design-incoming/design.zip` existe :
1. `cd design-incoming && unzip -o design.zip && rm design.zip`
2. Déléguer à `integrate-claude-design`

**Important v2** : `integrate-claude-design` ne doit PAS écraser `niche.config.ts.categories` que tu viens d'écrire depuis les clusters Semrush. Le design fournit la palette, les fonts, la signature DA, les composants visuels — pas l'arborescence éditoriale.

---

## Étape 13 — Créer la scheduled task de rédaction quotidienne

Demander confirmation à l'utilisateur AVANT de créer la task (effet de bord global Cowork).

TaskId : `[repoName]-article-daily`
Cron : selon cadence Bloc 3 (`0 8 * * *` par défaut pour 1/jour)

Prompt de la task à inscrire (gabarit ci-dessous, à adapter selon le site) :

```
Tu es chargé de rédiger et publier UN seul nouvel article de blog par run sur le site [siteName]
(repo `[repoOwner]/[repoName]`, branche obligatoire : `main`).

⚠️ RÈGLE ABSOLUE NON-SKIPPABLE : SERP analysis du mot-clé via WebSearch AVANT rédaction.
Lire les 3 premiers résultats Google.[market_tld] → titre exact, chapô, longueur, H2 visibles,
FAQ présente, schemas détectés → identifier le content gap → l'exploiter dans l'article.
Pas de SERP analysis = run échoué (ne PAS pousser).

Miroir strict : génère N versions (une par locale dans niche.config.ts.locales). Si tu produis
le FR mais bloques sur la traduction EN/NL, ne pousse RIEN. Mieux vaut un run skippé qu'un
miroir cassé.

# 0 — Lecture obligatoire avant tout
- PROGRESS.md (ne pas doublonner)
- niche.config.ts (locales, market, author, categories)
- content/calendrier-edito.md (sujet suivant à attaquer — marqué non publié)
- content/ton-of-voice.md (voix)
- content/mots-cles.md (clusters complets)
- content/concurrents.md (anti-modèles)
- content/faq-base.md (Q-R réutilisables)
- skills/seo-geo-redaction/SKILL.md (procédure complète)
- skills/humaniser-fr/SKILL.md (anti-IA mode production)

# 1 — Choisir le sujet
Prendre le PREMIER article non publié du calendrier-edito.md. Pas d'invention.

# 2 — SERP analysis OBLIGATOIRE
WebSearch sur le head term. Top 3 → analyse + content gap (2-3 lignes documentées dans le commit).

# 3 — Brief + Outline + Rédaction FR (1000-1500 mots)
Voix [authorName]. ≥70% H2 questions. Answer-Explanation-Example. ≥3 signaux Expérience.
Sources autorité datées (priorité .[market_tld]).

# 4 — Images (cover + mid via mcp__nano-mentionbox__generate_image)
Pattern fire-and-poll. Prompts ≤20 mots. WebP 1024×576.

# 5 — Traduction dans TOUTES les locales (miroir strict)
Slug naturel par langue. Frontmatter alt FR/EN/NL pour chaque image.

# 6 — Mapping i18n (lib/i18n/article-slugs.ts ou équivalent)
Couple FR↔EN↔NL ajouté. Sinon hreflang cassé.

# 7 — Commit atomique
Tous les fichiers MDX + mapping i18n + images en UN commit.
Message : feat(content): publish [slug] (locales: fr+en+nl)

# 8 — Update calendrier-edito.md
Marquer la ligne du sujet avec [x] + date du jour.

# 9 — Update PROGRESS.md
Bloc complété de la session.

# Hard rules
- JAMAIS publier sans SERP analysis (étape 2)
- JAMAIS publier FR sans EN sans NL si miroir strict
- JAMAIS prompts image > 30 mots
- JAMAIS noms de marques dans prompts (génère faux numéros)
- JAMAIS plus de 2 images en parallèle (saturation Gemini)
- TOUJOURS alt FR + EN + NL sur chaque image
- TOUJOURS sources datées .[market_tld] prioritaires

# Si échec partiel : NE pousse RIEN. Ajoute une ligne dans PROGRESS.md "Bloqué" et termine proprement.

# Output final 8-12 lignes max :
- slug publié + locales
- catégorie + cluster
- head term
- content gap SERP (1 ligne)
- mots FR/EN/NL
- commit URL
- coût images
- score humaniser-fr (Oui/Non + 1 ligne)
```

---

## Étape 14 — PROGRESS.md + DECISIONS.md

PROGRESS.md en tête :

```markdown
## Complété — Session YYYY-MM-DD (configure-from-spec v2)

Site bootstrappé depuis init-spec.md + N CSV Semrush.

- [x] niche.config.ts (market: XX, locales: [...], localePrefix: ..., K categories dérivées des clusters Semrush)
- [x] content/ton-of-voice.md
- [x] content/mots-cles.md (X clusters, Y keywords)
- [x] content/calendrier-edito.md (50 articles prêts, règle SERP analysis inscrite)
- [x] content/concurrents.md
- [x] content/faq-base.md
- [x] content/pages/mentions-legales.yaml + variantes
- [x] docs/AUTHOR-[slug].md (si auteur)
- [x] Design intégré (si présent)
- [x] Scheduled task [repoName]-article-daily créée

## En cours
- [ ] Valider l'arborescence proposée en niche.config.ts.categories
- [ ] Compléter les éventuels TODO restants
- [ ] pnpm dev → vérifier rendu local
- [ ] Premier déploiement Vercel
- [ ] Run now sur la scheduled task pour valider le pipeline complet
```

DECISIONS.md créé avec sections "Tranchées (Bloc 0)", "Catégories Semrush", "Calendrier édito", "Auteur", "Miroir strict".

---

## Étape 15 — Commit atomique

UN commit avec tous les fichiers. Message :

```
feat(init): bootstrap site from nano-mentionbox spec v2

Generated via configure-from-spec skill v2 from init-spec.md + Semrush exports.
- niche.config.ts: market=XX, locales=[fr,en], localePrefix=as-needed, K categories
- 7 content files written (ton-of-voice, mots-cles, calendrier-edito,
  concurrents, faq-base, mentions-legales, author)
- 50 articles in content/calendrier-edito.md classified by priority
- Design integrated from design-incoming/ (if applicable)
- Scheduled task [repoName]-article-daily created (SERP analysis enforced)

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Étape 16 — Récap utilisateur

```
✓ Site bootstrappé en 1 commit.

Marché : [market]
Locales : [...] (miroir strict)
Clusters Semrush analysés : K (N keywords)
Categories proposées : 6
Calendrier : 50 articles classés par priorité, prêts à publier
Auteur : [name + slug]
Design : intégré (OU à intégrer plus tard)
Scheduled task : [repoName]-article-daily, cron 0 8 * * *
  → premier run demain matin 8h
  → règle SERP analysis enforced dans le prompt

Prochaines étapes :
1. Valider l'arborescence proposée (niche.config.ts.categories)
2. pnpm dev → vérifier rendu local
3. Premier déploiement Vercel
4. (optionnel) Run now sur la scheduled task pour pré-approuver les tools

Lien repo : https://github.com/[owner]/[name]
```

---

## Règles strictes

- **NE JAMAIS exécuter** sans `init-spec.md`.
- **NE JAMAIS écraser** un `niche.config.ts` déjà rempli sans confirmation.
- **NE JAMAIS inventer** si le spec est incomplet → TODO + avertir.
- **TOUJOURS un commit atomique**.
- **TOUJOURS demander confirmation** avant de créer la scheduled task.
- **TOUJOURS appliquer le miroir strict** si `locales.length >= 2`.
- **TOUJOURS dériver les categories des clusters Semrush** (jamais du design Claude, qui est en placeholder).
- **TOUJOURS inscrire la règle SERP analysis** dans le calendrier ET dans le prompt de la scheduled task. Non-skippable.

---

## Si spec partiellement rempli ou pas de CSV

- **Pas de CSV Semrush** : utiliser uniquement les clusters manuels du Bloc 2. Si Bloc 2 vide aussi, écrire un calendrier-edito.md avec un TODO "Ajouter des exports Semrush via le wizard mode édition pour générer le calendrier auto" et créer la scheduled task quand même (elle attendra qu'un calendrier soit présent pour démarrer).
- **Blocs manquants** : laisser TODO, marquer dans PROGRESS.md "Bloqué", ne PAS créer la scheduled task si Bloc 0/1/3/6 manquent.

---

## Lien avec les autres skills

- `init-site` v2 : skill alternatif sans init-spec.md (interview manuel).
- `integrate-claude-design` : appelé à l'étape 12 si design uploadé. **Ne touche pas à `niche.config.ts.categories`** (déjà écrites depuis les clusters Semrush).
- `seo-geo-redaction`, `ton-of-voice`, `humaniser-fr` : utilisés par la scheduled task à chaque rédaction.
- La règle SERP analysis du Bloc 2 / calendrier / scheduled task est en synergie avec `seo-geo-redaction` §0.3 SERP analysis.
