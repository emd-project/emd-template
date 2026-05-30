/**
 * /quiz — Quiz personnalisé.
 * DA : effect-quiz → radial gradient --accent-4 + glassmorphism card.
 * Server Component — QuizEngine 'use client' isolé pour l'interactivité.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { currentYear } from '@/lib/utils/year'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import { niche } from '@/niche.config'
import { getPageContent } from '@/lib/cms-pages'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  const question = niche.quiz.question || `Quel ${niche.entity} choisir ${year} ?`
  return {
    title: `${question} Quiz | ${niche.siteName}`,
    description:
      `4 questions pour trouver le ${niche.entity} fait pour toi. Résultat immédiat.`,
    alternates: { canonical: `${SITE_URL}/quiz` },
    openGraph: {
      title: question,
      description: `Quiz 4 questions — trouve ton ${niche.entity}. Résultat immédiat.`,
      url: `${SITE_URL}/quiz`,
      siteName: niche.siteName,
      type: 'website',
    },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Quiz', item: `${SITE_URL}/quiz` },
  ],
}

export default function QuizPage() {
  const quizContent = getPageContent('quiz')
  const steps = quizContent?.steps as { id: string; question: string; options: { label: string; value: string; emoji?: string }[] }[] | undefined
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content">
        {/* Hero avec radial gradient accent-4 */}
        <section
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(123,97,255,0.20) 0%, var(--bg-primary) 70%)',
            padding: 'var(--space-16) var(--space-6) var(--space-10)',
          }}
        >
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
            <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-8)' }}>
              <ol
                style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  listStyle: 'none',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  justifyContent: 'center',
                }}
              >
                <li>
                  <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li aria-current="page" style={{ color: 'var(--text-secondary)' }}>
                  Quiz
                </li>
              </ol>
            </nav>

            <div
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent-4)',
                background: 'rgba(123,97,255,0.12)',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                marginBottom: 'var(--space-5)',
              }}
            >
              4 questions · 2 minutes
            </div>

            <h1
              style={{
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontSize: 'clamp(30px, 5vw, 52px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                marginBottom: 'var(--space-4)',
                textWrap: 'balance',
              }}
            >
              <Balancer>{niche.quiz.question || `Quel ${niche.entity} est fait pour toi ?`}</Balancer>
            </h1>
            <p
              style={{
                fontSize: 'clamp(15px, 2vw, 17px)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              Clique sur une réponse et obtiens une recommandation directe.
            </p>
          </div>
        </section>

        {/* Quiz interactif */}
        <section
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            padding: 'var(--space-10) var(--space-6) var(--space-24)',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
            }}
          >
            <QuizEngine steps={steps} />
          </div>
        </section>
      </main>
    </>
  )
}
