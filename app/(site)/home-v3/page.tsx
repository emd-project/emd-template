import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** Preview variante home « Dual » (portail). noindex — supprimé à l'init du site. */
export const metadata: Metadata = {
  title: 'Preview — Home Dual',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV3() {
  return <HomeRouter locale="fr" variant="dual" />
}
