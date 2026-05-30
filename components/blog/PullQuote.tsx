/**
 * PullQuote — citation extraite du texte, affichée en grand.
 * Ligne verticale gradient aurora à gauche + texte italic display.
 * Usage MDX : <PullQuote>Le choix dépend de l'écosystème, pas des specs.</PullQuote>
 * Server Component.
 */
import type { ReactNode } from 'react'

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      style={{
        margin: 'var(--space-10) 0',
        padding: 'var(--space-4) 0 var(--space-4) var(--space-6)',
        position: 'relative',
        borderLeft: 'none',
      }}
    >
      {/* Ligne verticale gradient aurora */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: 'linear-gradient(180deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))',
          borderRadius: '2px',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: 'clamp(22px, 3.5vw, 30px)',
          fontWeight: 700,
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          margin: 0,
          textWrap: 'balance',
        }}
      >
        {children}
      </p>
    </blockquote>
  )
}
