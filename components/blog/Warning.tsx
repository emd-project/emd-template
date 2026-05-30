/**
 * Warning — callout éditorial accent-2 (ambre).
 * Usage MDX : <Warning>Texte ici</Warning>
 */
import type { ReactNode } from 'react'

export function Warning({ children }: { children: ReactNode }) {
  return (
    <aside
      role="note"
      style={{
        margin: 'var(--space-6) 0',
        borderTop: '2px solid var(--accent-2)',
        paddingTop: 'var(--space-4)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--next-font-mono), monospace',
          fontWeight: 600,
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--accent-2)',
          margin: '0 0 var(--space-2)',
        }}
      >
        Attention
      </p>
      <div style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.65 }}>
        {children}
      </div>
    </aside>
  )
}
