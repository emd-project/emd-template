/**
 * Registre central des emplacements d'images fixes du site.
 * Chaque slot a un ID unique, des dimensions, et un prompt IA recommandé.
 *
 * Usage :
 * 1. Le composant <ImagePlaceholder slotId="home-hero" /> affiche un placeholder
 *    en dev quand l'image n'existe pas, et rien en prod (ou l'image si présente).
 * 2. La page /admin/images liste tous les slots et leur statut.
 * 3. Les prompts IA sont utilisables directement dans Midjourney, DALL-E, Flux, Gemini.
 *
 * Note : ce registre ne couvre QUE les images structurelles du site (pages fixes).
 * Les articles de blog et produits ont leur propre système via le CMS (featureImage, image).
 */

import { niche } from '@/niche.config'

export type ImageSlot = {
  id: string
  path: string
  width: number
  height: number
  alt: string
  description: string
  prompt: string
  section: 'home' | 'tools' | 'author' | 'brand' | 'blog'
}

/** Placeholder pour remplacer dans les prompts : [niche] */
function p(str: string): string {
  return str
    .replace(/\[niche\]/g, niche.entity)
    .replace(/\[nicheEn\]/g, niche.entities)
    .replace(/\[tagline\]/g, niche.tagline)
}

// ─── Slots statiques ────────────────────────────────────────────────────

const STATIC_SLOTS: ImageSlot[] = [
  // Home
  {
    id: 'home-hero-background',
    path: '/images/home/hero-background.webp',
    width: 1920,
    height: 1080,
    alt: 'Arrière-plan du hero',
    description: 'Grande image en fond du hero above-fold. Ambiance immersive, cohérente avec la niche.',
    prompt: p(
      'Cinematic editorial background photo, [niche] theme, moody atmospheric lighting, 16:9 wide, shallow depth of field, muted dramatic color grading, high detail, premium magazine aesthetic --ar 16:9 --style raw'
    ),
    section: 'home',
  },
  {
    id: 'home-hero-visual',
    path: '/images/home/hero-visual.webp',
    width: 800,
    height: 1000,
    alt: 'Illustration principale du hero',
    description: 'Visuel principal à droite du hero (variant "split"). Peut être un produit phare, une illustration éditoriale, ou une scène symbolique.',
    prompt: p(
      'Editorial hero image for a [niche] guide website, vertical 4:5 format, elegant composition, soft natural lighting, premium aesthetic, negative space on one side for text overlay --ar 4:5 --style raw'
    ),
    section: 'home',
  },

  // Tools
  {
    id: 'comparer-hero',
    path: '/images/tools/comparer-hero.webp',
    width: 1920,
    height: 600,
    alt: 'Header du comparateur',
    description: 'Bandeau horizontal en haut de /comparer. Évoque la comparaison, le choix, la décision.',
    prompt: p(
      'Wide banner image evoking side-by-side comparison of [nicheEn], abstract minimalist composition, two elements mirrored, clean background, editorial tone --ar 16:5 --style raw'
    ),
    section: 'tools',
  },
  {
    id: 'quiz-hero',
    path: '/images/tools/quiz-hero.webp',
    width: 1920,
    height: 600,
    alt: 'Header du quiz',
    description: 'Bandeau horizontal en haut de /quiz. Évoque la question, le parcours personnalisé.',
    prompt: p(
      'Wide banner image evoking personalization and guided choice for [nicheEn], abstract path or journey visual, soft gradients, interactive feel --ar 16:5 --style raw'
    ),
    section: 'tools',
  },
  {
    id: 'simulateur-hero',
    path: '/images/tools/simulateur-hero.webp',
    width: 1920,
    height: 600,
    alt: 'Header du simulateur',
    description: 'Bandeau horizontal en haut de /simulateur. Évoque le calcul, la projection, le budget.',
    prompt: p(
      'Wide banner image evoking calculation and budget simulation for [niche], abstract numeric data visualization, clean lines, editorial aesthetic --ar 16:5 --style raw'
    ),
    section: 'tools',
  },
  {
    id: 'deals-hero',
    path: '/images/tools/deals-hero.webp',
    width: 1920,
    height: 600,
    alt: 'Header des deals',
    description: 'Bandeau horizontal en haut de /deals. Évoque la bonne affaire, le prix, l\'opportunité.',
    prompt: p(
      'Wide banner image evoking premium deals and offers for [niche], abstract glowing composition, warm accent lighting, editorial quality --ar 16:5 --style raw'
    ),
    section: 'tools',
  },

  // Brand
  {
    id: 'og-default',
    path: '/images/brand/og-default.webp',
    width: 1200,
    height: 630,
    alt: 'Image OpenGraph par défaut',
    description: 'Image de partage par défaut (OG image). Utilisée par les réseaux sociaux quand aucune image spécifique n\'est définie. Le site a déjà un opengraph-image.tsx dynamique — celle-ci est optionnelle en fallback.',
    prompt: p(
      'Social media sharing card for a [niche] guide website, 1200x630 format, bold typography space on left, elegant visual element on right, premium branded look --ar 1200:630 --style raw'
    ),
    section: 'brand',
  },
]

