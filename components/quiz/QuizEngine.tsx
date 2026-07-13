'use client'

/**
 * QuizEngine — moteur interactif du quiz, piloté par la DA + locale-aware.
 * 'use client' isolé — la page /quiz reste Server Component.
 * 100% token-driven (var(--accent-1)…). Prop `locale` (défaut fr).
 *
 * CONTRAT ANTI-PLACEHOLDER (cf. scripts/check-placeholders.mjs) :
 * ce composant n'a AUCUNE question par défaut. Sans `steps`, il ne fabrique pas
 * un faux quiz « Catégorie A / B / C » : il ÉCHOUE BRUYAMMENT en dev (throw) et
 * ne rend RIEN en prod (`return null`). Une section absente vaut mieux qu'une
 * section qui ment. Les questions viennent du CMS (page `quiz`) ou de la prop.
 * La recommandation finale vient de la prop `recommend` ; sans elle, on affiche
 * uniquement des faits réels (le choix du visiteur + liens vers comparer/choisir),
 * jamais un modèle ni un prix inventés.
 */

import { useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { tl } from '@/lib/i18n'

export type Step = {
  id: string
  question: string
  options: { label: string; value: string; emoji?: string }[]
}
export type Answers = Record<string, string>
export type Recommendation = {
  /** Intitulé de la recommandation (ex. la famille choisie). Jamais un modèle inventé. */
  produit: string
  /** Modèle réel recommandé. Optionnel — omis si la niche ne le fournit pas. */
  modele?: string
  /** Prix réel. Optionnel — jamais un prix fictif. */
  prix?: string
  pourquoi?: string
  href: string
  comparerHref: string
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const TINT = 'color-mix(in srgb, var(--accent-1) 7%, transparent)'

/**
 * Recommandation par défaut : purement factuelle. Reprend le choix du visiteur et
 * l'oriente vers le comparateur / le guide. Aucune donnée inventée.
 */
function defaultRecommend(answers: Answers, steps: Step[]): Recommendation {
  const first = steps[0]
  const firstAnswer = first ? answers[first.id] : undefined
  const chosen = first?.options.find((o) => o.value === firstAnswer)
  const slug = firstAnswer ?? ''
  return {
    produit: chosen?.label ?? '',
    href: slug ? `/choisir/${slug}` : '/choisir',
    comparerHref: slug ? `/comparer/${slug}` : '/comparer',
  }
}

type QuizEngineProps = {
  /** Questions du quiz. OBLIGATOIRE de fait : sans elles, le composant ne rend rien. */
  steps?: Step[]
  /** Recommandation finale, calculée par la niche à partir des réponses. */
  recommend?: (answers: Answers, steps: Step[]) => Recommendation
  defaultProduit?: string
  /** Locale active (défaut fr). */
  locale?: string
}

export function QuizEngine({ steps, recommend, defaultProduit, locale = 'fr' }: QuizEngineProps = {}) {
  const STEPS = steps ?? []
  const configured = STEPS.length > 0

  // `defaultProduit` pré-répond à la 1re question (page /choisir/[produit]).
  const seeded = Boolean(defaultProduit && STEPS[0])
  const initialStep = seeded ? Math.min(1, STEPS.length - 1) : 0
  const initialAnswers: Answers = seeded ? { [STEPS[0].id]: defaultProduit as string } : {}

  const [step, setStep] = useState(initialStep)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [done, setDone] = useState(seeded && STEPS.length === 1)

  // ── Garde anti-placeholder ────────────────────────────
  // Dev : on casse, fort et tôt. Prod : on n'affiche rien plutôt que du faux.
  if (!configured) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'QuizEngine: aucun `steps` fourni — configurez le quiz de la niche ' +
        '(content/pages/quiz.yaml ou CMS /admin → page « quiz ») ou désactivez le quiz ' +
        '(niche.config.ts → quiz.enabled: false). Le composant ne fabrique plus de ' +
        'questions placeholder.'
      )
    }
    return null
  }

  const current = STEPS[step]
  const progress = Math.round((step / STEPS.length) * 100)

  function handleSelect(value: string) {
    const next = { ...answers, [current.id]: value }
    setAnswers(next)
    if (step < STEPS.length - 1) setStep(step + 1)
    else setDone(true)
  }
  function restart() {
    setStep(0)
    setAnswers({})
    setDone(false)
  }

  if (done) {
    const rec = (recommend ?? defaultRecommend)(answers, STEPS)
    return <Result rec={rec} onRestart={restart} locale={locale} />
  }

  return (
    <div>
      {/* Barre de progression */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div
          aria-hidden="true"
          style={{ flex: 1, height: '6px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}
        >
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-1)', borderRadius: 'var(--radius-full)', transition: 'width 300ms var(--ease-out, ease)' }} />
        </div>
        <span
          style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
          aria-label={tl(locale, 'quiz.progressAria', { step: step + 1, total: STEPS.length })}
        >
          {step + 1} / {STEPS.length}
        </span>
      </div>

      {/* Question */}
      <h2 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-6)', textWrap: 'balance', lineHeight: 1.2 }}>
        {current.question}
      </h2>

      {/* Options */}
      <div role="group" aria-label={current.question} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {current.options.map((opt, idx) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
              background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)', cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 150ms ease, background 150ms ease, transform 150ms ease', width: '100%',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--accent-1)'
              el.style.background = TINT
              el.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border)'
              el.style.background = 'var(--bg-surface)'
              el.style.transform = 'translateX(0)'
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0, width: '34px', height: '34px', borderRadius: 'var(--radius-full)',
                display: 'grid', placeItems: 'center', fontSize: opt.emoji ? '20px' : '14px', fontWeight: 800,
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                color: 'var(--accent-1)', background: 'color-mix(in srgb, var(--accent-1) 12%, transparent)',
              }}
            >
              {opt.emoji ?? LETTERS[idx] ?? '•'}
            </span>
            <span style={{ flex: 1, fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
              {opt.label}
            </span>
            <span aria-hidden="true" style={{ color: 'var(--text-muted)', fontSize: '15px', flexShrink: 0 }}>→</span>
          </button>
        ))}
      </div>

      {/* Retour */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginTop: 'var(--space-6)', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          {tl(locale, 'quiz.back')}
        </button>
      )}
    </div>
  )
}

