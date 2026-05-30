'use client'

/**
 * DragScroll — wrapper qui ajoute le drag-to-scroll horizontal sur desktop.
 * Empêche la navigation sur les liens internes pendant un drag.
 * Curseur : grab au repos, grabbing pendant le drag.
 * 'use client' isolé.
 */

import { useRef, useCallback, useEffect, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function DragScroll({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    isDragging.current = true
    hasMoved.current = false
    startX.current = e.pageX
    scrollStart.current = el.scrollLeft
    el.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const el = ref.current
    if (!el) return
    const dx = e.pageX - startX.current
    // Seuil de 5px pour distinguer clic et drag
    if (Math.abs(dx) > 5) {
      hasMoved.current = true
    }
    el.scrollLeft = scrollStart.current - dx
  }, [])

  const onMouseUp = useCallback(() => {
    const el = ref.current
    if (!el) return
    isDragging.current = false
    el.style.cursor = 'grab'
  }, [])

  // Bloquer les clics sur les liens si on vient de drag
  useEffect(() => {
    const el = ref.current
    if (!el) return

    function blockClick(e: MouseEvent) {
      if (hasMoved.current) {
        e.preventDefault()
        e.stopPropagation()
        hasMoved.current = false
      }
    }

    el.addEventListener('click', blockClick, true)
    return () => el.removeEventListener('click', blockClick, true)
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ cursor: 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {children}
    </div>
  )
}
