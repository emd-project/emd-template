/**
 * /en/choisir/[produit] — "Which [produit] to choose?" (EN mirror, quiz-first).
 * Server Component — QuizEngine ('use client') with locale="en".
 * EN data via getProduit(slug, 'en'). The FR editorial block is omitted until localized.
 *
 * ANTI-PLACEHOLDER : the quiz block renders only if EN steps exist (quiz.en.yaml).
 * No steps → no section, never a fake « Category A / B / C » quiz.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { QuizEngine, type Step } from '@/components/quiz/QuizEngine'
import { currentYear } from '@/lib/utils/year'
import { getProduit, PRODUIT_SLUGS } from '@/lib/comparateur'
import { getPageContent } from '@/lib/cms-pages'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

const stripYear = (s: string) => s.replace(/\s*20\d{2}\s*$/, '').trim()

export const revalidate = 86400

type Params = Promise<{ produit: string }>

export function generateStaticParams() {
  return PRODUIT_SLUGS.map((produit) => ({ produit }))
}

function getSteps(): Step[] {
  const steps = getPageContent('quiz.en')?.steps as Step[] | undefined
  return Array.isArray(steps) ? steps : []
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { produit } = await params
  const data = getProduit(produit, 'en')
  if (!data) return {}
  const year = currentYear()
  const label = stripYear(data.label)
  return {
    title: `Which ${label} to choose in ${year}? Guide + quiz | ${niche.siteName}`,
    description: `Which ${label} should you ${niche.entityVerb} in ${year}? Find the right model for your profile.`,
    alternates: {
      canonical: `${SITE_URL}/en/choisir/${produit}`,
      languages: {
        fr: `${SITE_URL}/choisir/${produit}`,
        en: `${SITE_URL}/en/choisir/${produit}`,
        'x-default': `${SITE_URL}/choisir/${produit}`,
      },
    },
    openGraph: { title: `Which ${label} to choose in ${year}?`, description: data.description, url: `${SITE_URL}/en/choisir/${produit}`, siteName: niche.siteName, type: 'article', locale: 'en' },
  }
}

function getHeroAccent(slug: string): string {
  const cat = niche.categories.find((c) => c.slug === slug)
  if (!cat) return 'var(--primary)'
  return cat.accent
}

export default async function ChoisirPageEn({ params }: { params: Params }) {
  const { produit } = await params
  const data = getProduit(produit, 'en')
  if (!data) notFound()

  const year = currentYear()
  const label = stripYear(data.label)
  const accent = getHeroAccent(produit)
  const steps = getSteps()

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
      { '@type': 'ListItem', position: 2, name: `Choosing your ${label}`, item: `${SITE_URL}/en/choisir/${produit}` },
    ],
  }

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section style={{ background: `radial-gradient(ellipse 90% 70% at 50% 0%, color-mix(in srgb, ${accent} 14%, transparent) 0%, var(--cream) 72%)`, padding: '64px 0 48px', textAlign: 'center' }}>
        <div className="wrap" style={{ maxWidth: 680 }}>
          <span className="tag" style={{ marginBottom: 16, background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>Guide {year}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, margin: '14px 0 16px', textWrap: 'balance' }}>
            Which {label} to choose in {year}?
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>{data.description}</p>
        </div>
      </section>

      {steps.length > 0 && (
        <section aria-labelledby="quiz-titre" className="section" style={{ paddingBottom: 16 }}>
          <div className="wrap" style={{ maxWidth: 720 }}>
            <h2 id="quiz-titre" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, color: 'var(--ink)', marginBottom: 24, textAlign: 'center' }}>
              Find your model in {steps.length} questions
            </h2>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: 32, boxShadow: 'var(--shadow)' }}>
              <QuizEngine steps={steps} defaultProduit={produit} locale="en" />
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
