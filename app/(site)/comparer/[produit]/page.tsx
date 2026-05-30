/**
 * /comparer/[produit] — comparateur côte à côte.
 * Sélecteurs dropdown + specs alignés en colonnes.
 * Server Component — ComparateurSelector isolé en 'use client'.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { getProduit, PRODUIT_SLUGS } from '@/lib/comparateur'
import { ComparateurSelector } from '@/components/comparer/ComparateurSelector'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 3600

type Params = Promise<{ produit: string }>

export function generateStaticParams() {
  return PRODUIT_SLUGS.map((produit) => ({ produit }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { produit } = await params
  const data = getProduit(produit)
  if (!data) return {}
  const year = currentYear()
  return {
    title: `Comparateur ${data.label} ${year} — quel modèle choisir ? | ${niche.siteName}`,
    description: data.description,
    alternates: { canonical: `${SITE_URL}/comparer/${produit}` },
    openGraph: {
      title: `Comparateur ${data.label} ${year}`,
      description: data.description,
      url: `${SITE_URL}/comparer/${produit}`,
      siteName: niche.siteName,
      type: 'website',
    },
  }
}

const AUTRES_PRODUITS = PRODUIT_SLUGS.map((slug) => {
  const p = getProduit(slug)
  return { slug, label: p?.label ?? slug }
})

export default async function ComparateurProduitPage({ params }: { params: Params }) {
  const { produit } = await params
  const data = getProduit(produit)
  if (!data) notFound()

  const year = currentYear()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Comparateur', item: `${SITE_URL}/comparer` },
      { '@type': 'ListItem', position: 3, name: data.label, item: `${SITE_URL}/comparer/${produit}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content">
        {/* Hero */}
        <section
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: 'var(--space-12) var(--space-6) var(--space-6)',
          }}
        >
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-5)' }}>
            <ol style={{ display: 'flex', gap: 'var(--space-2)', listStyle: 'none', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <li><Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accueil</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/comparer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Comparateur</Link></li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" style={{ color: 'var(--text-secondary)' }}>{data.label}</li>
            </ol>
          </nav>

          {/* Sélecteur familles */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
            {AUTRES_PRODUITS.map((p) => (
              <Link
                key={p.slug}
                href={`/comparer/${p.slug}`}
                style={{
                  fontSize: '13px',
                  fontWeight: p.slug === produit ? 700 : 400,
                  color: p.slug === produit ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  background: p.slug === produit ? 'var(--accent-1)' : 'transparent',
                  border: '1px solid',
                  borderColor: p.slug === produit ? 'var(--accent-1)' : 'var(--glass-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: 'var(--space-1) var(--space-4)',
                  textDecoration: 'none',
                }}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <h1
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: 'clamp(24px, 4vw, 44px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-3)',
            }}
          >
            <Balancer>Comparateur {data.label} {year}</Balancer>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>
            {data.description}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Sélectionne les modèles à comparer côte à côte.
          </p>
        </section>

        {/* Comparateur interactif */}
        <section
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '0 var(--space-6) var(--space-16)',
          }}
        >
          <ComparateurSelector
            modeles={data.modeles}
            specsLabels={data.specsLabels}
          />

          <p style={{ marginTop: 'var(--space-8)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Prix indicatifs. Les liens {niche.defaultStore} sont des liens affiliés
            — le prix que tu paies reste identique.
          </p>

          {/* CTA vers le quiz */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-6)',
              background: 'var(--surface-2)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
              Tu hésites encore ? Réponds à 4 questions pour trouver ton modèle.
            </p>
            <Link
              href={`/choisir/${produit}`}
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
              Faire le quiz →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
