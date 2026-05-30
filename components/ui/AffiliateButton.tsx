/**
 * AffiliateButton — CTA affilié Amazon avec micro-animation hover CSS.
 * Variants : primary (--accent-1) | secondary (--bg-surface-2) | ghost.
 * Icône ExternalLink lucide-react inline.
 * Server Component — hover via CSS :hover (pas de JS).
 */

import { ExternalLink } from 'lucide-react'
import { addAffiliateTag } from '@/lib/utils/affiliate'

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
      href={addAffiliateTag(href)}
      rel="nofollow sponsored noopener"
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
