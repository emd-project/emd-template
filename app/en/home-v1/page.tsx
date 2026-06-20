import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'

/** EN preview — Magazine home. noindex — removed at site init. */
export const metadata: Metadata = {
  title: 'Preview — Home Magazine (EN)',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV1En() {
  return <HomeRouter locale="en" variant="magazine" />
}
