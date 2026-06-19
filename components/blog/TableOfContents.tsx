'use client'

/**
 * TableOfContents — sommaire de l'article dans la sidebar.
 * Liste les vraies sections (H2/H3) + ancres fixes (En bref / FAQ / Liés) et
 * surligne la section active au scroll (IntersectionObserver). Rend la même
 * structure DOM qu'avant (`.toc-title` + `<ul>`) pour conserver le style `.toc`.
 */

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/utils/headings'

export function TableOfContents({ items, title }: { items: TocItem[]; title: string }) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    items.forEach((i) => {
      const el = document.getElementById(i.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <>
      <div className="toc-title">{title}</div>
      <ul>
        {items.map((i) => (
          <li key={i.id} style={i.level === 3 ? { paddingLeft: 14 } : undefined}>
            <a
              href={`#${i.id}`}
              className="sidebar-toc-link"
              aria-current={active === i.id ? 'true' : undefined}
              style={active === i.id ? { color: 'var(--accent-1, var(--primary-d))', fontWeight: 700 } : undefined}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
