'use client'

/**
 * CountUp — compteur animé déclenché au scroll (Intersection Observer).
 * requestAnimationFrame + ease-out cubic pour un rendu fluide.
 * Se déclenche une seule fois. prefers-reduced-motion : valeur finale directe.
 */

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  from?: number
  to: number
  duration?: number    // ms
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  style?: React.CSSProperties
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function CountUp({
  from = 0,
  to,
  duration = 1600,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  style,
}: CountUpProps) {
  // Initialisation lazy : si prefers-reduced-motion, on affiche directement la valeur finale
  const [value, setValue] = useState(() => {
    if (typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return to
    }
    return from
  })
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const rafId = useRef<number>(0)

  useEffect(() => {
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true

        const startTime = performance.now()

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = easeOutCubic(progress)
          setValue(parseFloat((from + (to - from) * eased).toFixed(decimals)))
          if (progress < 1) rafId.current = requestAnimationFrame(tick)
        }

        rafId.current = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId.current)
    }
  }, [from, to, duration, decimals])

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
    >
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}
