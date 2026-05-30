# Décisions — 10min-template

## Architecture
- [x] Next.js ~16.2.1 patch auto · Vercel fra1 · GitHub Actions CI
- [x] Tailwind v4.2.2 + variables CSS · dark-only (pas de next-themes)
- [x] Langue FR uniquement · pas de segment [locale] · routes racine
- [x] Configuration centralisée dans `niche.config.ts` — seul fichier à modifier par site
- [x] Catégories dynamiques — 1 composant `CategorySection` générique au lieu de sections hardcodées
- [x] CMS portable dans `packages/cms/` — copier tel quel entre sites

## DA — effets retenus par section
- effect-hero → aurora CSS animée + noise 0.04 + H1 clip gradient
- effect-comparateur → bento grid + border animée pulse lent
- effect-quiz → radial gradient + glassmorphism cards
- effect-deals → watermark + MarqueeStrip + badge
- effect-articles → grille asymétrique + cards border-top 3px accent
- effect-footer → --bg-surface + diagonal clip-path
- effect-404 → watermark "404" clamp Syne 800 opacity 0.08

## DA — traitements typographiques
- typo-h1-home → clamp + background-clip:text gradient
- typo-prix → font-variant-numeric:tabular-nums + --font-mono
- typo-watermark → numéro 200px Syne 800 opacity 0.05
- typo-article-intro → lettrine CSS ::first-letter + --font-display

## Fonts
- Next.js variables : `--next-font-primary` / `--next-font-display` / `--next-font-mono`
- Préfixe `next-` pour éviter la référence circulaire avec @theme Tailwind

## Light mode
- Via `@media (prefers-color-scheme: light)` dans globals.css — aucun JS
- Accents assombris pour WCAG AA sur fond clair
- OG image toujours dark, indépendant du mode
