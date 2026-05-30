'use client'

/**
 * TextScramble — les lettres se "décodent" au hover.
 * Algorithme : remplacement progressif par chars aléatoires → texte réel.
 * < 600 octets de logique. onMouseLeave = reset immédiat.
 * 'use client' pour les event handlers hover.
 */

import { useRef, useCallback, useEffect } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

type TextScrambleProps = {
  text: string
  className?: string
  style?: React.CSSProperties
  speed?: number  // ms entre itérations (défaut 28ms)
}

export function TextScramble({
  text,
  className,
  style,
  speed = 28,
}: TextScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const scramble = useCallback(() => {
    if (!ref.current || prefersReduced.current) return
    clearInterval(intervalRef.current)

    let iteration = 0
    const target = text

    intervalRef.current = setInterval(() => {
      if (!ref.current) return

      ref.current.textContent = target
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (i < Math.floor(iteration)) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')

      iteration += 0.35

      if (iteration >= target.length) {
        clearInterval(intervalRef.current)
        ref.current.textContent = target
      }
    }, speed)
  }, [text, speed])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    if (ref.current) ref.current.textContent = text
  }, [text])

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        cursor: 'default',
        ...style,
      }}
      onMouseEnter={scramble}
      onMouseLeave={reset}
    >
      {text}
    </span>
  )
}
