'use client'

/**
 * QuizEngine — moteur interactif du quiz, piloté par la DA.
 * 'use client' isolé — la page /quiz reste Server Component.
 * Flux : questions dynamiques → résultat avec recommandation.
 * Pas de librairie externe — useState + transitions CSS.
 *
 * 100% token-driven (var(--accent-1), --border, --bg-surface, color-mix) →
 * adopte la DA de chaque site. Les questions/recommandations sont des
 * placeholders remplacés à l'init.
 */

import { useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'

/* ─── Types ─────────────────────────────────────────── */

type Step = {
  id: string
  question: string
  options: { label: string; value: string; emoji?: string }[]
}

type Answers = Record<string, string>

type Recommendation = {
  produit: string
  modele: string
  pourquoi: string
  prix: string
  href: string
  comparerHref: string
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const TINT = 'color-mix(in srgb, var(--accent-1) 7%, transparent)'

/* ─── Questions (placeholder — à adapter par niche) ──── */

const DEFAULT_STEPS: Step[] = [
  {
    id: 'categorie',
    question: 'Quelle catégorie vous intéresse ?',
    options: [
      { label: 'Catégorie A', value: 'cat-a' },
      { label: 'Catégorie B', value: 'cat-b' },
      { label: 'Catégorie C', value: 'cat-c' },
    ],
  },
  {
    id: 'budget',
    question: 'Quel est votre budget ?',
    options: [
      { label: 'Petit budget', value: 'eco' },
      { label: 'Budget moyen', value: 'mid' },
      { label: 'Budget élevé', value: 'high' },
    ],
  },
  {
    id: 'usage',
    question: 'Votre usage principal ?',
    options: [
      { label: 'Usage quotidien', value: 'daily' },
      { label: 'Usage professionnel', value: 'pro' },
      { label: 'Loisirs', value: 'leisure' },
    ],
  },
]

/* ─── Moteur de recommandation (placeholder) ───────── */

function recommend(answers: Answers): Recommendation {
  const { categorie } = answers
  const comparerHref = `/comparer/${categorie ?? ''}`
  return {
    produit: 'Produit recommandé',
    modele: 'Modèle placeholder',
    pourquoi:
      "Ce produit correspond à vos critères. Le prompt d'initialisation remplacera cette recommandation par du contenu spécifique à votre niche.",
    prix: 'À définir',
    href: `/choisir/${categorie ?? ''}`,
    comparerHref,
  }
}

/* ─── Composant ──────────────────────────────────────── */

type QuizEngineProps = {
  defaultProduit?: string
  steps?: Step[]
}

export function QuizEngine({ defaultProduit, steps }: QuizEngineProps = {}) {
  const STEPS = steps && steps.length > 0 ? steps : DEFAULT_STEPS
  const initialStep = defaultProduit ? 1 : 0
  const initialAnswers: Answers = defaultProduit ? { categorie: defaultProduit } : {}

  const [step, setStep] = useState(initialStep)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [done, setDone] = useState(false)

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

  if (done) return <Result rec={recommend(answers)} onRestart={restart} />

  return (
    <div>
      {/* Barre de progression */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            flex: 1,
            height: '6px',
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent-1)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 300ms var(--ease-out, ease)',
            }}
          />
        </div>
        <span
          style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
          aria-label={`Question ${step + 1} sur ${STEPS.length}`}
        >
          {step + 1} / {STEPS.length}
        </span>
      </div>

      {/* Question */}
      <h2
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          textWrap: 'balance',
          lineHeight: 1.2,
        }}
      >
        {current.question}
      </h2>

      {/* Options */}
      <div
        role="group"
        aria-label={current.question}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        {current.options.map((opt, idx) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 150ms ease, background 150ms ease, transform 150ms ease',
              width: '100%',
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
            {/* Pastille : emoji si fourni, sinon lettre */}
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-full)',
                display: 'grid',
                placeItems: 'center',
                fontSize: opt.emoji ? '20px' : '14px',
                fontWeight: 800,
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                color: 'var(--accent-1)',
                background: 'color-mix(in srgb, var(--accent-1) 12%, transparent)',
              }}
            >
              {opt.emoji ?? LETTERS[idx] ?? '•'}
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--text-primary)',
              }}
            >
              {opt.label}
            </span>
            <span aria-hidden="true" style={{ color: 'var(--text-muted)', fontSize: '15px', flexShrink: 0 }}>
              →
            </span>
          </button>
        ))}
      </div>

      {/* Retour */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            marginTop: 'var(--space-6)',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          ← Retour
        </button>
      )}
    </div>
  )
}

/* ─── Résultat ───────────────────────────────────────── */

function Result({ rec, onRestart }: { rec: Recommendation; onRestart: () => void }) {
  const primaryCta: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    background: 'var(--accent-1)',
    color: 'var(--bg-primary)',
    fontWeight: 700,
    fontSize: '14px',
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
  }
  const ghostCta: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '14px',
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
  }

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 'var(--space-5)' }}>
        Notre recommandation
      </div>

      <h2
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
          lineHeight: 1.1,
        }}
      >
        {rec.modele}
      </h2>
      <div
        style={{
          fontFamily: 'var(--next-font-mono), monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--accent-1)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {rec.prix}
      </div>

      {/* Verdict */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent-1)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          padding: 'var(--space-5) var(--space-6)',
          marginBottom: 'var(--space-8)',
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
        }}
      >
        {rec.pourquoi}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
        <Link href={rec.comparerHref} style={primaryCta}>
          Comparer maintenant →
        </Link>
        <Link href={rec.href} style={ghostCta}>
          Voir le guide d&apos;achat
        </Link>
      </div>

      <button
        onClick={onRestart}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontWeight: 600,
          padding: 0,
        }}
      >
        ↩ Recommencer le quiz
      </button>
    </div>
  )
}
