'use client'

/**
 * FadeIn — fade + translate subtle à l'apparition.
 * Usage : <FadeIn><h1>Titre</h1></FadeIn>
 * Props : delay (ms), duration (ms), y (px), once (boolean)
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type FadeInProps = {
  children: ReactNode
  delay?: number
  duration?: number
  y?: number
  once?: boolean
  className?: string
  as?: 'div' | 'section' | 'article' | 'header' | 'p' | 'h1' | 'h2' | 'h3' | 'span'
  style?: React.CSSProperties
}

export function FadeIn({
  children,
  delay = 0,
  duration = 700,
  y = 16,
  once = true,
  className,
  as = 'div',
  style,
}: FadeInProps) {
  const Component = motion[as] as typeof motion.div
  return (
    <Component
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Component>
  )
}
