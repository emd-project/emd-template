'use client'

/**
 * FaqAccordion — FAQ en accordéon cliquable.
 * Chaque question se déplie au clic. Une seule ouverte à la fois.
 * 'use client' isolé — les pages article restent Server Component.
 */

import { useState } from 'react'

type FaqItem = { q: string; a: string }

export function FaqAccordion({ items = [] }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      {items.map(({ q, a }, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4) 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--next-font-primary), system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    lineHeight: 1.4,
                  }}
                >
                  {q}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    fontSize: '18px',
                    color: 'var(--text-muted)',
                    transition: 'transform 200ms ease',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                  }}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              style={{
                overflow: 'hidden',
                maxHeight: isOpen ? '500px' : '0',
                transition: 'max-height 300ms ease',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  margin: 0,
                  paddingBottom: 'var(--space-4)',
                }}
              >
                {a}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
