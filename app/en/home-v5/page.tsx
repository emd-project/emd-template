import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'
import { PresseStyle } from '@/components/presse/PresseStyle'

/** EN preview — Presse home (editorial identity). noindex — removed at site init. */
export const metadata: Metadata = {
  title: 'Preview — Home Presse (EN)',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV5En() {
  return (
    <>
      <PresseStyle />
      <HomeRouter locale="en" variant="presse" />
    </>
  )
}
