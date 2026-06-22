# AUTO-DESIGN — DA à l'init (doctrine v3 : système de variantes, full-auto)

> **Voltéo est le moteur** : les composants RSC produisent déjà toutes les structures. Depuis v3,
> l'unicité d'un site ne vient plus d'un « mix V1-V4 à la main » mais de la **sélection** dans le
> **système de variantes** : (squelette choisi) × (permutations de tokens) × (palette/typo).
> La sélection est **déterministe et automatique** (seed = domaine) — zéro phase de validation.

## Quand exécuter

Init (`configure-from-spec` ou `init-site`, via `nouveau-site`), si `design-incoming/` est vide.
- `design-incoming/` non vide → `integrate-claude-design` (livrable Claude Design fourni).
- vide → dérouler la sélection auto ci-dessous.

---

## La DA = 3 leviers, tous écrits dans `niche.config.ts` (+ `layout.tsx` pour les fonts)

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

### 3. Palette & typographie
- **Palette** — SOURCE UNIQUE : **`niche.config.palette` → `app/globals.css`**. Si la spec fournit
  `brandColor`/`skin` → les utiliser. Sinon **choisir un preset** déterministe (thématique + seed) parmi
  `docs/DA-PRESETS.md` (`lib/da-presets/` : **161 palettes**, AA). Écrire dans **`niche.config.palette`**,
  puis **propager** dans **`app/globals.css :root`** (+ bloc `@theme`).
- **Typographie** — **`suggestFonts(niche.domain, home)`** (`lib/typography.ts` : **16 paires curées**
  Google Fonts, biaisées par l'archetype de home ; cf. `docs/DA-TYPOGRAPHY.md`). Écrire la paire choisie
  dans **`app/layout.tsx`** (next/font, imports statiques) → `--next-font-display` + `--next-font-primary`.
  Pour une niche hors-cadre, fallback profond : `lib/da-presets/font-pairings.json` (72 paires).
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
3. **Palette** : preset (spec ou seed) → `niche.config.palette` → `globals.css :root` (+ `@theme`).
4. **Typo** : `suggestFonts(domaine, home)` → écrire la paire dans `app/layout.tsx`.
5. **Écrire** `niche.config` (`layouts`, `permutations`, `palette`, `style.hero`).
6. **Dépublier les previews** non retenues : supprimer `/home-vN`, `/cat-vN`, `/art-v1` (+ `/en/...`).
7. **BUILD** directement (ci-dessous) — pas de phase « preview à valider ».

> Sélection déterministe (seed domaine) + thématique → deux sites divergent automatiquement
> (anti-empreinte : squelette, formes, palette **et** typo) sans choix manuel.

---

## BUILD

- **Arborescence + seed réel sourcé** ; **seed BILINGUE si `locales` ≥ 2** (FR + miroir + paire
  `lib/i18n/article-slugs.ts`) — un `/en` vide = échec.
- **Images — plafond strict ≤ ~5** (hero home + couverture hub). **JAMAIS** par catégorie/article.
  Le reste via la tâche de rédaction. Cf. `IMAGES-WORKFLOW.md`.
- **Logo & favicon** = mark SVG sur mesure + wordmark (inline `Nav.tsx` + `app/icon.svg`), pas une image générée.
- **Tâche de rédaction** quotidienne (cf. `SCHEDULED-TASK-REDACTION.md`).

---

## Garde-fous (bug d'init si violé)
- Site qui sort avec le **thème par défaut** (`#FF3D57`, logo `emd·template`, **fonts par défaut non changées**) ou des **placeholders d'images** en prod.
- **Valeur écrite dans `volteo.css :root`** (la DA passe par `niche.config.palette` → `globals.css`).
- **Aucune variante choisie** : `niche.config.layouts` doit être renseigné (sinon fallback magazine — la sélection auto n'a pas tourné).
- **Typo non choisie** : `layout.tsx` doit utiliser la paire de `suggestFonts`, pas Bricolage/Hanken par défaut sur tous les sites.
- **Previews non dépubliées** : `/home-vN`, `/cat-vN`, `/art-v1` ne doivent plus exister en prod.
- Images > 5 au build, ou une image par catégorie/article.

Garde-fous anti-IA : [`DA-ANTI-IA.md`](DA-ANTI-IA.md). Palettes : [`DA-PRESETS.md`](DA-PRESETS.md) · Typo : [`DA-TYPOGRAPHY.md`](DA-TYPOGRAPHY.md) · directions : [`DA-DIRECTIONS.md`](DA-DIRECTIONS.md).
Référence variantes : `lib/variants.ts` · `lib/typography.ts` · `components/layout/PermutationStyle.tsx`.
