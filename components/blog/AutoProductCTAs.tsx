'use client'

/**
 * AutoProductCTAs — injecte automatiquement des cartes Amazon entre les sections.
 * Place un CTA après le 2e h2 et un après le 4e h2 dans .prose-article.
 * S'auto-insert via useEffect + portal-like DOM injection.
 * 'use client' isolé.
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ArticleCTA } from '@/lib/article-ctas'
import { AffiliateLink } from '@/components/ui/AffiliateLink'

type Props = {
  ctas: ArticleCTA[]
}

/** Positions des h2 après lesquels injecter (0-indexed) : après le 2e et le 4e */
const INSERT_AFTER_H2 = [1, 3]

function CTACard({ cta }: { cta: ArticleCTA }) {
  return (
    <div style={{ margin: 'var(--space-10) 0' }}>
      <div className="comparateur-card-wrap">
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: 'var(--space-8) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--space-3)',
          }}
        >
          {/* Aurora glow background */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-40%',
              left: '10%',
              width: '80%',
              height: '120%',
              background: 'radial-gradient(ellipse, var(--aurora-1) 0%, transparent 70%)',
              opacity: 0.06,
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '-30%',
              right: '5%',
              width: '60%',
              height: '100%',
              background: 'radial-gradient(ellipse, var(--aurora-3) 0%, transparent 70%)',
              opacity: 0.05,
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* "Deal du moment" pill */}
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              fontFamily: 'var(--next-font-mono), monospace',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
              padding: '3px 12px',
              borderRadius: '2px',
            }}
          >
            Deal du moment
          </span>

          {/* Badge catégorie + nom */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {cta.badge && (
              <span
                style={{
                  fontFamily: 'var(--next-font-mono), monospace',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-3)',
                  display: 'block',
                  marginBottom: 'var(--space-1)',
                }}
              >
                {cta.badge}
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                display: 'block',
              }}
            >
              {cta.name}
            </span>
          </div>

          {/* Price — hero-sized */}
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              fontFamily: 'var(--next-font-mono), monospace',
              fontSize: 'clamp(36px, 8vw, 52px)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {cta.price}
          </span>

          {/* Hook text */}
          <p
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '380px',
            }}
          >
            {cta.hook}
          </p>

          {/* CTA button with gradient */}
          <AffiliateLink
            href={cta.url}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              padding: 'var(--space-3) var(--space-8)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              marginTop: 'var(--space-1)',
            }}
          >
            Voir sur Amazon →
          </AffiliateLink>

          {/* Trust line */}
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '11px',
              color: 'var(--text-muted)',
              opacity: 0.6,
            }}
          >
            Livraison gratuite · Retour 30 jours
          </span>
        </div>
      </div>
    </div>
  )
}

export function AutoProductCTAs({ ctas }: Props) {
  const [targets, setTargets] = useState<HTMLElement[]>([])

  useEffect(() => {
    const prose = document.querySelector('.prose-article')
    if (!prose) return

    const h2s = prose.querySelectorAll(':scope > h2')
    const containers: HTMLElement[] = []

    INSERT_AFTER_H2.forEach((idx) => {
      if (idx >= h2s.length) return
      const h2 = h2s[idx]
      // Find the next h2 or end of prose to insert before
      const nextH2 = h2s[idx + 1]
      const anchor = nextH2 ?? null

      // Check if we already injected
      const existingId = `auto-cta-${idx}`
      if (document.getElementById(existingId)) return

      const wrapper = document.createElement('div')
      wrapper.id = existingId
      if (anchor) {
        prose.insertBefore(wrapper, anchor)
      } else {
        prose.appendChild(wrapper)
      }
      containers.push(wrapper)
    })

    setTargets(containers)
  }, [])

  if (targets.length === 0 || ctas.length === 0) return null

  return (
    <>
      {targets.map((el, i) => {
        const cta = ctas[i % ctas.length]
        return createPortal(<CTACard key={i} cta={cta} />, el)
      })}
    </>
  )
}
