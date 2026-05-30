'use client'

import { useState } from 'react'
import { AffiliateLink } from '@/components/ui/AffiliateLink'

export type Deal = {
  titre: string
  categorie: string
  prixAvant: number
  prixApres: number
  source: string
  chaud: boolean
  date: string
  amazonUrl: string
}

type Props = {
  deals: Deal[]
}

const FILTER_ALL = 'Tous'

export function DealsGrid({ deals }: Props) {
  const categories = [FILTER_ALL, ...Array.from(new Set(deals.map((d) => d.categorie)))]
  const [active, setActive] = useState(FILTER_ALL)

  const filtered = active === FILTER_ALL ? deals : deals.filter((d) => d.categorie === active)

  return (
    <div>
      {/* Filtres par catégorie */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            style={{
              background: active === cat ? 'var(--accent-1)' : 'var(--bg-surface)',
              color: active === cat ? '#fff' : 'var(--text-secondary)',
              border: active === cat ? '1px solid var(--accent-1)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-2) var(--space-4)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grille de deals */}
      <ul
        role="list"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-5)',
          listStyle: 'none',
        }}
      >
        {filtered.map((deal) => {
          const economie = deal.prixAvant - deal.prixApres
          const pct = Math.round((economie / deal.prixAvant) * 100)
          return (
            <li key={deal.titre}>
              <article
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  position: 'relative',
                }}
              >
                {deal.chaud && (
                  <span
                    aria-label="Deal chaud"
                    style={{
                      position: 'absolute',
                      top: 'var(--space-3)',
                      right: 'var(--space-3)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--bg-primary)',
                      background: 'var(--accent-1)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      animation: 'pulse-accent 2s ease-in-out infinite',
                    }}
                  >
                    HOT
                  </span>
                )}

                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {deal.categorie} · {deal.source}
                  </span>
                  <h2
                    style={{
                      fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                    }}
                  >
                    {deal.titre}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--next-font-mono), monospace',
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: 'var(--accent-2)',
                    }}
                  >
                    {deal.prixApres.toLocaleString('fr-FR')} €
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--next-font-mono), monospace',
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {deal.prixAvant.toLocaleString('fr-FR')} €
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--bg-primary)',
                      background: 'var(--accent-3)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    −{pct}%
                  </span>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <AffiliateLink
                    href={deal.amazonUrl}
                    style={{
                      display: 'inline-block',
                      background: 'var(--accent-1)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: 'var(--space-2) var(--space-5)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Profiter du deal →
                  </AffiliateLink>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Vérifié le{' '}
                    <time dateTime={deal.date}>
                      {new Date(deal.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </time>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
