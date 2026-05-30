/**
 * HeroSection — above-fold.
 * Supports 3 hero variants: split, centered, minimal.
 * Effects configurable: aurora, subtle, none.
 * Server Component (les enfants clients sont importés inline).
 */

import Balancer from 'react-wrap-balancer'
import { AuroraBackground } from '@/components/effects/AuroraBackground'
import { NoiseOverlay } from '@/components/effects/NoiseOverlay'
import { AnimatedHeading } from '@/components/effects/AnimatedHeading'
import { RotatingWords } from '@/components/effects/RotatingWords'
import { HeroVisual } from './HeroVisual'
import Link from 'next/link'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'
import { MagneticButton } from '@/components/motion/MagneticButton'

/* ── Shared styles ── */

const headingFont = 'var(--next-font-display), system-ui, sans-serif'

const containerStyle = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: 'var(--space-20) var(--space-6)',
  width: '100%',
  position: 'relative' as const,
  zIndex: 3,
}

const primaryCtaStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-6)',
  backgroundColor: 'var(--accent-1)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '15px',
  borderRadius: '8px',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  transition: 'opacity 150ms ease, transform 150ms ease',
} as const

const secondaryCtaStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-6)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontWeight: 500,
  fontSize: '15px',
  borderRadius: '8px',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  transition: 'border-color 150ms ease',
} as const

/* ── Variant: split (default) ── */

function HeroSplit() {
  return (
    <div style={containerStyle}>
      <div className="hero-grid">
        {/* Colonne gauche — texte */}
        <div>
          {/* Eyebrow */}
          <AnimatedHeading
            as="p"
            delay={0}
            duration={600}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-1)',
              marginBottom: 'var(--space-5)',
            }}
          >
            {t('hero.eyebrow')}
          </AnimatedHeading>

          {/* H1 — ligne 1 */}
          <AnimatedHeading
            as="h1"
            delay={120}
            duration={900}
            style={{
              fontFamily: headingFont,
              fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '0',
              color: 'var(--text-primary)',
              marginBottom: '0.15em',
            }}
          >
            <Balancer>{niche.heroPrefix}</Balancer>
          </AnimatedHeading>

          {/* H1 — ligne 2 avec mot rotatif */}
          <AnimatedHeading
            as="h1"
            delay={280}
            duration={900}
            style={{
              fontFamily: headingFont,
              fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '0',
              marginBottom: 'var(--space-8)',
              display: 'flex',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: '0.25em',
            }}
          >
            <RotatingWords
              words={niche.rotatingWords}
              interval={2600}
              style={{ color: 'var(--accent-1)' }}
            />
            <Balancer><span className="text-gradient-hero">{niche.heroSuffix}</span></Balancer>
          </AnimatedHeading>

          {/* Sous-titre */}
          <AnimatedHeading
            as="p"
            delay={440}
            duration={700}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: '520px',
              lineHeight: 1.65,
              marginBottom: 'var(--space-10)',
            }}
          >
            {niche.subtitle}
          </AnimatedHeading>

          {/* CTAs */}
          <AnimatedHeading
            as="p"
            delay={580}
            duration={600}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              alignItems: 'center',
            }}
          >
            <Link href={niche.ctaPrimary.url} style={{ textDecoration: 'none' }}>
              <MagneticButton strength={0.25}>
                <span style={primaryCtaStyle} className="btn-primary">
                  {niche.ctaPrimary.text}
                </span>
              </MagneticButton>
            </Link>
            <Link href={niche.ctaSecondary.url} style={secondaryCtaStyle}>
              {niche.ctaSecondary.text}
            </Link>
          </AnimatedHeading>
        </div>

        {/* Colonne droite — navigation familles */}
        <HeroVisual />
      </div>
    </div>
  )
}

/* ── Variant: centered ── */

