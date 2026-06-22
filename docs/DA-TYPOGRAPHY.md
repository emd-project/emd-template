# DA — Typographie (pool curé pour l'auto-DA)

Source : **`lib/typography.ts`** (`FONT_PAIRINGS` + `suggestFonts`). Objectif : donner à l'auto-DA
beaucoup **plus de combinaisons typo** que les 4 skins Voltéo, tout en restant **lisible (AA)** et
**sérieux** (pas de pixel/cyberpunk/kids). Les 72 paires de `lib/da-presets/font-pairings.json` restent
un **fallback profond** pour les niches vraiment hors-cadre.

## 16 paires curées (toutes Google Fonts)

| Famille | Exemples (display × body) |
|---|---|
| **grotesque** | Bricolage × Hanken · Space Grotesk × Inter · Archivo × Inter |
| **serif-éditorial** | Fraunces × Inter · Newsreader × Public Sans · Spectral × IBM Plex Sans · Playfair × Source Sans 3 · DM Serif × DM Sans · Crimson Pro × Inter |
| **géométrique** | Outfit × Work Sans · Sora × Hanken · Manrope (mono) |
| **humaniste** | Lexend × Inter · Plus Jakarta Sans (mono) |
| **expressif** | Syne × Manrope · Instrument Serif × Instrument Sans |

## Comment l'auto-DA choisit

1. `suggestFonts(niche.domain, home)` — tirage **déterministe** (seed = domaine) **biaisé par l'archetype
   de home** (`FAMILY_BY_HOME`) : comparateur/marché → grotesque/géométrique ; magazine/fil → serif-éditorial/expressif.
   → deux sites divergent en typo (anti-empreinte) tout en restant cohérents avec leur type de home.
2. Si la spec impose une paire (`skin`/fonts) → elle gagne sur le tirage.
3. **Écrire** la paire choisie dans **`app/layout.tsx`** via `next/font/google` (imports STATIQUES :
   nom Google → remplacer les espaces par `_`, ex. `Space Grotesk` → `Space_Grotesk`), en alimentant
   `--next-font-display` (titres) et `--next-font-primary` (corps).

> next/font ne peut pas charger une font « dynamiquement » : `lib/typography.ts` sert à **choisir**,
> l'init **réécrit** `layout.tsx`. Le runtime, lui, ne dépend que de ce que `layout.tsx` importe.

## Règles
- Garder **2 familles max** (display + body) ; les mono-familles (Manrope, Plus Jakarta) sont OK.
- Weights raisonnables (display 600–800, body 400–700). `display: 'swap'`, `preload: true`.
- Contraste AA respecté (les paires sont choisies pour ça) ; ne pas marier deux serifs à fort contraste.
- Anti-empreinte : ne jamais reprendre la **même** paire que le skin par défaut sur tous les sites —
  c'est justement le rôle de `suggestFonts`.
