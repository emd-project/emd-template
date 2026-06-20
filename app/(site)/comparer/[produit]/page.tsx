/**
 * /comparer/[produit] — comparateur côte à côte (style Voltéo).
 * Server Component — ComparateurSelector isolé en 'use client'.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProduit, PRODUIT_SLUGS } from '@/lib/comparateur'
import { ComparateurSelector } from '@/components/comparer/ComparateurSelector'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

/** Retire un millésime final éventuel du label (l'année est rajoutée dynamiquement). */
const stripYear = (s: string) => s.replace(/\s*20\d{2}\s*$/, '').trim()

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
  const label = stripYear(data.label)
  return {
    title: `Comparateur ${label} ${year} — quel modèle choisir ? | ${niche.siteName}`,
    description: data.description,
    alternates: { canonical: `${SITE_URL}/comparer/${produit}` },
    openGraph: { title: `Comparateur ${label} ${year}`, description: data.description, url: `${SITE_URL}/comparer/${produit}`, siteName: niche.siteName, type: 'website' },
  }
}

const AUTRES_PRODUITS = PRODUIT_SLUGS.map((slug) => {
  const p = getProduit(slug)
  return { slug, label: stripYear(p?.label ?? slug) }
})

export default async function ComparateurProduitPage({ params }: { params: Params }) {
  const { produit } = await params
  const data = getProduit(produit)
  if (!data) notFound()

  const year = currentYear()
  const label = stripYear(data.label)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Comparateur', item: `${SITE_URL}/comparer` },
      { '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}/comparer/${produit}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section className="section" style={{ paddingBottom: 24 }}>
          <div className="wrap" style={{ maxWidth: 960 }}>
            <nav className="crumb" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link><span className="sep">/</span>
              <Link href="/comparer">Comparateur</Link><span className="sep">/</span>
              <span className="cur">{label}</span>
            </nav>

            <div className="cmp-tabs">
              {AUTRES_PRODUITS.map((p) => (
                <Link key={p.slug} href={`/comparer/${p.slug}`} className={`chip${p.slug === produit ? ' on' : ''}`}>{p.label}</Link>
              ))}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 12 }}>
              Comparateur {label} {year}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 560, lineHeight: 1.6, marginBottom: 6 }}>{data.description}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Sélectionnez les modèles à comparer côte à côte.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 960 }}>
            <ComparateurSelector modeles={data.modeles} specsLabels={data.specsLabels} />

            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Prix indicatifs, sourcés et datés. Comparatif neutre et indépendant, sans lien affilié.
            </p>

            <div style={{ marginTop: 32, padding: 28, background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
              <p style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 16 }}>Vous hésitez encore ? Répondez à 4 questions pour trouver votre modèle.</p>
              <Link href={`/choisir/${produit}`} className="btn btn-accent">Faire le quiz →</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
