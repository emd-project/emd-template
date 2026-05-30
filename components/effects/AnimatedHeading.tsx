'use client'

/**
 * AnimatedHeading — reveal propre avec framer-motion.
 * Animation d'entrée : fade + translate + slight scale.
 * Respect prefers-reduced-motion automatique via framer-motion.
 */

import { motion, useReducedMotion } from 'framer-motion'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p'

type AnimatedHeadingProps = {
  children: React.ReactNode
  as?: HeadingTag
  delay?: number
  duration?: number
  className?: string
  style?: React.CSSProperties
}

export function AnimatedHeading({
  children,
  as = 'h1',
  delay = 0,
  duration = 900,
  className,
  style,
}: AnimatedHeadingProps) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] as typeof motion.h1

  return (
    <MotionTag
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={reduce ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  )
}
