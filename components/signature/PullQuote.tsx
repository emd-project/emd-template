type PullQuoteProps = {
  children: string
  attribution?: string
}

export function PullQuote({ children, attribution }: PullQuoteProps) {
  return (
    <figure
      className="pull-quote"
      style={{
        margin: 'var(--space-10) 0',
        padding: 'var(--space-8) var(--space-6)',
        borderLeft: '3px solid var(--accent-1)',
        position: 'relative',
      }}
    >
      <blockquote
        style={{
          fontFamily: 'var(--next-font-display), serif',
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 700,
          fontStyle: 'italic',
          lineHeight: 1.35,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption
          style={{
            marginTop: 'var(--space-3)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.02em',
          }}
        >
          — {attribution}
        </figcaption>
      )}
    </figure>
  )
}
