import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** EN preview — Fil home. noindex — removed at site init. */
export const metadata: Metadata = {
  title: 'Preview — Home Fil (EN)',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV4En() {
  return <HomeRouter locale="en" variant="fil" />
}
