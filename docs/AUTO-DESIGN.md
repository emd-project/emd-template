# AUTO-DESIGN — DA à l'init (doctrine Voltéo v2 : assemblage + preview)

> **Voltéo est le DÉFAUT du moteur** (les composants RSC produisent déjà la structure). On ne recopie
> rien : on **réutilise les composants** et on **compose un mix unique** par site. Détail complet :
> **[`docs/design-reference/volteo/DESIGN-NOTES.md`](design-reference/volteo/README.md)**.
> Les 5 directions de départ : **[`docs/DA-DIRECTIONS.md`](DA-DIRECTIONS.md)**.

## Quand exécuter

Init (`configure-from-spec` ou `init-site`, via `nouveau-site`), si `design-incoming/` est vide.
- `design-incoming/` non vide → `integrate-claude-design`.
- vide → dérouler les phases ci-dessous.

---

## Unicité par ASSEMBLAGE (pas par skin)

Trois leviers (cf. DESIGN-NOTES §0) :
1. **Type de home** selon l'intent : `comparateur` (transactionnel) · `magazine` (informationnel, défaut) · `portail`. Piloté par `niche.style.hero` (`split` → comparateur ; `centered`/`minimal` → magazine).
2. **Mixage des variantes** : étudier `docs/design-reference/volteo/*-V1..V4` + `marche`/`fil`/`portail`, **puiser et recombiner** des traitements (hero, ordre des sections, anims) — **jamais copier** une variante.
3. **Tokens mutés** via **`niche.config.palette` → tokens `app/globals.css :root`** (`--accent-1..5`, `--bg-*`, `--text-*`, `--border*`, `--radius-*`) + fonts dans `app/layout.tsx`. Direction de départ + valeurs : **[`DA-DIRECTIONS.md`](DA-DIRECTIONS.md)**.

> ⚠️ **`app/styles/volteo.css :root` est une couche d'ALIAS vers `globals.css` — NE JAMAIS y écrire de
> valeurs.** La source unique de la DA est `niche.config.palette` (couleurs) + `layout.tsx` (fonts).

---

## Système de VARIANTES (squelettes + permutations + animation)

Depuis v2.1, les squelettes de page sont **sélectionnables** (plus besoin de recombiner à la main) et
l'unicité vient de **(squelette choisi) × (permutations de tokens) × (palette/fonts)**.

### 1. Squelettes disponibles (resolver : `lib/variants.ts`)
- **Home** : `magazine` · `comparateur` · `marche` (« Marché en direct », terminal + ticker, **nécessite `classements.json`**) · `fil` (« Le fil », breaking + une + fil live).
- **Catégorie** : `classic` (hub + grille) · `editorial` (une-à-la-une + petit fil).
- **Article** : `classic` (sommaire + prose).
- Pilotés par `niche.config.layouts.{home,category,article}`. Absent → fallback sûr (style.hero / classic).
- **Preview** (noindex, dev) : `/home-v1..4`, `/cat-v1..2`, `/art-v1` (+ équivalents `/en/...`).

### 2. Permutations structurelles (token-only, `PermutationStyle`)
`niche.config.permutations` surcharge des tokens via un `<style>` injecté en `!important` (theme-safe,
**jamais** dans volteo.css) :
- `shape`  : `rounded` (défaut) | `soft` | `sharp`  → `--radius-*`
- `border` : `standard` (défaut) | `hairline` | `bold` → `--border`, `--border-strong`
- `shadow` : `standard` (défaut) | `flat` | `deep`  → `--shadow-*`

### 3. Sélection AUTO déterministe (anti-empreinte)
À l'init, appeler **`suggestVariants(niche.domain)`** (`lib/variants.ts`) : hash FNV-1a du domaine →
combinaison stable et **distincte par site** `{ home, category, shape, border, shadow }`. Deux forks de
domaines différents divergent automatiquement.
- Claude **ÉCRIT** le résultat dans `niche.config` (`layouts` + `permutations`). Le runtime ne fait que LIRE.
- **Override thématique** (prioritaire sur le seed) : média/actu → `fil` ; comparateur/prix avec classements générés → `marche` ; sinon `magazine`/`comparateur`. `marche` est exclu du tirage auto (dépend de `classements.json`).
- **Dépublication** : une fois la variante choisie, **supprimer les routes preview non retenues** (`/home-vN`, `/cat-vN`, `/art-v1` + `/en/...`).

### 4. Animation globale (UNIQUE, même partout)
`app/styles/volteo-motion.css` : révélation « fade-up » au scroll, **100 % CSS** (scroll-driven
`animation-timeline: view()`), **zéro JS**, `@supports` + `prefers-reduced-motion` (dégradation
gracieuse, aucun risque SEO, contenu jamais caché sans JS). Ciblée sur les sections de contenu (pas
les hero/nav/sticky). **Ne pas** créer de variantes d'animation : elle est volontairement identique partout.

---

## PHASE 1 — PREVIEW (valider le design AVANT de tout construire)

1. Choisir le **squelette** (via `suggestVariants` + override thématique) + appliquer/**muter** les
   **tokens** via **`niche.config.palette` → `globals.css`** (+ fonts) + écrire `permutations`.
2. Construire **le strict minimum pour VOIR** : **la home** + **UN** hub/catégorie + **UN** article —
   en **contenu bouchon** + **images placeholder**, **AUCUNE génération d'images** (1 hero max).
3. **STOP.** Annoncer : squelette retenu (et pourquoi), permutations appliquées, direction DA + mutations.
   **Montrer le preview et ATTENDRE la validation.**

> **INTERDIT en preview** : bâtir toute l'arborescence, générer toutes les images, écrire tous les
> articles, créer la tâche de rédaction. On valide d'abord la **direction visuelle**.

---

## PHASE 2 — BUILD (seulement après validation du design)

Après « ok » de l'utilisateur :
- **dépublier les previews** non retenues (variantes) ;
- créer **toute l'arborescence** (catégories, pages, articles d'amorçage) ;
- générer les images **dans le plafond** : **≤ ~5** ;
- le **logo & favicon** = **mark SVG sur mesure + wordmark** ;
- écrire le contenu réel **sourcé** ;
- créer la **tâche de rédaction** quotidienne.

---

## Checklist (fin de PREVIEW, avant validation)

Cf. **DESIGN-NOTES §5** : squelette cohérent avec l'intent · `permutations` écrites (shape/border/shadow) ·
tokens appliqués via **`niche.config.palette` → `globals.css`** + fonts, **mutés** (**rien dans `volteo.css :root`**) ·
direction choisie parmi les 5 · mode **light OU dark fixe** · logo = mark SVG + wordmark · contraste AA ·
preview = home + 1 hub + 1 article en **placeholders, zéro image générée** · **rien d'autre construit** ·
**validation demandée**.

Un init qui « build tout + génère les images » **avant** validation = **bug d'init**.
Un site en **clone d'une variante**, en **tokens bruts d'un skin**, ou avec une **valeur écrite dans
`volteo.css :root`** = **bug d'init**.

Garde-fous anti-IA : [`DA-ANTI-IA.md`](DA-ANTI-IA.md). Fallback hors-cadre : [`DA-PRESETS.md`](DA-PRESETS.md).
