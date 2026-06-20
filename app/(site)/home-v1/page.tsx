import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** Preview variante home « Magazine ». noindex — supprimé à l'init du site. */
export const metadata: Metadata = {
  title: 'Preview — Home Magazine',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV1() {
  return <HomeRouter locale="fr" variant="magazine" />
}
