import type { MetadataRoute } from 'next'
import { niche } from '@/niche.config'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

/**
 * robots.txt — autorise tout le contenu public, exclut les zones non publiques
 * (API + back-office CMS, déjà en noindex) et pointe vers le sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
