import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/**
 * Preview home variant « Live market ». noindex — removed when the site is init'd.
 * Formerly « Comparateur », a variant retired on 2026-08-02: the route is
 * renumbered onto `marche` to match HOME_PREVIEW (lib/variants.ts).
 */
export const metadata: Metadata = {
  title: 'Preview — Market home',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV2En() {
  return <HomeRouter locale="en" variant="marche" />
}
