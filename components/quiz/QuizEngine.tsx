'use client'

/**
 * QuizEngine — moteur interactif du quiz.
 * 'use client' isolé — la page /quiz reste Server Component.
 * Flux : questions dynamiques → résultat avec recommandation.
 * Pas de librairie externe — useState + transitions CSS.
 *
 * Les questions et recommandations sont des placeholders.
 * Le prompt d'init les remplace avec du contenu spécifique à la niche.
 */

import { useState } from 'react'
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

  // Placeholder — le prompt d'init remplace cette logique
  return {
    produit: 'Produit recommandé',
    modele: 'Modèle placeholder',
    pourquoi: 'Ce produit correspond à vos critères. Le prompt d\'initialisation remplacera cette recommandation par du contenu spécifique à votre niche.',
    prix: 'À définir',
    href: `/choisir/${categorie ?? ''}`,
    comparerHref,
  }
}

/* ─── Composant ──────────────────────────────────────── */

type QuizEngineProps = {
  /** Pré-sélectionne la catégorie et saute l'étape 0. */
  defaultProduit?: string
  /** Steps du quiz — passés depuis le Server Component (quiz.yaml). Fallback sur DEFAULT_STEPS. */
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
  const progress = Math.round(((step) / STEPS.length) * 100)

  function handleSelect(value: string) {
    const next = { ...answers, [current.id]: value }
    setAnswers(next)

    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setDone(true)
    }
  }

  function restart() {
    setStep(0)
    setAnswers({})
    setDone(false)
  }

  if (done) {
    const rec = recommend(answers)
    return <Result rec={rec} onRestart={restart} />
  }

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
            height: '3px',
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent-4)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 300ms ease',
            }}
          />
        </div>
        <span
          style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}
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
        style={{
          display: 'grid',
          gridTemplateColumns:
            current.options.length <= 3
              ? '1fr'
              : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {current.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: opt.emoji ? 'var(--space-4)' : 'var(--space-3)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 150ms ease, background 150ms ease',
              width: '100%',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--accent-4)'
              el.style.background = 'rgba(123,97,255,0.06)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border)'
              el.style.background = 'var(--bg-surface)'
            }}
          >
            {opt.emoji && (
              <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>
                {opt.emoji}
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--text-primary)',
              }}
            >
              {opt.label}
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
            marginTop: 'var(--space-6)',
            padding: 0,
            display: 'flex',
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

function Result({
  rec,
  onRestart,
}: {
  rec: Recommendation
  onRestart: () => void
}) {
  return (
    <div>
      {/* Badge résultat */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        Notre recommandation
      </div>

      {/* Modèle recommandé */}
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
          fontSize: '16px',
          color: 'var(--accent-2)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {rec.prix}
      </div>

      {/* Verdict */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderLeft: '3px solid var(--accent-3)',
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
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-8)',
        }}
      >
        <Link
          href={rec.comparerHref}
          style={{
            display: 'inline-block',
            background: 'var(--accent-4)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          Comparer maintenant →
        </Link>
        <Link
          href={rec.href}
          style={{
            display: 'inline-block',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '14px',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          Voir le guide d&apos;achat
        </Link>
      </div>

      {/* Recommencer */}
      <button
        onClick={onRestart}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '13px',
          padding: 0,
        }}
      >
        ↩ Recommencer le quiz
      </button>
    </div>
  )
}
