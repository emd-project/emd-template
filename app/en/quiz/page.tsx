/**
 * /en/quiz — personalised quiz (EN mirror of /quiz).
 * Server Component — QuizEngine ('use client') with locale="en".
 * EN steps via quiz.en.yaml (getPageContent('quiz.en')).
 *
 * ANTI-PLACEHOLDER : no steps → 404. The engine has no default questions anymore
 * (no more « Category A / B / C »). Cf. scripts/check-placeholders.mjs.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { QuizEngine, type Step } from '@/components/quiz/QuizEngine'
import { niche } from '@/niche.config'
import { getPageContent } from '@/lib/cms-pages'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

function getSteps(): Step[] {
  const quizContent = getPageContent('quiz.en')
  const steps = quizContent?.steps as Step[] | undefined
  return Array.isArray(steps) ? steps : []
}

export function generateMetadata(): Metadata {
  const year = currentYear()
  const question = `Which ${niche.entity} should you choose in ${year}?`
  return {
    title: `${question} Quiz | ${niche.siteName}`,
    description: `4 questions to find the ${niche.entity} that fits you. Instant result.`,
    alternates: {
      canonical: `${SITE_URL}/en/quiz`,
      languages: {
        fr: `${SITE_URL}/quiz`,
        en: `${SITE_URL}/en/quiz`,
        'x-default': `${SITE_URL}/quiz`,
      },
    },
    openGraph: { title: question, description: `4-question quiz — find your ${niche.entity}.`, url: `${SITE_URL}/en/quiz`, siteName: niche.siteName, type: 'website', locale: 'en' },
  }
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
    { '@type': 'ListItem', position: 2, name: 'Quiz', item: `${SITE_URL}/en/quiz` },
  ],
}

export default function QuizPageEn() {
  const steps = getSteps()
  // No questions → no page. An absent section beats a fake one.
  if (steps.length === 0) notFound()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 0%, color-mix(in srgb, var(--accent-1) 14%, transparent) 0%, var(--cream) 70%)', padding: '64px 0 40px' }}>
          <div className="wrap" style={{ maxWidth: 680, textAlign: 'center' }}>
            <nav className="crumb" aria-label="Breadcrumb" style={{ justifyContent: 'center' }}>
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">Quiz</span>
            </nav>
            <span className="tag c1" style={{ marginBottom: 20 }}><span className="pip" />{steps.length} questions · 2 minutes</span>
            <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, margin: '14px 0', textWrap: 'balance' }}>
              Which {niche.entity} is right for you?
            </h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Tap an answer and get a direct recommendation.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 40 }}>
          <div className="wrap" style={{ maxWidth: 680 }}>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: 32, boxShadow: 'var(--shadow)' }}>
              <QuizEngine steps={steps} locale="en" />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
