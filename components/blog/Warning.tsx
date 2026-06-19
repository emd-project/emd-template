/**
 * Warning — callout éditorial accent-2 (ambre).
 * Usage MDX : <Warning>Texte ici</Warning>
 */
import type { ReactNode } from 'react'
import { tl } from '@/lib/i18n'

export function Warning({ children, locale = 'fr' }: { children: ReactNode; locale?: string }) {
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
        {tl(locale, 'callout.warning')}
      </p>
      <div style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.65 }}>
        {children}
      </div>
    </aside>
  )
}
