# DA Presets — Bibliothèque de directions artistiques pré-curées

Le template embarque une base de données de **161 palettes**, **72 paires typographiques**, **75 styles UI** et **161 règles de raisonnement par niche** pour aider à composer une DA cohérente sans repartir de zéro.

Source : extrait du repo [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), converti en JSON local. Aucune dépendance externe.

---

## Où c'est stocké

```
lib/da-presets/
├── palettes.json       (161 palettes complètes par niche)
├── font-pairings.json  (72 paires Google Fonts)
├── ui-styles.json      (75 styles UI : Glassmorphism, Brutalism, etc.)
├── niche-rules.json    (161 règles de design par niche)
└── index.ts            (helpers TypeScript)
```

---

## Helpers disponibles

```ts
import {
  // datasets bruts
  palettes, fontPairings, uiStyles, nicheRules,

  // recherche
  findPalettes,
  findPaletteByType,
  findFontPairings,
  findUIStyles,
  findNicheRule,
  findNicheRules,

  // composition complète
  composePreset,

  // listing
  listProductTypes,
  listFontCategories,
  listStyleCategories,
} from '@/lib/da-presets'
```

---

## Niches couvertes (palettes)

161 niches dont notamment :

**Tech & SaaS** : SaaS (General), Micro SaaS, B2B Service, Developer Tools, AI Platform, Cybersecurity, Analytics Dashboard, Financial Dashboard

**E-commerce** : E-commerce (général), E-commerce Luxury, Marketplace, Subscription Box, Food Delivery

**Health & Wellness** : Healthcare App, Mental Health, Meditation, Fitness, Pharmacy, Dental

**Lifestyle** : Beauty/Spa, Restaurant, Hotel, Travel, Recipe App, Habit Tracker

**Creative** : Portfolio, Creative Agency, Photography, Music Streaming, Gaming

**Finance** : Banking, Crypto/Web3, Personal Finance, Insurance, Billing Tools

**Education** : Educational App, E-learning, Language Learning

**Et beaucoup d'autres** — utilise `listProductTypes()` pour la liste complète.

---

## Mode d'emploi pendant l'init

### Étape 1 — Identifier la niche

L'utilisateur dit "site sur les aspirateurs robots". Tu cherches le product type le plus proche :

```ts
import { findPalettes, findNicheRules } from '@/lib/da-presets'

const palettes = findPalettes(['robot', 'tech', 'home', 'appliance'], 5)
// → retourne les 5 palettes les plus pertinentes
```

S'il n'y a pas de match exact (les niches du repo sont génériques type "SaaS", "E-commerce", "Healthcare"), tu peux :
- Soit utiliser une palette d'une niche proche (Tech, Marketplace)
- Soit composer manuellement à partir des moods

### Étape 2 — Composer un preset complet

```ts
import { composePreset } from '@/lib/da-presets'

const preset = composePreset('Healthcare App', ['calm', 'trust', 'modern'])
// {
//   palette: { primary: '...', secondary: '...', ... },
//   rule: { pattern: '...', stylePriority: '...', antiPatterns: '...' },
//   fonts: [{ heading: 'Inter', body: 'Lato', ... }, ...],
//   styles: [{ category: 'Minimalism', effects: '...', ... }, ...],
// }
```

### Étape 3 — Coller dans `niche.config.ts`

Le preset retourné contient toutes les couleurs nécessaires. Mappe-les vers le format de `niche.config.ts` :

```ts
palette: {
  accent1: preset.palette.primary,
  accent2: preset.palette.accent,
  accent3: preset.palette.secondary,
  // ...
  bgPrimary: preset.palette.background,
  bgSurface: preset.palette.card,
  // ...
}
fonts: {
  display: preset.fonts[0].heading,
  body: preset.fonts[0].body,
}
```

### Étape 4 — Respecter les anti-patterns

Chaque `nicheRule` contient un champ `antiPatterns` qui dit ce qu'il NE FAUT PAS faire pour cette niche. Exemple pour E-commerce Luxury :

```
antiPatterns: "Vibrant & Block-based + Playful colors"
```

Tu lis ça et tu sais que pour ce site, tu n'utilises pas du flat coloré et joyeux — même si l'utilisateur le demande, tu lui expliques pourquoi.

---

## Différence avec le système actuel `niche.style.*`

Notre `niche.config.ts` a déjà des variantes structurelles :
- `style.hero` : split / centered / minimal
- `style.effects` : aurora / subtle / none
- `style.cards` : bordered / filled / minimal

**Ces variantes restent.** Les presets DA viennent **compléter** :
- Les variantes structurelles → choisies par toi pour casser la silhouette commune
- Les presets DA → palette + fonts + règles, choisis selon la niche

Combinés, deux sites issus du template auront :
- Couleurs + fonts différents (presets)
- Layout différent (variantes structurelles)
- Anti-patterns respectés (règles)

---

## Exemple complet : site spa wellness

```ts
import { composePreset } from '@/lib/da-presets'

const preset = composePreset('Spa', ['calm', 'soft', 'natural', 'luxury'])

// preset.palette → couleurs douces (rose poudré, sage, taupe)
// preset.fonts[0] → "Classic Elegant" (Playfair Display + Inter)
// preset.styles[0] → probablement "Minimalism" ou "Editorial Magazine"
// preset.rule.antiPatterns → "Vibrant neon + Brutalist + Tech mono"

// Configuration finale niche.config.ts :
{
  style: {
    mode: 'light',          // spa = light forcément
    hero: 'minimal',        // épuré
    effects: 'none',        // pas d'aurora qui crierait
    cards: 'minimal',       // texte pur
  },
  palette: { /* depuis preset.palette */ },
  fonts: { display: 'Playfair Display', body: 'Inter' },
}
```

---

## Maintenance

Si la base source (ui-ux-pro-max-skill) évolue, tu peux re-télécharger les CSV et reconvertir :

```bash
mkdir /tmp/uipro && cd /tmp/uipro
curl -sL -o colors.csv https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/src/ui-ux-pro-max/data/colors.csv
curl -sL -o google-fonts.csv https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/src/ui-ux-pro-max/data/google-fonts.csv
curl -sL -o styles.csv https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/src/ui-ux-pro-max/data/styles.csv
curl -sL -o typography.csv https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/src/ui-ux-pro-max/data/typography.csv
curl -sL -o ui-reasoning.csv https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/src/ui-ux-pro-max/data/ui-reasoning.csv
# puis lancer le script de conversion (voir git log pour le code)
```
