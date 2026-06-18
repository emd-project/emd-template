/**
 * AffiliateLink — lien externe propre (dé-affiliation).
 *
 * EMD n'a aucune affiliation. Ce composant rend désormais un simple lien externe
 * (rel="noopener noreferrer", target="_blank") SANS tag ni rel d'affiliation
 * ("nofollow sponsored" retiré). Le nom/export/props sont conservés pour que tout
 * le MDX et le JSX qui l'utilise (ProductCTA, AutoProductCTAs…) compile toujours.
 * Server Component.
 */

type AffiliateLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function AffiliateLink({ href, children, className, style }: AffiliateLinkProps) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}
