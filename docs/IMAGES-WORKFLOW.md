# IMAGES — Workflow V2 (le site s'anime avec de vraies images)

## V1 → V2

V1 = doctrine « no image » (placeholders rayés, fonds plats). **V2 = vraies images partout**,
générées par IA, pour animer le site. Les placeholders ne servent plus qu'en dev quand une image
manque. Objectif : **zéro placeholder visible en prod**, dès la sortie de l'init.

## Deux types d'images

1. **Structurelles** (fixes du site) — registre `lib/image-slots.ts`. Un slot = un id, des
   dimensions, un `alt`, et un **prompt IA déjà templé sur la niche**. Slots : fond de hero,
   visuel hero (variant split), bandeaux outils (comparer / quiz / simulateur / deals),
   illustration + fond cinématique **par catégorie**, photo auteur, OG par défaut.
2. **Éditoriales** (articles) — `cover` + `mid` par article, déclarées dans le frontmatter MDX.

## Deux moteurs de génération

- **En-app** — `lib/image-generation.ts` : Gemini (primaire) → Flux (fallback), via clés
  `GEMINI_API_KEY` / `BFL_API_KEY`. Utilisé par le CMS `/admin/images` et le script CLI batch.
  Pour générer / regénérer depuis l'application.
- **Cowork** — `mcp__nano-mentionbox__generate_image` (pattern fire-and-poll), puis
  `mcp__nano-mentionbox__github_push_images`. Utilisé à l'**init** et par les **scheduled tasks**.

## À l'init — animer le site dès le départ

Après `AUTO-DESIGN` (composition de la DA), générer les slots structurels clés via
nano-mentionbox (fire-and-poll), pour que le site neuf ne sorte PAS en placeholders :
- `home-hero-background` et `home-hero-visual`
- `blog-category-background-[slug]` + `home-category-[slug]` pour **chaque** catégorie
- `author-[slug]` si un auteur est défini

Prompts : ceux de `lib/image-slots.ts` (déjà adaptés à la niche). **Aligner la palette du prompt
sur la DA composée** par AUTO-DESIGN. Compresser en WebP, pousser sous les chemins exacts des
slots (`public/images/...`). Si la génération échoue, laisser le placeholder et le noter dans
PROGRESS.md — ne pas bloquer l'init.

## Articles — cover + mid (scheduled task quotidienne)

La tâche de rédaction génère les images de chaque article :
- fire-and-poll `generate_image` → `wait_for_image` ; retry une fois en `-v2` ; si échec, skip
  l'article et log « Bloqué » (aucun brouillon).
- WebP ~1024×576 (16:9). `cover` toujours ; `mid` si l'article > 1500 mots.
- `filename: [slug]-cover` / `[slug]-mid`, push sous `public/blog/[categorie]/[slug]/`.
- Frontmatter : `cover`, `coverAlt` (fr + en), `mid`, `midAlt`, `midCaption` (optionnel).

## Règles (toutes images)

- Prompts ≤ ~20 mots, finir par « no text, no logos, no watermark, no readable license plate,
  no magazine layout overlay » (sinon Gemini incruste du texte).
- **Jamais** de marques réelles dans les prompts.
- WebP de préférence (sharp si dispo, sinon `.jpeg` et adapter le frontmatter).
- `next/image` **uniquement** (jamais de `<img>` nu) ; `alt` descriptif **FR + EN**.
- Hero = `priority` (LCP). Animations : `prefers-reduced-motion` respecté.
- Jamais picsum / unsplash / placeholder.com / hotlink CDN tiers (cf. CLAUDE.md).

## Placeholders

`components/ui/ImagePlaceholder` rend la **vraie image** si le fichier existe, sinon un
placeholder (détaillé en dev avec le prompt, épuré en prod). C'est un filet de sécurité, pas la
cible : en V2 un site en prod ne doit afficher aucun placeholder.
