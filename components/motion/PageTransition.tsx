'use client'

/**
 * PageTransition — transition d'entrée de page.
 * Wrapper à mettre dans le layout (site) ou dans la page.
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type PageTransitionProps = {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
