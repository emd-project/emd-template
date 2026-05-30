/**
 * /choisir/[produit] — "Quel [produit] choisir en {year} ?"
 * Structure : hero + quiz interactif + contenu éditorial + FAQ + auteur.
 * Server Component — QuizEngine isolé en 'use client'.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import { ChoisirEditorial } from '@/components/choisir/ChoisirEditorial'
import { currentYear } from '@/lib/utils/year'
import { COMPARATEURS, PRODUIT_SLUGS } from '@/lib/comparateur'
import { getChoisirContent } from '@/lib/choisir-content'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 86400

type Params = Promise<{ produit: string }>

export function generateStaticParams() {
  return PRODUIT_SLUGS.map((produit) => ({ produit }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { produit } = await params
  const data = COMPARATEURS[produit]
  if (!data) return {}
  const year = currentYear()

  return {
    title: `Quel ${data.label} choisir en ${year} ? Guide complet + quiz | ${niche.siteName}`,
    description: `Quel ${data.label} ${niche.entityVerb} en ${year} ? Quiz en 4 questions, comparatif par profil, prix et verdict honnête. Guide mis à jour.`,
    alternates: {
      canonical: `${SITE_URL}/choisir/${produit}`,
    },
    openGraph: {
      title: `Quel ${data.label} choisir en ${year} ?`,
      description: `Quiz en 4 questions, comparatif par profil et verdict honnête pour choisir son ${data.label} en ${year}.`,
      url: `${SITE_URL}/choisir/${produit}`,
      siteName: niche.siteName,
      type: 'article',
    },
  }
}

// Build hero config dynamically from niche categories
function getHeroConfig(slug: string): { emoji: string; accentRgba: string } {
  const catIndex = niche.categories.findIndex((c) => c.slug === slug)
  if (catIndex === -1) return { emoji: '📦', accentRgba: 'rgba(255,61,87,0.14)' }
  const cat = niche.categories[catIndex]
  // Convert hex accent to rgba
  const hex = cat.accent
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { emoji: '📦', accentRgba: `rgba(${r},${g},${b},0.14)` }
}

// Published dates — set to current date for new sites
const DEFAULT_PUBLISHED = new Date().toISOString().slice(0, 10)

export default async function ChoisirPage({ params }: { params: Params }) {
  const { produit } = await params
  const data = COMPARATEURS[produit]
  if (!data) notFound()

  const year = currentYear()
  const hero = getHeroConfig(produit)
  const editorial = getChoisirContent(produit, year)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: `Choisir son ${data.label}`, item: `${SITE_URL}/choisir/${produit}` },
    ],
  }

  return (
    <main id="main-content">
      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${hero.accentRgba} 0%, transparent 72%)`,
          padding: 'var(--space-16) var(--space-6) var(--space-12)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <span
            aria-hidden="true"
            style={{ fontSize: '48px', display: 'block', marginBottom: 'var(--space-4)' }}
          >
            {hero.emoji}
          </span>
          <h1
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-4)',
              textWrap: 'balance',
            }}
          >
            <Balancer>Quel {data.label} choisir en {year}&nbsp;?</Balancer>
          </h1>
          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            {data.description}
          </p>
        </div>
      </section>

      {/* Quiz */}
      <section
        aria-labelledby="quiz-titre"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-6) var(--space-4)',
        }}
      >
        <h2
          id="quiz-titre"
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: 'clamp(18px, 2.5vw, 22px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            textAlign: 'center',
          }}
        >
          <Balancer>Trouve ton modèle en 4 questions</Balancer>
        </h2>
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
          }}
        >
          <QuizEngine defaultProduit={produit} />
        </div>
      </section>

      {/* Editorial content (if available for this product) */}
      {editorial && (
        <ChoisirEditorial
          content={editorial}
          produit={produit}
          publishedAt={DEFAULT_PUBLISHED}
        />
      )}
    </main>
  )
}
