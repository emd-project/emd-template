/**
 * Image OpenGraph de la locale par DÉFAUT (et repli de tout le site).
 * Le rendu vit dans components/og/SiteOgImage.tsx, partagé avec app/en/opengraph-image.tsx.
 */
import { niche } from '@/niche.config'
import { ogAlt, renderSiteOgImage, OG_SIZE } from '@/components/og/SiteOgImage'

export const runtime = 'edge'
export const alt = ogAlt(niche.defaultLocale)
export const size = OG_SIZE
export const contentType = 'image/png'

export default function OGImage() {
  return renderSiteOgImage(niche.defaultLocale)
}
