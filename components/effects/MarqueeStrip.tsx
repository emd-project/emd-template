/**
 * MarqueeStrip — défilement CSS pur, zéro JS.
 * Contenu dupliqué 2× → translateX(-50%) crée une boucle seamless.
 * Fondu aux bords via mask-image (classe .marquee-container).
 * prefers-reduced-motion : animation stoppée via globals.css.
 * Server Component.
 */

type MarqueeStripProps = {
  children: React.ReactNode
  direction?: 'left' | 'right'
  speed?: 'slow' | 'medium' | 'fast'
  gap?: string
  pauseOnHover?: boolean
  className?: string
}

const DURATIONS = { slow: '50s', medium: '30s', fast: '16s' } as const

export function MarqueeStrip({
  children,
  direction = 'left',
  speed = 'medium',
  gap = 'var(--space-8)',
  pauseOnHover: _pauseOnHover = true,
  className,
}: MarqueeStripProps) {
  const dur = DURATIONS[speed]
  const keyframe = direction === 'left' ? 'marquee-left' : 'marquee-right'

  return (
    <div
      className={`marquee-container ${className ?? ''}`}
      style={{ overflow: 'hidden', display: 'flex' }}
      aria-hidden="true"
    >
      {/* 2 copies identiques pour boucle seamless — translateX(-50%) = 1 copie */}
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          gap,
          animation: `${keyframe} ${dur} linear infinite`,
          willChange: 'transform',
        }}
      >
        <span style={{ display: 'flex', gap, flexShrink: 0 }}>{children}</span>
        <span style={{ display: 'flex', gap, flexShrink: 0 }} aria-hidden="true">
          {children}
        </span>
      </div>
    </div>
  )
}
