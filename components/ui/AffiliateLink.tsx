/**
 * AffiliateLink — tout lien Amazon passe par addAffiliateTag().
 * rel="nofollow sponsored noopener" obligatoire.
 * Server Component.
 */

import { addAffiliateTag } from '@/lib/utils/affiliate'

type AffiliateLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function AffiliateLink({ href, children, className, style }: AffiliateLinkProps) {
  return (
    <a
      href={addAffiliateTag(href)}
      rel="nofollow sponsored noopener"
      target="_blank"
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}
