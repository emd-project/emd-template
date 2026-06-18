/**
 * AffiliateButton — CTA lien externe propre (dé-affiliation).
 * EMD n'a aucune affiliation : plus de tag ni de rel="nofollow sponsored".
 * Rend un lien externe propre (rel="noopener noreferrer", target="_blank").
 * Variants : primary (--accent-1) | secondary (--bg-surface-2) | ghost.
 * Icône ExternalLink lucide-react inline. Nom/export/props conservés.
 * Server Component — hover via CSS :hover (pas de JS).
 */

import { ExternalLink } from 'lucide-react'

type AffiliateButtonVariant = 'primary' | 'secondary' | 'ghost'

type AffiliateButtonProps = {
  href: string
  label: string
  variant?: AffiliateButtonVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const STYLES: Record<AffiliateButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--accent-1)',
    color: 'var(--bg-primary)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--bg-surface-2)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-strong)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--accent-1)',
    border: '1px solid var(--accent-1)',
  },
}

const SIZES: Record<string, React.CSSProperties> = {
  sm: { fontSize: '13px', padding: 'var(--space-2) var(--space-4)', gap: 'var(--space-2)' },
  md: { fontSize: '15px', padding: 'var(--space-3) var(--space-6)', gap: 'var(--space-3)' },
  lg: { fontSize: '17px', padding: 'var(--space-4) var(--space-8)', gap: 'var(--space-3)' },
}

export function AffiliateButton({
  href,
  label,
  variant = 'primary',
  size = 'md',
  className,
}: AffiliateButtonProps) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 700,
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        transition: 'transform var(--duration) var(--ease-out), box-shadow var(--duration) var(--ease-out)',
        cursor: 'pointer',
        ...STYLES[variant],
        ...SIZES[size],
      }}
      onMouseEnter={undefined}
      // Hover géré par globals CSS + class utilitaire si nécessaire
    >
      {label}
      <ExternalLink size={14} aria-hidden="true" strokeWidth={2.5} />
    </a>
  )
}
