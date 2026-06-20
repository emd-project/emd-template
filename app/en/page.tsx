/**
 * /en — English home. Mirror of app/(site)/page.tsx.
 *
 * Both share the SAME locale-aware variant components via <HomeRouter> — no more
 * inline EN duplicate. The variant is resolved from niche.config (lib/variants.ts);
 * copy is localised through tl('en', …), articles via the EN mirror, URLs prefixed /en.
 */
import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return {
    title: `${niche.siteName} | ${niche.tagline}`,
    description: niche.subtitle,
    alternates: {
      canonical: `${SITE_URL}/en`,
      languages: {
        fr: `${SITE_URL}/`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/`,
      },
    },
    openGraph: {
      title: niche.siteName,
      description: niche.subtitle,
      url: `${SITE_URL}/en`,
      siteName: niche.siteName,
      type: 'website',
      locale: 'en',
    },
  }
}

export default function HomePageEn() {
  return <HomeRouter locale="en" />
}