function Result({ rec, onRestart, locale }: { rec: Recommendation; onRestart: () => void; locale: string }) {
  const primaryCta: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
    background: 'var(--accent-1)', color: 'var(--bg-primary)', fontWeight: 700, fontSize: '14px',
    padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', textDecoration: 'none',
  }
  const ghostCta: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
    background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
    fontWeight: 600, fontSize: '14px', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', textDecoration: 'none',
  }

  const heading = rec.modele || rec.produit

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 'var(--space-5)' }}>
        {tl(locale, 'quiz.recommendation')}
      </div>

      {heading && (
        <h2 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)', lineHeight: 1.1 }}>
          {heading}
        </h2>
      )}
      {rec.prix && (
        <div style={{ fontFamily: 'var(--next-font-mono), monospace', fontVariantNumeric: 'tabular-nums', fontSize: '18px', fontWeight: 700, color: 'var(--accent-1)', marginBottom: 'var(--space-5)' }}>
          {rec.prix}
        </div>
      )}

      {rec.pourquoi && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent-1)', borderRadius: '0 var(--radius-md) var(--radius-md) 0', padding: 'var(--space-5) var(--space-6)', marginBottom: 'var(--space-8)', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {rec.pourquoi}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
        <Link href={rec.comparerHref} style={primaryCta}>{tl(locale, 'quiz.compareNow')}</Link>
        <Link href={rec.href} style={ghostCta}>{tl(locale, 'quiz.seeGuide')}</Link>
      </div>

      <button
        onClick={onRestart}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, padding: 0 }}
      >
        {tl(locale, 'quiz.restart')}
      </button>
    </div>
  )
}
