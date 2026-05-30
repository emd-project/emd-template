import { niche } from '@/niche.config'

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? niche.affiliateTag
const AMAZON_DOMAINS = /amazon\.(fr|com|co\.uk|de|es|it)/i

export function addAffiliateTag(href: string): string {
  if (!AMAZON_TAG) return href
  try {
    const url = new URL(href)
    if (AMAZON_DOMAINS.test(url.hostname)) {
      url.searchParams.set('tag', AMAZON_TAG)
      url.searchParams.delete('ref')
      return url.toString()
    }
  } catch {
    // Invalid URL — return as-is
  }
  return href
}
