# AUTO-DESIGN — Composer une vraie DA à l'init (sans livrable Claude Design)

## Quand exécuter

Pendant l'init d'un site (`configure-from-spec` ou `init-site`), **uniquement si `design-incoming/`
est vide ou absent** (aucun livrable Claude Design).

- `design-incoming/` non vide → c'est `integrate-claude-design` qui pilote. Ne PAS exécuter AUTO-DESIGN.
- `design-incoming/` vide → **NE JAMAIS laisser les placeholders** de `niche.config.ts` (palette
  rouge `#FF3D57`, fonts Unbounded/Space Grotesk, dark + aurora). Exécuter la procédure ci-dessous.

Objectif : le site sort de l'init avec une **vraie DA, adaptée à son archétype** — et surtout
**pas un copier-coller du comparateur énergie**. Un magazine doit ressembler à un magazine.

## Entrées

- Le bloc `## Design` de `init-spec.md` (cf. `docs/WIZARD-DESIGN-STEP.md`) — peut contenir
  `archetype`, `mood`, `brandColor`, `mode`, `reference`, `mustHaveSections`. S'il est absent ou
  partiel, inférer depuis la niche (mode dégradé).
- Les clusters de catégories (déjà dans `niche.config.ts.categories`).
- Les presets : `lib/da-presets/` via `lib/da-presets/index.ts` (`composePreset`, `findPalettes`…).
- Les barres qualité : `docs/design-reference/comparateur-energie/` et
  `docs/design-reference/magazine-blog/`.

---

## Étape 0 — Lire le bloc Design + déterminer l'ARCHÉTYPE

Lire le bloc `## Design` de `init-spec.md`. En tirer `archetype`. S'il est absent, l'**inférer**
depuis l'intent dominant des clusters Semrush :
- intent surtout commercial/transactionnel (prix, comparer, meilleur, souscrire, offres) →
  **comparateur**.
- intent surtout informationnel (comment, pourquoi, guide, qu'est-ce que) → **magazine**.
- mélange → **hybride**.

L'archétype pilote la **structure de la home** et le **hero**. Ne JAMAIS appliquer la home
comparateur à un site magazine.

| Archétype | `niche.style.hero` | `niche.homeSections` (ordre) | Référence à étudier |
|---|---|---|---|
| **comparateur** | `split` (visuel produit) | `['ticker','deals','articles','categories','tools','author']` | `design-reference/comparateur-energie/` |
| **magazine** | `centered` ou `minimal` (éditorial) | `['ticker','articles','categories','author']` | `design-reference/magazine-blog/` |
| **hybride** | `split` ou `centered` | `['ticker','articles','tools','categories','author']` | les deux |

Rappels composants (déjà dans le template, pilotés par `homeSections`) :
- `articles` → `RecentArticles` = **layout magazine** (grand featured + grille). C'est LA section
  vedette d'un magazine.
- `tools` → `FeaturedTools` (comparateur/quiz/simulateur) = pour comparateur/hybride.
- `categories`, `ticker`, `deals`, `author` → communs.

Si `mustHaveSections` est fourni, ajuster `homeSections` en conséquence (sans casser l'ordre
logique de l'archétype).

---

## Étape 1 — Type de produit + moods (pour la palette/fonts)

Choisir le `productType` le plus proche dans la base presets (`listProductTypes()`), et les moods :
- priorité au champ `mood` du bloc Design s'il existe ;
- sinon dériver de l'archétype + la niche. Ex : comparateur énergie → `['trust','clear','warm']` ;
  magazine tech → `['editorial','bold','expert']`.

---

## Étape 2 — Composer le preset

```ts
import { composePreset } from '@/lib/da-presets'
const preset = composePreset(productType, moods)
// preset.palette / preset.fonts[0] / preset.rule (antiPatterns !) / preset.styles
```

- Si `brandColor` est un hex (pas `auto`) → l'utiliser comme `accent1` et bâtir la palette autour
  (sa version foncée + une version soft), au lieu du primary du preset.
- Si `mode` = `light`/`dark` → forcer `niche.style.mode`. Si `auto` → suivre le mood (comparateur
  sérieux = souvent `light` ; magazine = au choix éditorial).
- Respecter `preset.rule.antiPatterns`.

---

## Étape 3 — Étudier la barre qualité de l'archétype

Lire le `DESIGN-NOTES.md` de la référence correspondante (Étape 0). En tirer la **rigueur**, pas
les couleurs :
- comparateur → fond teinté, cartes papier, une couleur par catégorie + version soft, visuel
  produit dans le hero, profondeur douce.
- magazine → typo display/body à fort contraste, home menée par l'article à la une, couleur
  sobre qui ponctue, blanc et hiérarchie comme matière.

---

## Étape 4 — Variantes structurelles + écriture niche.config.ts

Écrire `niche.style` (hero selon archétype, `effects`, `cards`, `uiStyle`) pour casser la
silhouette commune. Puis la palette + fonts :

```ts
palette: {
  accent1: brandColor !== 'auto' ? brandColor : preset.palette.primary,
  accent2: preset.palette.accent,
  accent3: preset.palette.secondary,
  accent4: /* couleur de catégorie distincte */,
  accent5: /* couleur de catégorie distincte */,
  bgPrimary: preset.palette.background,   // teinté, jamais blanc pur
  bgSurface: preset.palette.card,
  bgSurface2: /* variante */,
  textPrimary: preset.palette.foreground,
  textSecondary: preset.palette.mutedFg,
  textMuted: /* gris doux */,
}
fonts: { display: preset.fonts[0].heading, body: preset.fonts[0].body }
homeSections: /* selon l'archétype, Étape 0 */
style: { mode, hero, effects, cards, uiStyle }
```

**Une couleur d'accent par catégorie** : aligner `niche.categories[i].accent` sur accent1..5.

---

## Étape 5 — Signature DA

Renseigner `niche.signature` (anchor, oneRule, inspiration, forbidden, components) depuis
`preset.rule` + le DESIGN-NOTES de l'archétype + `reference` si fournie. Ne pas laisser vide.

---

## Étape 6 — Barre qualité avant de valider

- [ ] Archétype respecté : un magazine n'a PAS de hero quick-form/estimateur ; un comparateur a
      bien ses outils. `homeSections` cohérent avec l'archétype.
- [ ] Plus aucun placeholder dans `niche.palette` / `niche.fonts` / `niche.signature`.
- [ ] `bgPrimary` pas blanc pur, pas le dark par défaut sans raison.
- [ ] Fonts ≠ défaut (sauf si réellement choisies par le preset).
- [ ] Une couleur par catégorie, distinctes.
- [ ] `preset.rule.antiPatterns` respectés ; `brandColor`/`mode` du bloc Design honorés.
- [ ] Contraste texte/fond suffisant.

## Sortie

Annoncer : archétype retenu (et pourquoi), productType, palette + fonts, mode/variantes,
`homeSections`. Préciser que la DA est composée auto (pas le thème par défaut) et qu'un Claude
Design sur-mesure pourra la remplacer plus tard.

## Règle absolue

Sortir de l'init avec la palette/fonts par défaut, OU avec la home comparateur sur un site
magazine, est un **bug d'init**.
