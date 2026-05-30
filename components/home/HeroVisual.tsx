/**
 * HeroVisual — colonne droite du héro.
 * Image placeholder + navigation typographique catégories.
 * Server Component.
 */
import Link from 'next/link'
import { niche, categoryAccent } from '@/niche.config'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

export function HeroVisual() {
  const families = niche.categories.map((cat, i) => ({
    label: cat.label,
    sub: cat.description ?? `Comparatif · Guide · ${niche.dealWord}`,
    href: `/comparer/${cat.slug}`,
    accent: categoryAccent(i),
    index: String(i + 1).padStart(2, '0'),
  }))

  if (families.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <ImagePlaceholder
        slotId="home-hero-visual"
        priority
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
      />
      <nav
        aria-label={`Catégories de ${niche.entities}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
      {families.map(({ label, sub, href, accent, index }) => (
        <Link
          key={index}
          href={href}
          style={{ textDecoration: 'none', display: 'block' }}
          className="hero-family-item"
        >
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding: 'var(--space-4) 0',
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto',
              gap: 'var(--space-4)',
              alignItems: 'center',
              transition: 'padding-left 180ms ease',
            }}
          >
            {/* Index */}
            <span
              style={{
                fontFamily: 'var(--next-font-mono, monospace)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              {index}
            </span>

            {/* Label + sub */}
            <div>
              <p
                className="hero-family-label"
                style={{
                  fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                  fontSize: 'clamp(18px, 2.2vw, 26px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: '0 0 2px',
                  lineHeight: 1.1,
                  transition: 'color 150ms ease',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {sub}
              </p>
            </div>

            {/* Arrow */}
            <span
              className="hero-family-arrow"
              style={{
                fontSize: '16px',
                color: accent,
                opacity: 0,
                transition: 'opacity 150ms ease, transform 150ms ease',
                transform: 'translateX(-6px)',
              }}
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </Link>
      ))}

        {/* Dernière ligne séparatrice */}
        <div style={{ borderTop: '1px solid var(--border)' }} />
      </nav>
    </div>
  )
}
