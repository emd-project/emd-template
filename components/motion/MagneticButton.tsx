'use client'

/**
 * MagneticButton — bouton avec effet magnétique au curseur.
 * Pour CTAs premium. N'utilise pas la souris sur mobile.
 */

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type MagneticButtonProps = {
  children: ReactNode
  strength?: number
  className?: string
  style?: React.CSSProperties
  href?: string
  onClick?: () => void
}

export function MagneticButton({
  children,
  strength = 0.35,
  className,
  style,
  href,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 200, mass: 0.5 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  const content = (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, x: xSpring, y: ySpring, display: 'inline-block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none' }}>
        {content}
      </a>
    )
  }
  return content
}
