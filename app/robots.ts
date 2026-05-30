import type { MetadataRoute } from 'next'
import { niche } from '@/niche.config'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
