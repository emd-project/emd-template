/**
 * Verdict — conclusion éditoriale, accent-1 (rouge).
 * Usage MDX : <Verdict>Notre recommandation ici</Verdict>
 */
import type { ReactNode } from 'react'

export function Verdict({ children }: { children: ReactNode }) {
  return (
    <aside
      style={{
        margin: 'var(--space-10) 0',
        borderTop: '2px solid var(--accent-1)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 'var(--space-5)',
        paddingBottom: 'var(--space-5)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--next-font-mono), monospace',
          fontWeight: 600,
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--accent-1)',
          margin: '0 0 var(--space-3)',
        }}
      >
        Notre verdict
      </p>
      <div
        style={{
          color: 'var(--text-primary)',
          fontSize: '16px',
          lineHeight: 1.65,
          fontWeight: 500,
        }}
      >
        {children}
      </div>
    </aside>
  )
}
