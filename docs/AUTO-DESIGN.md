# AUTO-DESIGN — DA à l'init (doctrine v3 : système de variantes, full-auto)

> **Voltéo est le moteur** : les composants RSC produisent déjà toutes les structures. Depuis v3,
> l'unicité d'un site ne vient plus d'un « mix V1-V4 à la main » mais de la **sélection** dans le
> **système de variantes** : (squelette choisi) × (permutations de tokens) × (palette/fonts).
> La sélection est **déterministe et automatique** (seed = domaine) — zéro phase de validation.

## Quand exécuter

Init (`configure-from-spec` ou `init-site`, via `nouveau-site`), si `design-incoming/` est vide.
- `design-incoming/` non vide → `integrate-claude-design` (livrable Claude Design fourni).
- vide → dérouler la sélection auto ci-dessous.

---

## La DA = 3 leviers, tous écrits dans `niche.config.ts`

### 1. Squelette (variante) — `niche.config.layouts`
- **Home** : `magazine` · `comparateur` · `marche` (« Marché en direct », nécessite `classements.json`) · `fil` (« Le fil »).
- **Catégorie** : `classic` · `editorial`. **Article** : `classic`.
- **Choix** : `suggestVariants(niche.domain)` (`lib/variants.ts`) donne une combinaison stable, PUIS
  **override thématique** (prioritaire) :
  - intent **transactionnel / comparatif** → `comparateur` (ou `marche` si des classements sont générés) ;
  - **média / actu** → `fil` ; **informationnel** généraliste → `magazine`.
  - `marche` n'est choisi que si on a (ou va générer) `content/data/classements.json`.
- Écrire `niche.style.hero` cohérent (`split` pour comparateur/marche, sinon `centered`).

### 2. Permutations — `niche.config.permutations`
`shape` (`rounded`/`soft`/`sharp`) · `border` (`standard`/`hairline`/`bold`) · `shadow` (`standard`/`flat`/`deep`).
Valeurs depuis `suggestVariants(niche.domain)`. Appliquées par `PermutationStyle` (override de tokens en
`!important`, theme-safe) — **rien à écrire en CSS**.

### 3. Palette & fonts — SOURCE UNIQUE : `niche.config.palette` → `app/globals.css`
- Si la spec fournit `brandColor`/`skin` → les utiliser. Sinon **choisir un preset** déterministe
  (thématique + seed domaine) parmi `docs/DA-PRESETS.md` / `docs/DA-DIRECTIONS.md` (presets contrastés AA).
- Écrire la palette dans **`niche.config.palette`**, puis **propager les valeurs dans `app/globals.css :root`**
  (+ bloc `@theme`) et les **fonts dans `app/layout.tsx`** (next/font).
- ⚠️ **`app/styles/volteo.css :root` est une couche d'ALIAS — NE JAMAIS y écrire de valeurs.**
  La source unique de la DA est `niche.config.palette` (couleurs) + `layout.tsx` (fonts). Toute valeur
  écrite dans `volteo.css :root` = **bug d'init**.
- Mode **light OU dark fixe** selon la DA, contraste **AA** garanti par le preset.

---

## Animation (globale, unique)
`app/styles/volteo-motion.css` : révélation « fade-up » au scroll, 100 % CSS (scroll-driven), zéro JS,
`@supports` + `prefers-reduced-motion`. **Identique partout**, rien à configurer, pas de variante d'anim.

---

## Procédure (full-auto, sans validation)

1. **Lire** la thématique (clusters Semrush / spec / niche).
2. **Résoudre** : `suggestVariants(domaine)` + override thématique → `layouts` + `permutations`.
3. **Palette/fonts** : preset (spec ou seed) → `niche.config.palette` → `globals.css :root` (+ `@theme`) + fonts `layout.tsx`.
4. **Écrire** `niche.config` (`layouts`, `permutations`, `palette`, `style.hero`).
5. **Dépublier les previews** non retenues : supprimer les routes `/home-vN`, `/cat-vN`, `/art-v1`
   (+ `/en/...`) qui ne correspondent pas à la variante choisie.
6. **BUILD** directement (cf. ci-dessous) — pas de phase « preview à valider ».

> La sélection étant déterministe (seed domaine) + thématique, deux sites divergent automatiquement
> (anti-empreinte) sans choix manuel. C'est voulu : la DA est **auto**.

---

## BUILD

- **Arborescence + seed réel sourcé** ; **seed BILINGUE si `locales` ≥ 2** (FR + miroir + paire
  `lib/i18n/article-slugs.ts`) — cf. skills, un `/en` vide = échec.
- **Images — plafond strict ≤ ~5** (hero home + couverture hub). **JAMAIS** par catégorie/article.
  Le reste via la tâche de rédaction. Cf. `IMAGES-WORKFLOW.md`.
- **Logo & favicon** = mark SVG sur mesure + wordmark (inline `Nav.tsx` + `app/icon.svg`), pas une image générée.
- **Tâche de rédaction** quotidienne (cf. `SCHEDULED-TASK-REDACTION.md`).

---

## Garde-fous (bug d'init si violé)
- Site qui sort avec le **thème par défaut** (`#FF3D57`, logo `emd·template`) ou des **placeholders d'images** en prod.
- **Valeur écrite dans `volteo.css :root`** (la DA passe par `niche.config.palette` → `globals.css`).
- **Aucune variante choisie** : `niche.config.layouts` doit être renseigné (sinon le site reste sur le fallback magazine — ça veut dire que la sélection auto n'a pas tourné).
- **Previews non dépubliées** : `/home-vN`, `/cat-vN`, `/art-v1` ne doivent plus exister en prod.
- Images > 5 au build, ou une image par catégorie/article.

Garde-fous anti-IA : [`DA-ANTI-IA.md`](DA-ANTI-IA.md). Presets : [`DA-PRESETS.md`](DA-PRESETS.md) · directions : [`DA-DIRECTIONS.md`](DA-DIRECTIONS.md).
Référence variantes : `lib/variants.ts` (resolvers + `suggestVariants`) · `components/layout/PermutationStyle.tsx`.
