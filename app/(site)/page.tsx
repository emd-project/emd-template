import type { Metadata } from 'next'
import { MagazineHome } from '@/components/home/MagazineHome'
import { ComparateurHome } from '@/components/home/ComparateurHome'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

/**
 * Home — archétype piloté par niche.style.hero :
 *  - 'split'            → comparateur (hero split + outils)
 *  - 'centered'/'minimal' (défaut) → magazine (mosaïque éditoriale)
 */

/**
 * hreflang réciproque (bloc 4) : la home FR pointe vers son miroir EN (/en).
 * Additif — le <title>/description restent ceux du root layout (title.default),
 * on n'émet ici que le canonical + les alternates languages.
 */
export function generateMetadata(): Metadata {
  return {
    alternates: {
      canonical: `${SITE_URL}/`,
      languages: {
        fr: `${SITE_URL}/`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/`,
      },
    },
  }
}

export default function HomePage() {
  return niche.style.hero === 'split' ? <ComparateurHome /> : <MagazineHome />
}
