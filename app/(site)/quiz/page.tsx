/**
 * /quiz — Quiz personnalisé (style Voltéo).
 * Server Component — QuizEngine 'use client' isolé pour l'interactivité.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import { niche } from '@/niche.config'
import { getPageContent } from '@/lib/cms-pages'
import { quel, leMot, accord, ton } from '@/lib/utils/grammar'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

const g = niche.entityGender

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  const question = niche.quiz.question || `${quel(g)} ${niche.entity} choisir ${year} ?`
  return {
    title: `${question} Quiz | ${niche.siteName}`,
    description: `4 questions pour trouver ${leMot(niche.entity, g)} ${accord('fait', g)} pour toi. Résultat immédiat.`,
    alternates: { canonical: `${SITE_URL}/quiz` },
    openGraph: { title: question, description: `Quiz 4 questions — trouve ${ton(g, false, niche.entity)} ${niche.entity}.`, url: `${SITE_URL}/quiz`, siteName: niche.siteName, type: 'website' },
  }
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 0%, color-mix(in srgb, var(--mobi) 18%, transparent) 0%, var(--cream) 70%)', padding: '64px 0 40px' }}>
          <div className="wrap" style={{ maxWidth: 680, textAlign: 'center' }}>
            <nav className="crumb" aria-label="Fil d'Ariane" style={{ justifyContent: 'center' }}>
              <Link href="/">Accueil</Link><span className="sep">/</span><span className="cur">Quiz</span>
            </nav>
            <span className="tag mobi" style={{ marginBottom: 20 }}><span className="pip" />4 questions · 2 minutes</span>
            <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, margin: '14px 0', textWrap: 'balance' }}>
              {niche.quiz.question || `${quel(g)} ${niche.entity} est ${accord('fait', g)} pour toi ?`}
            </h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Clique sur une réponse et obtiens une recommandation directe.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 40 }}>
          <div className="wrap" style={{ maxWidth: 680 }}>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: 32, boxShadow: 'var(--shadow)' }}>
              <QuizEngine steps={steps} />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
