/**
 * Registre des images STRUCTURELLES du site — source unique des ids, chemins,
 * dimensions et prompts.
 *
 * ┌─ DEUX RÈGLES, ET ELLES DÉCIDENT DE TOUT ──────────────────────────────────┐
 * │                                                                            │
 * │ 1. **Un prompt qui marcherait à l'identique sur un autre site du réseau    │
 * │    est un prompt raté.** Les images sont le dernier endroit où l'empreinte │
 * │    partagée revient : on peut diverger sur la palette, la typo et les      │
 * │    effets, et sortir malgré tout dix sites illustrés de la même façon.     │
 * │    D'où l'injection systématique de `niche.signature` ci-dessous.          │
 * │                                                                            │
 * │ 2. **Une image décrit son SUJET, pas son secteur.** « voiture de luxe » ne │
 * │    donne rien ; « atelier de préparation, capot ouvert, lampe baladeuse »  │
 * │    donne une image. Vaut surtout pour les covers d'articles, qui ne sont   │
 * │    pas dans ce fichier mais suivent la même règle.                         │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ POURQUOI CE FICHIER A MAIGRI ────────────────────────────────────────────┐
 * │ Il déclarait 24 emplacements. Un audit du rendu, le 2026-08-02, en a       │
 * │ trouvé ZÉRO de consommé : `ImagePlaceholder`, seul composant appelant      │
 * │ `getImageSlot`, n'était importé nulle part. Toutes ces images étaient      │
 * │ générées — la partie la plus longue d'un run — et affichées sur aucune     │
 * │ page. Il ne reste que ce qui s'affiche.                                    │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * **On n'ajoute pas un slot ici sans le brancher dans un composant.**
 *
 * Ce que ce registre NE couvre PAS, volontairement :
 * - les **covers d'articles** (`featureImage` du frontmatter), produites une par
 *   une par la tâche de rédaction, à partir du sujet réel de l'article ;
 * - l'**image OpenGraph**, générée par `app/opengraph-image.tsx` ;
 * - les images **in-content**, qui RÉUTILISENT la couverture de leur catégorie.
 *
 * Prompts écrits pour Gemini / Nano Banana : courts, descriptifs, finissant par
 * les négatifs.
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

/** Remplace les jetons de niche dans un fragment de prompt. */
function p(str: string): string {
  return str
    .replace(/\[niche\]/g, niche.entity)
    .replace(/\[nicheEn\]/g, niche.entities)
    .replace(/\[tagline\]/g, niche.tagline)
}

const NEG = 'no text, no logos, no watermark'

/**
 * La direction visuelle du SITE, injectée dans chaque prompt.
 *
 * `signature.inspiration` et `signature.forbidden` sont renseignés à l'init par
 * l'art-director, à partir du parti pris — et n'étaient lus par aucun code.
 * C'est précisément ce qui manquait : sans eux, un site « papier fiduciaire,
 * cuivre et marine » et un site « atelier mécanique, métal brossé » produisaient
 * exactement les mêmes photos.
 */
function direction(): string {
  const insp = (niche.signature?.inspiration ?? []).filter(Boolean).slice(0, 3).join(', ')
  const forbid = (niche.signature?.forbidden ?? []).filter(Boolean).slice(0, 3).join(', ')
  const bits: string[] = []
  if (insp) bits.push(`visual direction: ${insp}`)
  if (forbid) bits.push(`avoid: ${forbid}`)
  bits.push(NEG)
  return bits.join(', ')
}

/** Compose un prompt : le sujet d'abord, la direction du site ensuite. */
function compose(subject: string): string {
  return `${p(subject)}, ${direction()}`
}

// ─── Slot statique ──────────────────────────────────────────────────────

function staticSlots(): ImageSlot[] {
  return [
    {
      id: 'home-hero',
      path: '/images/home/hero.webp',
      width: 1920,
      height: 1080,
      alt: `Illustration principale — ${niche.siteName}`,
      description:
        "Image de tête de la home. C'est la première chose qu'un lecteur voit : elle porte le parti pris de la DA plus que n'importe quelle autre image du site.",
      prompt: compose(
        `Editorial establishing shot for a guide about [nicheEn], atmospheric lighting, shallow depth of field, generous negative space for a headline`
      ),
      section: 'home',
    },
  ]
}

// ─── Slots dynamiques ───────────────────────────────────────────────────

function dynamicSlots(): ImageSlot[] {
  const slots: ImageSlot[] = []

  /**
   * UNE image par catégorie, pour TROIS emplacements : la carte de la home,
   * l'en-tête du hub `/blog/[categorie]`, et l'illustration in-content des
   * articles de cette catégorie. Une génération, trois apparitions.
   *
   * Le prompt part du LABEL de la catégorie, pas du secteur : c'est ce qui
   * distingue « Fiscalité & société » de « Occasion & budget » sur un même site.
   * Sa `description` sert de repli utile si l'agent réécrit le prompt.
   */
  niche.categories.forEach((cat) => {
    const topic = cat.description?.trim() || cat.label
    slots.push({
      id: `category-${cat.slug}`,
      path: `/images/categories/${cat.slug}.webp`,
      width: 1600,
      height: 900,
      alt: `Illustration — ${cat.label}`,
      description: `Couverture de « ${cat.label} » : carte sur la home, en-tête du hub /blog/${cat.slug}, illustration in-content de ses articles.`,
      prompt: compose(
        `Editorial photograph illustrating ${topic}, a concrete scene rather than a symbol, natural light, balanced composition`
      ),
      section: 'category',
    })
  })

  // Portrait de l'auteur. Son MÉTIER pilote l'image : une ancienne gestionnaire
  // de parc et une journaliste beauté ne doivent pas recevoir le même visage.
  if (niche.author.slug) {
    slots.push({
      id: `author-${niche.author.slug}`,
      path: `/images/authors/${niche.author.slug}.webp`,
      width: 512,
      height: 512,
      alt: `Photo de ${niche.author.name}`,
      description: "Portrait de l'auteur, carré. Page auteur et encart en bas d'article.",
      prompt: `Candid editorial portrait of a ${niche.author.title || 'specialist journalist'}, in their working environment, natural light, unglamorous and plausible, ${NEG}`,
      section: 'author',
    })
  }

  return slots
}

// ─── API publique ───────────────────────────────────────────────────────

/**
 * La checklist EXHAUSTIVE des images structurelles à générer à l'init :
 * 1 hero + 1 par catégorie + 1 auteur.
 */
export function getAllImageSlots(): ImageSlot[] {
  return [...staticSlots(), ...dynamicSlots()]
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

/**
 * Direction visuelle du site, exposée pour les images HORS registre — cover
 * d'article, notamment. Le sujet vient de l'article, la direction vient d'ici :
 * `\`${sujet concret de l'article}, ${imagePromptDirection()}\``.
 */
export function imagePromptDirection(): string {
  return direction()
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
