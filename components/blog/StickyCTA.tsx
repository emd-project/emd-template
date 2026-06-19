'use client'

/**
 * StickyCTA — barre CTA flottante en bas de l'écran.
 * Effet liquid glass iOS : backdrop-blur + reflet spéculaire.
 * 'use client' isolé — la page article reste Server Component.
 */

import { useState, useEffect } from 'react'
import { addAffiliateTag } from '@/lib/utils/affiliate'
import { tl } from '@/lib/i18n'

export type StickyCTAItem = {
  label: string
  url: string
}

type Props = {
  items: StickyCTAItem[]
  message?: string
  /** Locale active (défaut fr). */
  locale?: string
}

export function StickyCTA({ items, message, locale = 'fr' }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (items.length === 0) return null

  return (
    <div
      role="complementary"
      aria-label={tl(locale, 'product.stickyAriaLabel')}
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(calc(100% + 32px))',
        transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 35,
        width: '92%',
        maxWidth: '680px',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          background: 'var(--sticky-cta-glass)',
          padding: 'var(--space-3) var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: '16px',
        }}
      >
        {/* Specular highlight — light hitting glass from top */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(175deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 35%, transparent 55%)',
            pointerEvents: 'none',
            borderRadius: '16px',
          }}
        />

        {message && (
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              fontSize: '12px',
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              textAlign: 'center',
            }}
          >
            {message}
          </span>
        )}

        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', gap: 'var(--space-2)',
          width: '100%', flexWrap: 'wrap',
        }}>
          {items.map((item, i) => {
            const isAmazon = item.url.includes('amazon.fr') || item.url.includes('amzn.to')
            const href = isAmazon ? addAffiliateTag(item.url) : item.url
            return (
              <a
                key={i}
                href={href}
                rel={isAmazon ? 'nofollow sponsored noopener' : 'noopener'}
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  flex: '1 1 auto',
                  minWidth: 0,
                  background: i === 0
                    ? 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))'
                    : 'rgba(255,255,255,0.08)',
                  color: i === 0 ? '#fff' : 'var(--text-primary)',
                  border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
