/**
 * SectionDivider — séparateur éditorial typographique.
 * Variant 'rule'   : filet + label en petites caps, ancré à gauche.
 * Variant 'number' : numéro watermark oversize Syne 800.
 * Variant 'diagonal': clip-path diagonal entre deux sections.
 * Jamais de vague SVG générique.
 * Server Component.
 */

type SectionDividerProps = {
  variant?: 'rule' | 'number' | 'diagonal'
  label?: string
  number?: string
  className?: string
}

export function SectionDivider({
  variant = 'rule',
  label,
  number,
  className,
}: SectionDividerProps) {
  if (variant === 'number') {
    return (
      <div
        className={className}
        style={{ position: 'relative', pointerEvents: 'none', userSelect: 'none' }}
        aria-hidden="true"
      >
        <span className="section-watermark">{number ?? '01'}</span>
      </div>
    )
  }

  if (variant === 'diagonal') {
    return (
      <div
        className={className}
        aria-hidden="true"
        style={{
          height: '80px',
          background: 'var(--bg-surface)',
          clipPath: 'polygon(0 0, 100% 60%, 100% 100%, 0 100%)',
        }}
      />
    )
  }

  // variant === 'rule' (défaut)
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-6) 0',
      }}
    >
      {label && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
      <div
        aria-hidden="true"
        style={{
          flex: 1,
          height: '1px',
          background: 'var(--border)',
        }}
      />
    </div>
  )
}
