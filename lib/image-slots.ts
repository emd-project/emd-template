/**
 * Registre des images STRUCTURELLES du site — source unique des ids, chemins,
 * dimensions et prompts.
 *
 * ┌─ POURQUOI CE FICHIER A MAIGRI ────────────────────────────────────────────┐
 * │ Il déclarait 24 emplacements. Un audit du rendu, le 2026-08-02, en a       │
 * │ trouvé ZÉRO de consommé : `ImagePlaceholder`, seul composant appelant      │
 * │ `getImageSlot`, n'était importé nulle part. Le registre n'était lu que par │
 * │ `/admin/images`. Toutes ces images étaient générées — la partie la plus    │
 * │ longue d'un run de provisionnement — poussées dans `public/`, et affichées │
 * │ sur aucune page.                                                           │
 * │                                                                            │
 * │ Il ne reste que ce qui s'affiche : un hero, une couverture par catégorie,  │
 * │ un portrait d'auteur. Pour un site à six catégories : 8 générations au     │
 * │ lieu de 24.                                                                │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * **Règle : on n'ajoute pas un slot ici sans le brancher dans un composant.**
 * Un emplacement déclaré et non rendu coûte une génération, un aller-retour
 * réseau et une ligne dans la checklist — pour rien.
 *
 * Ce que ce registre NE couvre PAS, volontairement :
 * - les **covers d'articles**, qui viennent du `featureImage` du frontmatter et
 *   sont produites par la tâche de rédaction quotidienne, article par article ;
 * - l'**image OpenGraph**, générée dynamiquement par `app/opengraph-image.tsx` ;
 * - les images **in-content** d'un article, qui RÉUTILISENT la couverture de
 *   leur catégorie plutôt que d'en générer une nouvelle.
 *
 * Les prompts sont écrits pour Gemini / Nano Banana : courts (≤ ~20 mots),
 * descriptifs, finissant par « no text, no logos, no watermark ».
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
  section: 'home' | 'category' | 'author'
}

/** Remplace les jetons de niche dans un prompt. */
function p(str: string): string {
  return str
    .replace(/\[niche\]/g, niche.entity)
    .replace(/\[nicheEn\]/g, niche.entities)
    .replace(/\[tagline\]/g, niche.tagline)
}

const NEG = 'no text, no logos, no watermark'

// ─── Slot statique ──────────────────────────────────────────────────────

const STATIC_SLOTS: ImageSlot[] = [
  {
    id: 'home-hero',
    path: '/images/home/hero.webp',
    width: 1920,
    height: 1080,
    alt: 'Illustration principale du site',
    description:
      "Image de tête de la home. C'est la première chose qu'un lecteur voit : elle porte le parti pris de la DA plus que n'importe quelle autre.",
    prompt: p(
      `Cinematic editorial background, [niche] theme, moody atmospheric lighting, shallow depth of field, muted color grading, premium magazine aesthetic, ${NEG}`
    ),
    section: 'home',
  },
]

// ─── Slots dynamiques ───────────────────────────────────────────────────

function dynamicSlots(): ImageSlot[] {
  const slots: ImageSlot[] = []

  /**
   * UNE image par catégorie, pour TROIS emplacements :
   *   1. la carte de la catégorie sur la home,
   *   2. l'en-tête de la page hub `/blog/[categorie]`,
   *   3. l'illustration in-content des articles de cette catégorie.
   *
   * C'est le meilleur rapport visible/généré du registre : une génération,
   * trois apparitions. L'ancien registre en demandait deux par catégorie —
   * une carte et un fond d'article — dont aucune n'était rendue.
   */
  niche.categories.forEach((cat) => {
    slots.push({
      id: `category-${cat.slug}`,
      path: `/images/categories/${cat.slug}.webp`,
      width: 1600,
      height: 900,
      alt: `Illustration ${cat.label}`,
      description: `Couverture de la catégorie « ${cat.label} » : carte sur la home, en-tête du hub /blog/${cat.slug}, et illustration in-content de ses articles.`,
      prompt: p(
        `Editorial photo representing ${cat.label} in the [niche] context, shallow depth of field, premium magazine style, balanced composition, ${NEG}`
      ),
      section: 'category',
    })
  })

  // Portrait de l'auteur — signature E-E-A-T, rendu sur la page auteur et la byline.
  if (niche.author.slug) {
    slots.push({
      id: `author-${niche.author.slug}`,
      path: `/images/authors/${niche.author.slug}.webp`,
      width: 512,
      height: 512,
      alt: `Photo de ${niche.author.name}`,
      description: "Portrait de l'auteur, carré. Page auteur, encart auteur en bas d'article.",
      prompt: `Professional editorial portrait, natural lighting, neutral background, candid and unglamorous, ${NEG}`,
      section: 'author',
    })
  }

  return slots
}

// ─── API publique ───────────────────────────────────────────────────────

/**
 * La checklist EXHAUSTIVE des images à générer à l'init.
 * Taille attendue : 1 hero + 1 par catégorie + 1 auteur.
 */
export function getAllImageSlots(): ImageSlot[] {
  return [...STATIC_SLOTS, ...dynamicSlots()]
}

/** Un slot par son id. */
export function getImageSlot(id: string): ImageSlot | undefined {
  return getAllImageSlots().find((s) => s.id === id)
}

/** Le slot de couverture d'une catégorie, par son slug. */
export function getCategoryImage(slug: string): ImageSlot | undefined {
  return getImageSlot(`category-${slug}`)
}

/** Le portrait de l'auteur du site, s'il est déclaré. */
export function getAuthorImage(): ImageSlot | undefined {
  return niche.author.slug ? getImageSlot(`author-${niche.author.slug}`) : undefined
}

/** Les slots groupés par section — utilisé par /admin/images. */
export function getImageSlotsBySection(): Record<string, ImageSlot[]> {
  const grouped: Record<string, ImageSlot[]> = {}
  for (const slot of getAllImageSlots()) {
    if (!grouped[slot.section]) grouped[slot.section] = []
    grouped[slot.section].push(slot)
  }
  return grouped
}
