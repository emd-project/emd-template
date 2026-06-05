# IMAGES — Workflow (le site s'anime avec de vraies images)

**Doctrine : de vraies images partout, générées par IA.** Objectif **zéro placeholder visible en
prod**, dès la sortie de l'init. Le placeholder n'est qu'un filet de sécurité en dev quand une image
manque — jamais une cible.

## Deux types d'images

1. **Structurelles** (fixes du site) — registre **`lib/image-slots.ts`**, qui est la **source unique**
   des ids, dimensions, chemins et prompts. Slots : fond de hero, visuel hero (variant split),
   bandeaux outils (comparer / quiz / simulateur / deals), illustration + fond cinématique **par
   catégorie**, photo auteur, OG par défaut.
2. **Éditoriales** (articles) — `cover` (toujours) + `mid` (si article > 1500 mots), déclarées dans
   le frontmatter MDX.

## Deux moteurs de génération

- **En-app** — `lib/image-generation.ts` : Gemini (primaire) → Flux (fallback), via `GEMINI_API_KEY` /
  `BFL_API_KEY`. Utilisé par le CMS `/admin/images` et le script CLI batch (génération depuis l'app).
- **Cowork** — `mcp__nano-mentionbox__generate_image` (fire-and-poll) → `mcp__nano-mentionbox__wait_for_image`
  → `mcp__nano-mentionbox__github_push_images`. Utilisé à l'**init** et par les **scheduled tasks**.

## Conventions (source unique : `lib/image-slots.ts`)

| Usage | Fichier | Dimensions | Ratio |
|---|---|---|---|
| Cover article | `[slug]-cover.webp` | 1280×720 | 16:9 |
| Mid article (si > 1500 mots) | `[slug]-mid.webp` | 1280×720 | 16:9 |
| Hero fond (home) | `hero-background.webp` | 1920×1080 | 16:9 |
| Hero visuel (split) | `hero-visual.webp` | 1000×1250 | 4:5 |
| Illustration catégorie | `categories/[slug].webp` | 1200×800 | 3:2 |
| Fond article catégorie | `blog/category-[slug].webp` | 2400×1200 | 2:1 |
| Auteur | `authors/[slug].webp` | 512×512 | 1:1 |
| OG défaut | `brand/og-default.webp` | 1200×630 | ~1.9:1 |

Les docs et skills ne réécrivent jamais ces valeurs : ils pointent vers `lib/image-slots.ts`.

## À l'init — animer le site dès le départ

Après `AUTO-DESIGN` (composition de la DA), générer les slots structurels clés via nano-mentionbox,
pour que le site neuf ne sorte PAS en placeholders :
- `home-hero-background` et `home-hero-visual`
- `home-category-[slug]` + `blog-category-background-[slug]` pour **chaque** catégorie
- `author-[slug]` si un auteur est défini

Prompts : ceux de `lib/image-slots.ts` + la bibliothèque `prompts/`, **alignés sur la palette de la DA
composée**. Compresser en WebP, pousser sous les chemins exacts des slots (`public/images/...`). Si une
génération échoue, laisser le placeholder et le noter dans PROGRESS.md — ne pas bloquer tout l'init,
mais le signaler.

## Articles — cover + mid (scheduled task quotidienne)

- fire-and-poll `generate_image` → `wait_for_image` ; retry une fois en `[slug]-cover-v2` ; si échec, skip l'article et log « Bloqué » (aucun brouillon).
- WebP 1280×720 (16:9). `cover` toujours ; `mid` si l'article > 1500 mots.
- `filename: [slug]-cover` / `[slug]-mid`, push sous `public/blog/[categorie]/[slug]/`.
- Frontmatter : `cover`, `coverAlt` (fr + locales), `mid`, `midAlt`, `midCaption` (optionnel).

## Règles (toutes images)

- Prompts ≤ ~20 mots, finir par « no text, no logos, no watermark, no readable license plate, no magazine layout overlay » (sinon Gemini incruste du texte).
- **Jamais** de marques réelles dans les prompts.
- WebP de préférence (sharp si dispo, sinon `.jpeg` et adapter le frontmatter).
- `next/image` **uniquement** (jamais de `<img>` nu) ; `alt` descriptif **FR + locales**.
- Hero = `priority` (LCP). Animations : `prefers-reduced-motion` respecté.
- Jamais picsum / unsplash / placeholder.com / hotlink CDN tiers.

## Placeholder (filet de sécurité dev)

`components/ui/ImagePlaceholder` rend la **vraie image** si le fichier existe, sinon un placeholder
(détaillé en dev avec le prompt, épuré en prod). C'est un filet, pas la cible : en prod, un site ne
doit afficher **aucun** placeholder.
