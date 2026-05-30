/**
 * AuthorCard — carte auteur sans photo.
 * Identité : monogramme CSS initiale en Syne 800.
 * Variants : 'inline' (en bas d'article) | 'full' (page auteur).
 * Server Component.
 */

import Link from 'next/link'
import { t } from '@/lib/i18n'

type AuthorCardVariant = 'inline' | 'full'

type AuthorCardProps = {
  authorSlug: string
  authorName?: string
  bio: string
  variant?: AuthorCardVariant
}

function Monogram({ size, initial = '?' }: { size: number; initial?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(135deg, rgba(255,61,87,0.15) 0%, rgba(123,97,255,0.10) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: size * 0.4,
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1,
          opacity: 0.85,
        }}
      >
        {initial}
      </span>
    </div>
  )
}

export function AuthorCard({
  authorSlug,
  authorName = '',
  bio,
  variant = 'inline',
}: AuthorCardProps) {
  const isInline = variant === 'inline'

  return (
    <div
      style={{
        display: 'flex',
        gap: isInline ? 'var(--space-4)' : 'var(--space-6)',
        alignItems: 'flex-start',
        padding: isInline ? 'var(--space-5) 0' : 'var(--space-8)',
        borderTop: '1px solid var(--glass-border)',
      }}
    >
      <Monogram size={isInline ? 44 : 64} initial={authorName.charAt(0).toUpperCase() || '?'} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-1)' }}>
          <Link
            href={`/auteurs/${authorSlug}`}
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontWeight: 700,
              fontSize: isInline ? '15px' : '20px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
          >
            {authorName}
          </Link>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          {bio}
        </p>

        {!isInline && (
          <Link
            href={`/auteurs/${authorSlug}`}
            style={{
              display: 'inline-block',
              marginTop: 'var(--space-4)',
              fontSize: '13px',
              color: 'var(--accent-1)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {t('authorCard.viewAllArticles')}
          </Link>
        )}
      </div>
    </div>
  )
}
