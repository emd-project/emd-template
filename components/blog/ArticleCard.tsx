/**
 * ArticleCard — carte article éditoriale.
 * Si featureImage est présente → affiche l'image en haut de la carte.
 * Sinon → design typographique pur avec border-left/top accent.
 * Variant controlled by niche.style.cards: 'bordered' | 'filled' | 'minimal'.
 * Server Component.
 */
import Link from 'next/link'
import Image from 'next/image'
import Balancer from 'react-wrap-balancer'
import type { ArticleMeta } from '@/lib/blog'
import { CATEGORY_LABELS, CATEGORY_ACCENT, formatDate, articleHref } from '@/lib/blog'
import { niche } from '@/niche.config'

type Props = {
  article: ArticleMeta
  featured?: boolean
  showCategory?: boolean
  index?: number
}

/* ── Style helpers per card variant ────────────────────────────── */

function featuredStyle(accent: string, hasImage: boolean): React.CSSProperties {
  const variant = niche.style.cards

  const base: React.CSSProperties = {
    paddingTop: 'var(--space-2)',
    paddingBottom: 'var(--space-2)',
    overflow: 'hidden',
  }

  if (variant === 'filled') {
    return {
      ...base,
      background: `color-mix(in srgb, ${accent} 6%, var(--bg-surface))`,
      border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
    }
  }

  if (variant === 'minimal') {
    return {
      ...base,
      borderBottom: '1px solid var(--border)',
      paddingBottom: 'var(--space-5)',
    }
  }

  // bordered (default)
  return {
    ...base,
    borderLeft: hasImage ? 'none' : `4px solid ${accent}`,
    paddingLeft: hasImage ? 0 : 'var(--space-6)',
  }
}

function normalStyle(accent: string, hasImage: boolean): React.CSSProperties {
  const variant = niche.style.cards

  const base: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 'var(--space-4)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  }

  if (variant === 'filled') {
    return {
      ...base,
      background: `color-mix(in srgb, ${accent} 8%, var(--bg-surface))`,
      border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
    }
  }

  if (variant === 'minimal') {
    return {
      ...base,
      borderBottom: '1px solid var(--border)',
      paddingTop: 'var(--space-4)',
    }
  }

  // bordered (default)
  return {
    ...base,
    borderTop: hasImage ? 'none' : `3px solid ${accent}`,
    paddingTop: hasImage ? 0 : 'var(--space-5)',
  }
}

/** Whether the watermark number should render. */
function showWatermark(): boolean {
  return niche.style.cards === 'bordered'
}

export function ArticleCard({ article, featured = false, showCategory = true, index }: Props) {
  const accent = CATEGORY_ACCENT[article.categorie] ?? 'var(--accent-1)'
  const label = CATEGORY_LABELS[article.categorie] ?? article.categorie
  const variant = niche.style.cards
  const hasImage = !!article.featureImage

  if (featured) {
    return (
      <Link href={articleHref(article)} style={{ textDecoration: 'none', display: 'block' }}>
        <article
          className="article-card"
          style={featuredStyle(accent, hasImage)}
        >
          {article.featureImage && (
            <Image
              src={article.featureImage}
              alt={article.title}
              width={960}
              height={540}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginBottom: 'var(--space-4)',
              }}
            />
          )}
          {showCategory && (
            <p style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: accent,
              margin: '0 0 var(--space-3)',
              /* minimal: plain colored text, no chip styling needed — same markup */
            }}>
              {label}
            </p>
          )}
          <h2
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: variant === 'minimal' ? 'clamp(28px, 4vw, 52px)' : 'clamp(24px, 3.5vw, 44px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              margin: '0 0 var(--space-4)',
              textWrap: 'balance',
              transition: 'color 180ms ease',
            }}
            className="article-card-title"
          >
            <Balancer>{article.title}</Balancer>
          </h2>
          {article.description && (
            <p style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 var(--space-4)', maxWidth: '680px' }}>
              {article.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '12px', color: 'var(--text-muted)', alignItems: 'center' }}>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingTimeMin} min de lecture</span>
          </div>
        </article>
      </Link>
    )
  }

  const num = index !== undefined ? String(index + 1).padStart(2, '0') : null

  return (
    <Link href={articleHref(article)} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article
        className="article-card"
        style={normalStyle(accent, hasImage)}
      >
        {article.featureImage ? (
          <Image
            src={article.featureImage}
            alt={article.title}
            width={480}
            height={270}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--space-2)',
            }}
          />
        ) : (
          /* Numéro oversize en watermark — only for 'bordered' variant */
          showWatermark() && num && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-8px',
                right: 'var(--space-2)',
                fontFamily: 'var(--next-font-mono), monospace',
                fontSize: '72px',
                fontWeight: 800,
                color: accent,
                opacity: 0.06,
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {num}
            </span>
          )
        )}
        {showCategory && (
          <p style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: accent,
            margin: 0,
          }}>
            {label}
          </p>
        )}
        <h2
          className="article-card-title"
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            textWrap: 'balance',
            flex: 1,
            margin: 0,
            transition: 'color 180ms ease',
          }}
        >
          <Balancer>{article.title}</Balancer>
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto', alignItems: 'center' }}>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{article.readingTimeMin} min</span>
        </div>
      </article>
    </Link>
  )
}
