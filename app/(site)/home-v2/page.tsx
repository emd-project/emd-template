import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** Preview variante home « Comparateur ». noindex — supprimé à l'init du site. */
export const metadata: Metadata = {
  title: 'Preview — Home Comparateur',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV2() {
  return <HomeRouter locale="fr" variant="comparateur" />
}
