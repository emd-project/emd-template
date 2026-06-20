import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** Preview variante home « Marché en direct ». noindex — supprimé à l'init du site. */
export const metadata: Metadata = {
  title: 'Preview — Home Marché',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV3() {
  return <HomeRouter locale="fr" variant="marche" />
}
