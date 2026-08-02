/**
 * AuthorCard — carte auteur.
 * Variants : 'inline' (en bas d'article) | 'full' (page auteur).
 * Server Component.
 *
 * IMAGE STRUCTURELLE : le portrait `author-<slug>` du registre `lib/image-slots`
 * est rendu en rond, à la taille du monogramme. Le slot n'existe que si
 * `niche.author.slug` est renseigné — donc pas dans le template nu, où la carte
 * garde son monogramme CSS (initiale en display 800). Le portrait n'est servi que
 * pour l'auteur DU SITE : une carte affichée pour un autre `authorSlug` retombe
 * elle aussi sur le monogramme.
 */

import Link from 'next/link'
import Image from 'next/image'
import { tl } from '@/lib/i18n'
import { niche } from '@/niche.config'
import { getAuthorImage } from '@/lib/image-slots'

type AuthorCardVariant = 'inline' | 'full'

type AuthorCardProps = {
  authorSlug: string
  authorName?: string
  bio: string
  variant?: AuthorCardVariant
  /** Locale active (défaut fr). */
  locale?: string
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
  locale = 'fr',
}: AuthorCardProps) {
  const isInline = variant === 'inline'
  const size = isInline ? 44 : 64

  const portrait = authorSlug === niche.author.slug ? getAuthorImage() : undefined

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
      {portrait ? (
        <Image
          src={portrait.path}
          alt={portrait.alt}
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: 'var(--radius-full)',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      ) : (
        <Monogram size={size} initial={authorName.charAt(0).toUpperCase() || '?'} />
      )}

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
            {tl(locale, 'authorCard.viewAllArticles')}
          </Link>
        )}
      </div>
    </div>
  )
}
