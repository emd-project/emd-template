'use client'

/**
 * ReadingProgress — fine barre de progression de lecture.
 * Se fixe en haut de la page, sous le header (top: 62px = 60px header + 2px aurora line).
 * Couleur accent-1, 2px de hauteur.
 * 'use client' isolé — la page article reste Server Component.
 */

import { useState, useEffect } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const article = document.querySelector('article')
      if (!article) return
      const rect = article.getBoundingClientRect()
      const total = article.scrollHeight - window.innerHeight
      const scrolled = -rect.top
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: '62px',
        left: 0,
        height: '2px',
        width: `${progress}%`,
        background: 'var(--accent-1)',
        zIndex: 39,
        transition: 'width 100ms linear',
        pointerEvents: 'none',
      }}
    />
  )
}
