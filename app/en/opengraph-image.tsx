/**
 * Image OpenGraph des pages /en.
 *
 * Sans ce fichier, /en et ses descendants héritaient de l'image de la racine, dont
 * le titre est `niche.tagline` : les partages sociaux des pages anglaises sortaient
 * en français. Même rendu, même palette, mais résolu dans la locale 'en' — et sans
 * bloc `localized` dans niche.config, l'image est identique à celle de la racine.
 */
import { ogAlt, renderSiteOgImage, OG_SIZE } from '@/components/og/SiteOgImage'

export const runtime = 'edge'
export const alt = ogAlt('en')
export const size = OG_SIZE
export const contentType = 'image/png'

export default function OGImageEn() {
  return renderSiteOgImage('en')
}
