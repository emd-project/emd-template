/**
 * FeaturedTools — bento grid asymétrique.
 * Grande cellule Comparateur (2/3) + 2 petites (Quiz + Simulateur) en 1/3.
 * Chaque cellule a une icône SVG, un titre et un CTA.
 * Server Component.
 */

import Link from 'next/link'
import Balancer from 'react-wrap-balancer'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'
import { FadeIn } from '@/components/motion/FadeIn'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { accord, leMot } from '@/lib/utils/grammar'

type ToolCardProps = {
  href: string
  eyebrow: string
  title: string
  description: string
  cta: string
  accent: string
  large?: boolean
  icon: React.ReactNode
}

function ToolCard({ href, eyebrow, title, description, cta, accent, large = false, icon }: ToolCardProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: large ? 'var(--space-10)' : 'var(--space-7)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        position: 'relative',
        minHeight: large ? '320px' : '220px',
        transition: 'border-color 200ms ease, transform 200ms ease',
      }}
      className="tool-card"
    >
      {/* Accent glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Icône */}
      <div
        style={{
          width: large ? '48px' : '36px',
          height: large ? '48px' : '36px',
          color: accent,
          marginBottom: 'var(--space-5)',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 'var(--space-2)',
          }}
        >
          {eyebrow}
        </p>
        <h3
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: large ? 'clamp(1.3rem, 2.2vw, 1.8rem)' : '1rem',
            fontWeight: 700,
            letterSpacing: '0',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)',
            lineHeight: 1.25,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-5)',
            maxWidth: large ? '400px' : 'none',
          }}
        >
          {description}
        </p>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: accent,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          {cta} →
        </span>
      </div>
    </Link>
  )
}

/* SVG icons — inline, zero raster */
const IconCompare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="100%" height="100%">
    <rect x="2" y="3" width="8" height="18" rx="2" />
    <rect x="14" y="3" width="8" height="18" rx="2" />
    <path d="M10 8h4M10 12h4M10 16h4" />
  </svg>
)

const IconQuiz = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="100%" height="100%">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </svg>
)

const IconSimulator = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="100%" height="100%">
    <path d="M12 2v20M2 12h20" />
    <circle cx="12" cy="12" r="4" />
    <path d="M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
  </svg>
)

export function FeaturedTools() {
  const g = niche.entityGender

  const comparatorTitle = niche.comparator.enabled
    ? `Comparez les ${niche.entities} côte à côte`
    : `Découvrez nos ${niche.entities}`

  const quizTitle = niche.quiz.question || `Trouvez votre ${niche.entity} ${accord('idéal', g)}`

  const simulatorTitle = niche.simulator.title || `Calculez votre budget`
  const simulatorDesc = niche.simulator.description || `Simulez le coût réel de votre ${niche.entity}.`

  return (
    <section
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--space-20) var(--space-6)',
      }}
    >
      {/* En-tête de section — fade-in au scroll */}
      <FadeIn>
        <div style={{ marginBottom: 'var(--space-10)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-1)', marginBottom: 'var(--space-2)' }}>
              {t('tools.eyebrow')}
            </p>
            <h2
              style={{
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
                fontWeight: 700,
                letterSpacing: '0',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}
            >
              <Balancer>{t('tools.title')}</Balancer>
            </h2>
          </div>
          <Link
            href="/blog"
            style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            {t('tools.viewGuides')}
          </Link>
        </div>
      </FadeIn>

      {/* Grille bento asymétrique — stagger cascade */}
      <Stagger delay={120} staggerDelay={110}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-4)',
          }}
          className="bento-grid"
        >
          {/* Grande cellule Comparateur */}
          <StaggerItem>
            <div className="bento-featured">
              <ToolCard
                href="/comparer"
                eyebrow={t('tools.comparator.eyebrow')}
                title={comparatorTitle}
                description={t('tools.comparator.description')}
                cta={t('tools.comparator.cta')}
                accent="var(--accent-1)"
                large
                icon={<IconCompare />}
              />
            </div>
          </StaggerItem>

          {/* Quiz */}
          {niche.quiz.enabled && (
            <StaggerItem>
              <ToolCard
                href="/quiz"
                eyebrow={t('tools.quiz.eyebrow')}
                title={quizTitle}
                description={`Quelques questions pour identifier ${leMot(niche.entity, g)} ${accord('fait', g)} pour vous.`}
                cta={t('tools.quiz.cta')}
                accent="var(--accent-2)"
                icon={<IconQuiz />}
              />
            </StaggerItem>
          )}

          {/* Simulateur */}
          {niche.simulator.enabled && (
            <StaggerItem>
              <ToolCard
                href="/simulateur"
                eyebrow={t('tools.simulator.eyebrow')}
                title={simulatorTitle}
                description={simulatorDesc}
                cta={t('tools.simulator.cta')}
                accent="var(--accent-3)"
                icon={<IconSimulator />}
              />
            </StaggerItem>
          )}
        </div>
      </Stagger>
    </section>
  )
}
