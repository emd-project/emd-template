'use client'

import { useReducedMotion } from 'framer-motion'

type LettrineProps = {
  children: string
}

export function Lettrine({ children }: LettrineProps) {
  const reduced = useReducedMotion()

  if (!children || children.length === 0) return null

  const first = children.charAt(0)
  const rest = children.slice(1)

  return (
    <p className="lettrine-paragraph" style={{ lineHeight: 1.7, fontSize: '17px', color: 'var(--text-secondary)' }}>
      <span
        className="lettrine-cap"
        style={{
          float: 'left',
          fontFamily: 'var(--next-font-display), serif',
          fontSize: '4.2em',
          fontWeight: 800,
          lineHeight: 0.8,
          marginRight: '0.08em',
          marginTop: '0.05em',
          color: 'var(--accent-1)',
          transition: reduced ? 'none' : 'color 300ms ease',
        }}
      >
        {first}
      </span>
      {rest}
    </p>
  )
}
