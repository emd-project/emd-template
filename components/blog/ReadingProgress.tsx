'use client'

/**
 * ReadingProgress — fine barre de progression de lecture.
 *
 * Pinnée au TOUT en haut du viewport (`top: 0`) et AU-DESSUS de la nav (z-index élevé).
 * Auparavant elle était posée à `top: 62px` (nombre magique supposant un header de 60px)
 * avec un z-index SOUS la nav : sous une nav translucide, la barre remplie à ~73% donnait
 * l'illusion d'un trait teal « flottant » en travers du milieu de la page. En la collant
 * à `top: 0` au-dessus de tout, c'est le motif universel de barre de progression (style
 * YouTube) — impossible de la confondre avec une bordure parasite, quelle que soit la
 * hauteur ou la translucidité du header de la niche.
 *
 * 'use client' isolé — la page article reste Server Component.
 */

import { useState, useEffect } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const article = document.querySelector('article')
      if (!article) return
      const total = article.scrollHeight - window.innerHeight
      if (total <= 0) {
        setProgress(0)
        return
      }
      const scrolled = -article.getBoundingClientRect().top
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Conteneur pleine largeur pinné au top:0, au-dessus de la nav. La piste reste
  // transparente (aucun trait permanent) ; seule la portion remplie est visible.
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        background: 'transparent',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--accent-1)',
          transition: 'width 100ms linear',
        }}
      />
    </div>
  )
}
