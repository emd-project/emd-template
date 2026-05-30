/**
 * AuthorTeaser — encart éditorial asymétrique.
 * Monogramme géant + bio + lien auteur.
 * Server Component.
 */

import Link from 'next/link'
import Balancer from 'react-wrap-balancer'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'
import { FadeIn } from '@/components/motion/FadeIn'

export function AuthorTeaser() {
  if (!niche.author.name) return null

  const initial = niche.author.name.charAt(0).toUpperCase()

  return (
    <section
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--space-20) var(--space-6)',
      }}
    >
      <FadeIn>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 'var(--space-12)',
          alignItems: 'center',
        }}
        className="author-teaser-grid"
      >
        {/* Monogramme */}
        <div
          aria-hidden="true"
          style={{
            width: 'clamp(120px, 18vw, 200px)',
            height: 'clamp(120px, 18vw, 200px)',
            borderRadius: '50%',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
            background: 'var(--bg-surface)',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: '45%',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '0',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {initial}
          </span>
          <div
            style={{
              position: 'absolute',
              inset: '-1px',
              borderRadius: '50%',
              background: `conic-gradient(var(--accent-1) 0deg, transparent 60deg, transparent 360deg)`,
              opacity: 0.6,
              mixBlendMode: 'screen',
              zIndex: -1,
            }}
          />
        </div>

        {/* Texte */}
        <div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--accent-1)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {t('authorTeaser.eyebrow')}
          </p>
          <h2
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: 'clamp(1.2rem, 2.2vw, 1.7rem)',
              fontWeight: 700,
              letterSpacing: '0',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              lineHeight: 1.15,
            }}
          >
            <Balancer>{niche.author.name} — {niche.author.title}</Balancer>
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '520px',
              marginBottom: 'var(--space-6)',
            }}
          >
            {niche.author.bio}
          </p>
          {niche.author.slug && (
            <Link
              href={`/auteurs/${niche.author.slug}`}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--accent-1)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
              }}
            >
              {t('authorTeaser.learnMore')}
            </Link>
          )}
        </div>
      </div>
      </FadeIn>
    </section>
  )
}
