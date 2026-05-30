/**
 * Pagination — navigation entre pages de listing.
 * Server Component — pur HTML/Link, zéro JS client.
 * Affiche au plus 5 numéros autour de la page courante.
 */
import Link from 'next/link'
import type { CSSProperties } from 'react'

type Props = {
  currentPage: number
  totalPages: number
  /** Base URL sans query string — ex: "/blog" ou "/blog/categorie" */
  basePath: string
}

function pageHref(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}?page=${page}`
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null

  // Fenêtre de 5 pages autour de la page courante
  const delta = 2
  const start = Math.max(1, currentPage - delta)
  const end = Math.min(totalPages, currentPage + delta)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const btnBase: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '36px', height: '36px', padding: '0 var(--space-2)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px', fontWeight: 500,
    border: '1px solid var(--border)',
    textDecoration: 'none',
    transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
  }

  return (
    <nav aria-label="Pagination" style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-8) 0' }}>
      {/* Précédent */}
      {currentPage > 1 ? (
        <Link href={pageHref(basePath, currentPage - 1)} aria-label="Page précédente" style={{ ...btnBase, color: 'var(--text-secondary)', background: 'transparent' }}>
          ←
        </Link>
      ) : (
        <span style={{ ...btnBase, color: 'var(--text-muted)', background: 'transparent', cursor: 'not-allowed', opacity: 0.4 }}>←</span>
      )}

      {/* Ellipse gauche */}
      {start > 2 && (
        <>
          <Link href={basePath} style={{ ...btnBase, color: 'var(--text-secondary)', background: 'transparent' }}>1</Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>…</span>
        </>
      )}
      {start === 2 && (
        <Link href={basePath} style={{ ...btnBase, color: 'var(--text-secondary)', background: 'transparent' }}>1</Link>
      )}

      {/* Pages */}
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(basePath, page)}
          aria-current={page === currentPage ? 'page' : undefined}
          style={{
            ...btnBase,
            background: page === currentPage ? 'var(--accent-1)' : 'transparent',
            color: page === currentPage ? '#FFFFFF' : 'var(--text-secondary)',
            borderColor: page === currentPage ? 'var(--accent-1)' : 'var(--border)',
            fontWeight: page === currentPage ? 700 : 500,
          }}
        >
          {page}
        </Link>
      ))}

      {/* Ellipse droite */}
      {end < totalPages - 1 && (
        <>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>…</span>
          <Link href={pageHref(basePath, totalPages)} style={{ ...btnBase, color: 'var(--text-secondary)', background: 'transparent' }}>{totalPages}</Link>
        </>
      )}
      {end === totalPages - 1 && (
        <Link href={pageHref(basePath, totalPages)} style={{ ...btnBase, color: 'var(--text-secondary)', background: 'transparent' }}>{totalPages}</Link>
      )}

      {/* Suivant */}
      {currentPage < totalPages ? (
        <Link href={pageHref(basePath, currentPage + 1)} aria-label="Page suivante" style={{ ...btnBase, color: 'var(--text-secondary)', background: 'transparent' }}>
          →
        </Link>
      ) : (
        <span style={{ ...btnBase, color: 'var(--text-muted)', background: 'transparent', cursor: 'not-allowed', opacity: 0.4 }}>→</span>
      )}
    </nav>
  )
}
