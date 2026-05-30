/**
 * AuroraBackground — lumières directionnelles ancrées, pas de blobs flottants.
 * Trois sources de lumière fixes (haut-gauche, haut-droite, bas-centre).
 * Animation : respiration (scale + opacité) uniquement — pas de translation.
 * mix-blend-mode:screen → les couleurs s'additionnent comme de la vraie lumière.
 * Server Component — CSS @keyframes uniquement.
 */

type AuroraBackgroundProps = {
  colors?: [string, string, string]
  speed?: 'slow' | 'medium' | 'fast'
  className?: string
  children?: React.ReactNode
}

const DURATIONS = { slow: '22s', medium: '13s', fast: '7s' } as const

export function AuroraBackground({
  colors = ['var(--aurora-1)', 'var(--aurora-2)', 'var(--aurora-3)'],
  speed = 'slow',
  className,
  children,
}: AuroraBackgroundProps) {
  const dur = DURATIONS[speed]

  const beam = (
    color: string,
    pos: { top?: string; bottom?: string; left?: string; right?: string },
    w: string,
    h: string,
    keyframe: string,
    delay: string,
  ) => (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: w,
        height: h,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${color}60 0%, ${color}20 35%, transparent 70%)`,
        filter: 'blur(90px)',
        mixBlendMode: 'screen',
        willChange: 'transform',
        animation: `${keyframe} ${dur} ease-in-out ${delay} infinite`,
        pointerEvents: 'none',
        ...pos,
      }}
    />
  )

  return (
    <div
      className={className}
      style={{ position: 'relative', isolation: 'isolate', overflow: 'hidden' }}
    >
      {/* Faisceau 1 — haut-gauche, rouge-corail */}
      {beam(colors[0], { top: '-15%', left: '-10%' }, '70vw', '70vh', 'aurora-breathe-1', '0s')}
      {/* Faisceau 2 — haut-droite, violet */}
      {beam(colors[1], { top: '-20%', right: '-15%' }, '55vw', '80vh', 'aurora-breathe-2', '-4s')}
      {/* Faisceau 3 — bas-centre, vert menthe */}
      {beam(colors[2], { bottom: '-25%', left: '20%' }, '60vw', '65vh', 'aurora-breathe-3', '-9s')}

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
