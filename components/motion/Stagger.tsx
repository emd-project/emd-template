'use client'

/**
 * Stagger — anime les enfants en cascade.
 * Usage : <Stagger><div/><div/><div/></Stagger>
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type StaggerProps = {
  children: ReactNode
  delay?: number
  staggerDelay?: number
  y?: number
  once?: boolean
  className?: string
  style?: React.CSSProperties
}

export function Stagger({
  children,
  delay = 0,
  staggerDelay = 80,
  y = 24,
  once = true,
  className,
  style,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay / 1000,
            delayChildren: delay / 1000,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function StaggerItem({ children, className, style }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerItem}
    >
      {children}
    </motion.div>
  )
}