function HeroCentered() {
  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Eyebrow */}
        <AnimatedHeading
          as="p"
          delay={0}
          duration={600}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent-1)',
            marginBottom: 'var(--space-5)',
          }}
        >
          {t('hero.eyebrow')}
        </AnimatedHeading>

        {/* H1 — ligne 1 */}
        <AnimatedHeading
          as="h1"
          delay={120}
          duration={900}
          style={{
            fontFamily: headingFont,
            fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '0',
            color: 'var(--text-primary)',
            marginBottom: '0.15em',
          }}
        >
          <Balancer>{niche.heroPrefix}</Balancer>
        </AnimatedHeading>

        {/* H1 — ligne 2 avec mot rotatif */}
        <AnimatedHeading
          as="h1"
          delay={280}
          duration={900}
          style={{
            fontFamily: headingFont,
            fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '0',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.25em',
          }}
        >
          <RotatingWords
            words={niche.rotatingWords}
            interval={2600}
            style={{ color: 'var(--accent-1)' }}
          />
          <Balancer><span className="text-gradient-hero">{niche.heroSuffix}</span></Balancer>
        </AnimatedHeading>

        {/* Sous-titre */}
        <AnimatedHeading
          as="p"
          delay={440}
          duration={700}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            lineHeight: 1.65,
            marginBottom: 'var(--space-10)',
          }}
        >
          {niche.subtitle}
        </AnimatedHeading>

        {/* CTAs */}
        <AnimatedHeading
          as="p"
          delay={580}
          duration={600}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Link href={niche.ctaPrimary.url} style={{ textDecoration: 'none' }}>
            <MagneticButton strength={0.25}>
              <span style={primaryCtaStyle} className="btn-primary">
                {niche.ctaPrimary.text}
              </span>
            </MagneticButton>
          </Link>
          <Link href={niche.ctaSecondary.url} style={secondaryCtaStyle}>
            {niche.ctaSecondary.text}
          </Link>
        </AnimatedHeading>
      </div>
    </div>
  )
}

/* ── Variant: minimal ── */

function HeroMinimal() {
  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* H1 — single line, larger font */}
        <AnimatedHeading
          as="h1"
          delay={120}
          duration={900}
          style={{
            fontFamily: headingFont,
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <Balancer>{niche.heroPrefix} <span className="text-gradient-hero">{niche.heroSuffix}</span></Balancer>
        </AnimatedHeading>

        {/* Sous-titre */}
        <AnimatedHeading
          as="p"
          delay={300}
          duration={700}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            lineHeight: 1.65,
            marginBottom: 'var(--space-10)',
          }}
        >
          {niche.subtitle}
        </AnimatedHeading>

        {/* Single CTA */}
        <AnimatedHeading
          as="p"
          delay={460}
          duration={600}
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Link href={niche.ctaPrimary.url} style={{ textDecoration: 'none' }}>
            <MagneticButton strength={0.25}>
              <span style={primaryCtaStyle} className="btn-primary">
                {niche.ctaPrimary.text}
              </span>
            </MagneticButton>
          </Link>
        </AnimatedHeading>
      </div>
    </div>
  )
}

/* ── Effects wrapper ── */

function HeroEffects({ children }: { children: React.ReactNode }) {
  const heroVariant = niche.style.hero ?? 'split'
  const effects = niche.style.effects ?? 'aurora'

  // Minimal hero forces no aurora/noise
  if (heroVariant === 'minimal' || effects === 'none') {
    return (
      <div className="hero-aurora" style={{ position: 'relative', backgroundColor: 'var(--bg-primary)' }}>
        {children}
      </div>
    )
  }

  if (effects === 'subtle') {
    return (
      <div className="hero-aurora" style={{ position: 'relative', backgroundColor: 'var(--bg-primary)' }}>
        <NoiseOverlay opacity={0.035} />
        {children}
      </div>
    )
  }

  // effects === 'aurora' (default)
  return (
    <AuroraBackground className="hero-aurora">
      <NoiseOverlay opacity={0.035} />
      {children}
    </AuroraBackground>
  )
}

/* ── Main export ── */

export function HeroSection() {
  const heroVariant = niche.style.hero ?? 'split'

  let content: React.ReactNode
  switch (heroVariant) {
    case 'centered':
      content = <HeroCentered />
      break
    case 'minimal':
      content = <HeroMinimal />
      break
    case 'split':
    default:
      content = <HeroSplit />
      break
  }

  return <HeroEffects>{content}</HeroEffects>
}
