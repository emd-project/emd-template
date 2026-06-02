# AUTO-DESIGN — Composer une vraie DA à l'init (sans livrable Claude Design)

## Quand exécuter

Pendant l'init d'un site (skills `configure-from-spec` ou `init-site`), **uniquement si
`design-incoming/` est vide ou absent**.

- Si `design-incoming/` contient des fichiers → c'est `integrate-claude-design` qui pilote. Ne
  PAS exécuter AUTO-DESIGN.
- Si `design-incoming/` est vide → **NE JAMAIS laisser les placeholders** de `niche.config.ts`
  (palette rouge `#FF3D57`, fonts Unbounded/Space Grotesk, mode dark, aurora). Ces valeurs sont
  le thème par défaut du template : les garder = tous les sites se ressemblent. Exécuter la
  procédure ci-dessous pour composer une DA propre, distincte, adaptée à la niche.

Objectif : un collègue non-technique remplit le wizard, ne fournit aucun design, et le site
sort quand même avec une **vraie direction artistique**.

## Entrées

- La niche / le sujet du site (depuis `init-spec.md` ou l'interview).
- Les clusters de catégories (déjà écrits dans `niche.config.ts.categories`).
- La bibliothèque de presets : `lib/da-presets/` (161 palettes, 72 paires de fonts, 75 styles UI,
  161 règles par niche) via les helpers de `lib/da-presets/index.ts`.
- La barre qualité : `docs/design-reference/comparateur-energie/` (DESIGN-NOTES.md + CSS).

## Procédure

### 1. Déterminer le type de produit + les moods

Depuis la niche, choisir le `productType` le plus proche dans la base presets et 3-4 mots de
mood. Lister les types disponibles avec `listProductTypes()`. Exemples :
- comparateur d'énergie → productType proche « Personal Finance » / « Insurance », moods
  `['trust', 'clear', 'modern', 'warm']`.
- magazine auto → « Editorial » / « Automotive » si présent, moods `['editorial', 'bold', 'expert']`.
- comparateur voiture élec → moods `['tech', 'clean', 'trust', 'green']`.

### 2. Composer le preset

Exécuter le helper (via un petit script Node lancé en bash, ou en raisonnant sur les JSON) :

```ts
import { composePreset } from '@/lib/da-presets'
const preset = composePreset(productType, moods)
// preset.palette  → couleurs (primary, accent, secondary, background, card, foreground, muted…)
// preset.fonts[0] → paire (heading + body)
// preset.rule     → pattern, stylePriority, colorMood, antiPatterns (à respecter !)
// preset.styles   → styles UI candidats
```

Lire `preset.rule.antiPatterns` et NE PAS les enfreindre, même si le wizard suggère autre chose.

### 3. Étudier la barre qualité

Lire `docs/design-reference/comparateur-energie/DESIGN-NOTES.md`. En tirer la **rigueur** (pas
les couleurs) : fond teinté jamais blanc pur, cartes « papier », une couleur par catégorie avec
version soft, display expressif vs body lisible, profondeur douce, motion sobre. Transposer ces
principes au preset de la niche.

### 4. Choisir les variantes structurelles

Écrire `niche.style` pour casser la silhouette commune (deux sites ne doivent pas avoir le même
layout) :
- `mode`: `'light'` ou `'dark'` selon le mood (un comparateur sérieux = souvent `light`).
- `hero`: `'split'` (avec visuel produit) | `'centered'` | `'minimal'`.
- `effects`: `'aurora'` | `'subtle'` | `'none'` (cohérent avec le mood ; un site clair évite
  l'aurora criarde → `'subtle'` ou `'none'`).
- `cards`: `'bordered'` | `'filled'` | `'minimal'`.
- `uiStyle`: nom du style UI retenu (ex: « Editorial », « Soft Minimal »).

### 5. Écrire dans niche.config.ts

Mapper le preset (ne JAMAIS laisser les valeurs par défaut) :

```ts
palette: {
  accent1: preset.palette.primary,
  accent2: preset.palette.accent,
  accent3: preset.palette.secondary,
  accent4: /* une couleur de catégorie distincte */,
  accent5: /* une couleur de catégorie distincte */,
  bgPrimary: preset.palette.background,   // teinté, pas blanc pur
  bgSurface: preset.palette.card,
  bgSurface2: /* variante */,
  textPrimary: preset.palette.foreground,
  textSecondary: preset.palette.mutedFg,
  textMuted: /* gris doux */,
}
fonts: { display: preset.fonts[0].heading, body: preset.fonts[0].body }
```

**Une couleur d'accent par catégorie** : aligner `niche.categories[i].accent` sur accent1..5 pour
que chaque univers ait son code couleur (principe clé d'un comparateur lisible).

### 6. Remplir la signature DA

Renseigner `niche.signature` (anchor, oneRule, inspiration, forbidden, components) à partir de
`preset.rule` + DESIGN-NOTES, pour donner une personnalité visuelle unique et des garde-fous
anti-IA. Ne pas laisser ces champs vides.

### 7. Barre qualité avant de valider

- [ ] Plus aucune valeur placeholder dans `niche.palette` / `niche.fonts` / `niche.signature`.
- [ ] `bgPrimary` n'est pas blanc pur (#FFFFFF) ni le dark par défaut #0A0A0F sans raison.
- [ ] Fonts ≠ Unbounded/Space Grotesk par défaut (sauf si le preset les a réellement choisies).
- [ ] Une couleur par catégorie, distinctes, cohérentes avec la palette.
- [ ] `preset.rule.antiPatterns` respectés.
- [ ] Contraste texte/fond suffisant (vérifier en mode retenu).

## Sortie

Annoncer à l'utilisateur : productType retenu, palette + fonts choisies, mode/variantes, et le
fait que la DA a été composée automatiquement (pas le thème par défaut). Préciser qu'un Claude
Design sur-mesure pourra remplacer cette DA plus tard pour un site qui performe.

## Règle absolue

Un site qui sort de l'init avec la palette/fonts par défaut du template est un **bug d'init**.
Sans Claude Design fourni, AUTO-DESIGN doit avoir tourné.
