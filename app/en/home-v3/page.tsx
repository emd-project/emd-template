import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** EN preview — Marche home. noindex — removed at site init. */
export const metadata: Metadata = {
  title: 'Preview — Home Marché (EN)',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV3En() {
  return <HomeRouter locale="en" variant="marche" />
}
