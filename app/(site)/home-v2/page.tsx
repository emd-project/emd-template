import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/**
 * Preview variante home « Marché en direct ». noindex — supprimé à l'init du site.
 * Anciennement « Comparateur » : cette variante a été retirée le 2026-08-02, la
 * route est renumérotée sur `marche` pour coller à HOME_PREVIEW (lib/variants.ts).
 */
export const metadata: Metadata = {
  title: 'Preview — Home Marché',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV2() {
  return <HomeRouter locale="fr" variant="marche" />
}
