import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

/**
 * Home FR — variante résolue par le système de variantes (lib/variants.ts) :
 *  - niche.layouts.home si défini ('magazine' | 'comparateur' | 'marche' | 'fil')
 *  - sinon rétro-compat : niche.style.hero === 'split' → comparateur, sinon magazine
 * Preview : /home-v1 (magazine) · /home-v2 (comparateur) · /home-v3 (marché) · /home-v4 (fil).
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
  return <HomeRouter locale="fr" />
}
