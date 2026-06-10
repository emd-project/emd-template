# DA Presets — bibliothèque de fallback (optionnelle)

> ⚠️ **Plus le chemin par défaut.** L'init part désormais d'un **skin Voltéo** (cf.
> [`AUTO-DESIGN.md`](AUTO-DESIGN.md) + [`design-reference/volteo/`](design-reference/volteo/README.md)).
> Cette bibliothèque ne sert plus qu'en **fallback** : une niche vraiment hors-cadre (SaaS, portfolio…)
> où aucun des 4 skins ne convient. Dans ce cas seulement, on compose une DA sur mesure ici, en visant
> le même niveau de finition que Voltéo, puis on **annonce explicitement** qu'on est en mode fallback.

## Contenu

`lib/da-presets/` embarque une base locale (aucune dépendance externe) :

```
lib/da-presets/
├── palettes.json       (161 palettes par niche)
├── font-pairings.json  (72 paires Google Fonts)
├── ui-styles.json      (75 styles UI)
├── niche-rules.json    (161 règles par niche, dont antiPatterns)
└── index.ts            (helpers : composePreset, findPalettes, findUIStyles, findNicheRule, listProductTypes…)
```

Source : extrait de [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), converti en JSON local.

## Usage fallback

```ts
import { composePreset } from '@/lib/da-presets'
const preset = composePreset('Healthcare App', ['calm', 'trust', 'modern'])
// preset.palette / preset.fonts[0] / preset.styles[0] / preset.rule.antiPatterns
```

Mapper ensuite vers `niche.config.ts` (`palette.accent1..5`, `bgPrimary`, `bgSurface…`, `fonts`) et
`app/globals.css`, en respectant `preset.rule.antiPatterns` et les garde-fous de
[`DA-ANTI-IA.md`](DA-ANTI-IA.md). Puis muter pour rester unique (anti-footprint).

> Pour 95 % des cas (comparateurs & magazines), **ne pas utiliser cette lib** : prendre un skin Voltéo.
