/**
 * /choisir/[produit] — "Quel [produit] choisir en {year} ?" (style Voltéo)
 * Server Component — QuizEngine isolé en 'use client'.
 *
 * ANTI-PLACEHOLDER : le bloc quiz n'est rendu QUE si des questions existent
 * (content/pages/quiz.yaml). Sans questions, la section disparaît — on n'affiche
 * plus un faux quiz « Catégorie A / B / C ». Cf. scripts/check-placeholders.mjs.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { QuizEngine, type Step } from '@/components/quiz/QuizEngine'
import { ChoisirEditorial } from '@/components/choisir/ChoisirEditorial'
import { currentYear } from '@/lib/utils/year'
import { COMPARATEURS, PRODUIT_SLUGS } from '@/lib/comparateur'
import { getChoisirContent } from '@/lib/choisir-content'
import { getPageContent } from '@/lib/cms-pages'
import { niche } from '@/niche.config'
import { quel, son } from '@/lib/utils/grammar'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

type Params = Promise<{ produit: string }>

export function generateStaticParams() {
  return PRODUIT_SLUGS.map((produit) => ({ produit }))
}

function getSteps(): Step[] {
  const steps = getPageContent('quiz')?.steps as Step[] | undefined
  return Array.isArray(steps) ? steps : []
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { produit } = await params
  const data = COMPARATEURS[produit]
  if (!data) return {}
  const g = niche.entityGender
  const year = currentYear()
  return {
    title: `${quel(g)} ${data.label} choisir en ${year} ? Guide complet + quiz | ${niche.siteName}`,
    description: `${quel(g)} ${data.label} ${niche.entityVerb} en ${year} ? Quiz, comparatif par profil, prix et verdict honnête. Guide mis à jour.`,
    alternates: { canonical: `${SITE_URL}/choisir/${produit}` },
    openGraph: { title: `${quel(g)} ${data.label} choisir en ${year} ?`, description: `Comparatif par profil et verdict honnête pour choisir ${son(g, false, data.label)} ${data.label} en ${year}.`, url: `${SITE_URL}/choisir/${produit}`, siteName: niche.siteName, type: 'article' },
  }
}

// Couleur d'accent dérivée de la catégorie correspondante
function getHeroAccent(slug: string): string {
  const cat = niche.categories.find((c) => c.slug === slug)
  if (!cat) return 'var(--primary)'
  return cat.accent
}

const DEFAULT_PUBLISHED = new Date().toISOString().slice(0, 10)

export default async function ChoisirPage({ params }: { params: Params }) {
  const { produit } = await params
  const data = COMPARATEURS[produit]
  if (!data) notFound()

  const g = niche.entityGender
  const year = currentYear()
  const accent = getHeroAccent(produit)
  const editorial = getChoisirContent(produit, year)
  const steps = getSteps()

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: `Choisir ${son(g, false, data.label)} ${data.label}`, item: `${SITE_URL}/choisir/${produit}` },
    ],
  }

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section style={{ background: `radial-gradient(ellipse 90% 70% at 50% 0%, color-mix(in srgb, ${accent} 14%, transparent) 0%, var(--cream) 72%)`, padding: '64px 0 48px', textAlign: 'center' }}>
        <div className="wrap" style={{ maxWidth: 680 }}>
          <span className="tag" style={{ marginBottom: 16, background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>Guide {year}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, margin: '14px 0 16px', textWrap: 'balance' }}>
            {quel(g)} {data.label} choisir en {year}&nbsp;?
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>{data.description}</p>
        </div>
      </section>

      {steps.length > 0 && (
        <section aria-labelledby="quiz-titre" className="section" style={{ paddingBottom: 16 }}>
          <div className="wrap" style={{ maxWidth: 720 }}>
            <h2 id="quiz-titre" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, color: 'var(--ink)', marginBottom: 24, textAlign: 'center' }}>
              Trouve ton modèle en {steps.length} questions
            </h2>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: 32, boxShadow: 'var(--shadow)' }}>
              <QuizEngine steps={steps} defaultProduit={produit} />
            </div>
          </div>
        </section>
      )}

      {editorial && (
        <ChoisirEditorial content={editorial} produit={produit} publishedAt={DEFAULT_PUBLISHED} />
      )}
    </main>
  )
}
