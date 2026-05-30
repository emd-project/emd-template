/**
 * ArticleTicker — bandeau horizontal scrollant des articles récents.
 * CSS animation marquee, pause au hover, prefers-reduced-motion respecté.
 * Server Component.
 */
import Link from 'next/link'
import { getAllArticles, CATEGORY_LABELS, CATEGORY_ACCENT, articleHref } from '@/lib/blog'

export function ArticleTicker() {
  const articles = getAllArticles().slice(0, 10)
  if (articles.length < 2) return null

  // On duplique pour la boucle infinie
  const items = [...articles, ...articles]

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fondu bords */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          maskImage: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 8%, transparent 92%, var(--bg-primary) 100%)',
          WebkitMaskImage: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 8%, transparent 92%, var(--bg-primary) 100%)',
        }}
      />

      <div
        className="article-ticker-track"
        style={{
          display: 'flex',
          gap: 0,
          width: 'max-content',
        }}
        role="marquee"
        aria-label="Articles récents"
      >
        {items.map((article, i) => {
          const accent = CATEGORY_ACCENT[article.categorie] ?? 'var(--accent-1)'
          const label = CATEGORY_LABELS[article.categorie] ?? article.categorie
          return (
            <Link
              key={`${article.slug}-${i}`}
              href={articleHref(article)}
              aria-hidden={i >= articles.length} // les doublons sont cachés aux lecteurs d'écran
              tabIndex={i >= articles.length ? -1 : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-6)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderRight: '1px solid var(--border)',
                transition: 'background 150ms ease',
              }}
              className="ticker-item"
            >
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: accent }}>
                {label}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {article.title}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
