# Décisions — emd-template (moteur de sites éditoriaux multi-niches)

## Architecture
- [x] Next.js ~16.2.1 patch auto · Vercel fra1 · GitHub Actions CI
- [x] Tailwind v4.2.2 + variables CSS
- [x] Mode clair/sombre : `niche.style.mode` + `ThemeToggle` (data-theme) + `@media (prefers-color-scheme)`. Plus « dark-only ».
- [x] i18n piloté par `niche.config.ts` (`locales` / `market` / `defaultLocale`). FR par défaut ; segment `app/[locale]/...` + middleware ajoutés à l'init si `locales.length >= 2` (cf. `skills/init-site`).
- [x] Configuration centralisée dans `niche.config.ts` — seul fichier à modifier par site
- [x] Catégories dynamiques — 1 composant `CategorySection` générique au lieu de sections hardcodées
- [x] CMS portable dans `packages/cms/` — copier tel quel entre sites

## DA — composition à l'init
- [x] Si livrable Claude Design (`design-incoming/`) → `integrate-claude-design`.
- [x] Sinon → `docs/AUTO-DESIGN.md` : composition d'une vraie DA depuis `lib/da-presets/` (161 presets) + barre qualité `docs/design-reference/`. Jamais les placeholders par défaut.
- [x] Archétypes pilotant la home + le hero : `comparateur` / `magazine` / `hybride` (cf. `niche.config.homeSections`).

## DA — stratégie images V2
- [x] Doctrine « no image » V1 **abandonnée**. V2 : vraies images IA partout (cf. `docs/IMAGES-WORKFLOW.md`).
- [x] Images structurelles : registre `lib/image-slots.ts` (prompt + dimensions par slot).
- [x] Deux moteurs : en-app `lib/image-generation.ts` (Gemini → Flux, CMS `/admin/images`) ; Cowork `mcp__nano-mentionbox__generate_image` (init + scheduled tasks).
- [x] À l'init : générer les slots structurels (hero + fonds catégories) → site animé, pas de placeholders.
- [x] Articles : `cover` + `mid` générés par la tâche quotidienne, WebP 16:9, `alt` FR + EN.

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

## SEO — méta
- [x] `title.template` du layout = `%s` (les pages incluent déjà le nom du site). Évite le double nom de marque.
- [x] `default` (home) = `tagline | siteName`.