// ─── Slots dynamiques (catégories, auteurs) ─────────────────────────────

function dynamicSlots(): ImageSlot[] {
  const slots: ImageSlot[] = []

  // Une image par catégorie (section home)
  niche.categories.forEach((cat) => {
    slots.push({
      id: `home-category-${cat.slug}`,
      path: `/images/categories/${cat.slug}.webp`,
      width: 1200,
      height: 800,
      alt: `Illustration ${cat.label}`,
      description: `Image d'illustration de la section "${cat.label}" sur la home et en page pilier.`,
      prompt: p(
        `Editorial image representing ${cat.label} in the context of [niche], shallow depth of field, premium magazine photography, balanced composition --ar 3:2 --style raw`
      ),
      section: 'home',
    })
  })

  // Background d'article de blog par catégorie (hero cinématique dramatique)
  // Utilisée en fond d'en-tête d'article — inspiration : acheter-du-cbd, toutou-gourmet.
  niche.categories.forEach((cat) => {
    slots.push({
      id: `blog-category-background-${cat.slug}`,
      path: `/images/blog/category-${cat.slug}.webp`,
      width: 2400,
      height: 1200,
      alt: `Arrière-plan des articles ${cat.label}`,
      description: `Image de fond cinématique affichée derrière le titre de chaque article de la catégorie "${cat.label}". Doit être atmosphérique, avec de l'espace pour un overlay sombre et du texte par-dessus (titre serif dramatique).`,
      prompt: p(
        `Cinematic editorial hero background photo representing ${cat.label} for a ${niche.entity} guide blog, dark moody atmospheric lighting, shallow depth of field, rich muted color grading, negative space for dark overlay and large text, ultra wide 2:1 format, premium magazine photography, textured surfaces, shot on 35mm lens --ar 2:1 --style raw`
      ),
      section: 'blog',
    })
  })

  // Photo auteur
  if (niche.author.slug) {
    slots.push({
      id: `author-${niche.author.slug}`,
      path: `/images/authors/${niche.author.slug}.webp`,
      width: 400,
      height: 400,
      alt: `Photo de ${niche.author.name}`,
      description: 'Photo de l\'auteur principal, format carré. Affichée sur la page auteur, les articles, et la section AuthorTeaser de la home.',
      prompt: `Professional portrait photo of ${niche.author.name || 'the author'}, editorial magazine style, natural lighting, neutral background, 1:1 square format, shot on 85mm lens --ar 1:1 --style raw`,
      section: 'author',
    })
  }

  return slots
}

// ─── API publique ───────────────────────────────────────────────────────

/** Retourne tous les slots (statiques + dynamiques depuis niche.config). */
export function getAllImageSlots(): ImageSlot[] {
  return [...STATIC_SLOTS, ...dynamicSlots()]
}

/** Retourne un slot par son ID. */
export function getImageSlot(id: string): ImageSlot | undefined {
  return getAllImageSlots().find((s) => s.id === id)
}

/** Retourne les slots groupés par section. */
export function getImageSlotsBySection(): Record<string, ImageSlot[]> {
  const slots = getAllImageSlots()
  const grouped: Record<string, ImageSlot[]> = {}
  for (const slot of slots) {
    if (!grouped[slot.section]) grouped[slot.section] = []
    grouped[slot.section].push(slot)
  }
  return grouped
}
