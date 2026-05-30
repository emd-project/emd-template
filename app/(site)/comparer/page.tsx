/**
 * /comparer — Hub de sélection produit.
 * Redirige vers /comparer/[produit] pour chaque famille.
 * DA : bento grid + border animée --accent-1 pulse lent.
 * Server Component · ISR 86400s.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { currentYear } from '@/lib/utils/year'
import { COMPARATEURS } from '@/lib/comparateur'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: `Comparateur ${year} | ${niche.siteName}`,
    description:
      `Comparez tous les ${niche.entities} côte à côte. Données à jour, liens ${niche.defaultStore} affiliés.`,
    alternates: { canonical: `${SITE_URL}/comparer` },
    openGraph: {
      title: `Comparateur ${year}`,
      description: `Tous les comparateurs ${niche.entities} en un endroit.`,
      url: `${SITE_URL}/comparer`,
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
    { '@type': 'ListItem', position: 2, name: 'Comparateur', item: `${SITE_URL}/comparer` },
  ],
}

export default function ComparateurHubPage() {
  const produits = Object.values(COMPARATEURS)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content">
        <section
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'var(--space-16) var(--space-6) var(--space-12)',
            position: 'relative',
          }}
        >
          <span
            aria-hidden="true"
            className="section-watermark"
            style={{ position: 'absolute', top: 'var(--space-8)', right: 'var(--space-6)' }}
          >
            02
          </span>

          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
            <ol style={{ display: 'flex', gap: 'var(--space-2)', listStyle: 'none', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accueil</Link></li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" style={{ color: 'var(--text-secondary)' }}>Comparateur</li>
            </ol>
          </nav>

          <h1
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-4)',
            }}
          >
            <Balancer>Comparateur</Balancer>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.6 }}>
            Choisis une famille de produit pour comparer les modèles côte à côte.
          </p>
        </section>

        {/* Bento grid familles */}
        <section
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 var(--space-6) var(--space-24)',
          }}
        >
          <ul
            role="list"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-5)',
              listStyle: 'none',
            }}
          >
            {produits.map((p) => (
              <li key={p.id}>
                <Link href={`/comparer/${p.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="comparateur-card-wrap" style={{ height: '100%' }}>
                    <article
                      style={{
                        padding: 'var(--space-7)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-3)',
                      }}
                    >
                      {/* Card content */}
                      <h2
                        style={{
                          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                          fontSize: '20px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                        }}
                      >
                        <Balancer>{p.label}</Balancer>
                      </h2>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55, flex: 1 }}>
                        {p.description}
                      </p>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--accent-1)',
                          marginTop: 'auto',
                        }}
                      >
                        {p.modeles.length} modèles →
                      </div>
                    </article>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
