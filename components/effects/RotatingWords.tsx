'use client'

/**
 * RotatingWords — mot qui change avec animation framer-motion.
 * AnimatePresence gère entrée/sortie fluide.
 * Respect prefers-reduced-motion (changement instantané).
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react'

type RotatingWordsProps = {
  words: string[]
  interval?: number
  className?: string
  style?: React.CSSProperties
}

export function RotatingWords({
  words,
  interval = 2800,
  className,
  style,
}: RotatingWordsProps) {
  const [current, setCurrent] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (words.length <= 1) return
    const tick = setInterval(() => {
      setCurrent((c) => (c + 1) % words.length)
    }, interval)
    return () => clearInterval(tick)
  }, [words.length, interval])

  const word = words[current] ?? ''

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'baseline',
        overflow: 'hidden',
        ...style,
      }}
      aria-live="polite"
      aria-label={word}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          aria-hidden="true"
          style={{ display: 'inline-block' }}
          initial={reduce ? false : { y: '100%', opacity: 0 }}
          animate={reduce ? undefined : { y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: '-100%', opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
