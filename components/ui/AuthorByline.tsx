/**
 * AuthorByline — byline éditorial textuel, zéro photo.
 * Format : "Par [Auteur] · 5 min · 23 mars 2026"
 * Lien vers /auteurs/[authorSlug].
 * Server Component — rendu côté serveur, indexable.
 * `onDark` : variante texte clair pour pose sur un hero sombre (lisibilité).
 */

import Link from 'next/link'
import { tl } from '@/lib/i18n'

type AuthorBylineProps = {
  authorSlug: string
  authorName?: string
  publishedAt: string        // ISO 8601 : "2026-03-23"
  updatedAt?: string
  readingTimeMin?: number
  /** Locale active (défaut fr). */
  locale?: string
  /** Pose sur fond sombre → texte clair lisible. */
  onDark?: boolean
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function AuthorByline({
  authorSlug,
  authorName = '',
  publishedAt,
  updatedAt,
  readingTimeMin,
  locale = 'fr',
  onDark = false,
}: AuthorBylineProps) {
  const displayDate = updatedAt && updatedAt !== publishedAt ? updatedAt : publishedAt

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        fontSize: '13px',
        color: onDark ? 'rgba(255,255,255,0.82)' : 'var(--text-secondary)',
      }}
    >
      <span>{tl(locale, 'article.by')}</span>
      <Link
        href={`/auteurs/${authorSlug}`}
        style={{
          color: onDark ? '#fff' : 'var(--text-primary)',
          fontWeight: 700,
          textDecoration: 'none',
          borderBottom: '1px solid var(--accent-1)',
          paddingBottom: '1px',
        }}
      >
        {authorName}
      </Link>

      {readingTimeMin !== undefined && (
        <>
          <span aria-hidden="true">·</span>
          <span>{tl(locale, 'article.readingTime', { min: readingTimeMin })}</span>
        </>
      )}

      <span aria-hidden="true">·</span>

      <time dateTime={displayDate}>
        {updatedAt && updatedAt !== publishedAt ? tl(locale, 'article.updatedOn') : ''}
        {formatDate(displayDate, locale)}
      </time>
    </div>
  )
}
