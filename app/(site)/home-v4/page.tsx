import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** Preview variante home « Le fil ». noindex — supprimé à l'init du site. */
export const metadata: Metadata = {
  title: 'Preview — Home Fil',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV4() {
  return <HomeRouter locale="fr" variant="fil" />
}
