'use client'

/**
 * ScrollReveal — reveal au scroll avec parallax optionnel.
 * Usage : <ScrollReveal parallax={40}>...</ScrollReveal>
 */

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  parallax?: number
  className?: string
  style?: React.CSSProperties
}

export function ScrollReveal({
  children,
  parallax = 0,
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [parallax, -parallax])
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0.8]
  )

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        y: parallax > 0 ? y : undefined,
        opacity,
      }}
    >
      {children}
    </motion.div>
  )
}
