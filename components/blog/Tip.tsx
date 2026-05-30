/**
 * Tip — callout éditorial minimal.
 * Usage MDX : <Tip>Texte ou **markdown** ici</Tip>
 */
import type { ReactNode } from 'react'

export function Tip({ children }: { children: ReactNode }) {
  return (
    <aside
      role="note"
      style={{
        margin: 'var(--space-6) 0',
        paddingLeft: 'var(--space-8)',
        position: 'relative',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: '1px',
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--accent-3)',
          lineHeight: 1.65,
        }}
      >
        →
      </span>
      <div style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.65 }}>
        {children}
      </div>
    </aside>
  )
}
