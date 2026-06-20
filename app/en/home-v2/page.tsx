import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** EN preview — Comparateur home. noindex — removed at site init. */
export const metadata: Metadata = {
  title: 'Preview — Home Comparateur (EN)',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV2En() {
  return <HomeRouter locale="en" variant="comparateur" />
}
