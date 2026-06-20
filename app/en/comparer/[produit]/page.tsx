/**
 * /en/comparer/[produit] — side-by-side comparator (EN mirror).
 * Server Component — ComparateurSelector ('use client') with locale="en".
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProduit, PRODUIT_SLUGS } from '@/lib/comparateur'
import { ComparateurSelector } from '@/components/comparer/ComparateurSelector'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

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
    title: `${label} comparator ${year} — which model to choose? | ${niche.siteName}`,
    description: data.description,
    alternates: {
      canonical: `${SITE_URL}/en/comparer/${produit}`,
      languages: {
        fr: `${SITE_URL}/comparer/${produit}`,
        en: `${SITE_URL}/en/comparer/${produit}`,
        'x-default': `${SITE_URL}/comparer/${produit}`,
      },
    },
    openGraph: { title: `${label} comparator ${year}`, description: data.description, url: `${SITE_URL}/en/comparer/${produit}`, siteName: niche.siteName, type: 'website', locale: 'en' },
  }
}

const AUTRES_PRODUITS = PRODUIT_SLUGS.map((slug) => {
  const p = getProduit(slug)
  return { slug, label: stripYear(p?.label ?? slug) }
})

export default async function ComparatorProduitPageEn({ params }: { params: Params }) {
  const { produit } = await params
  const data = getProduit(produit)
  if (!data) notFound()

  const year = currentYear()
  const label = stripYear(data.label)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
      { '@type': 'ListItem', position: 2, name: 'Comparator', item: `${SITE_URL}/en/comparer` },
      { '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}/en/comparer/${produit}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section className="section" style={{ paddingBottom: 24 }}>
          <div className="wrap" style={{ maxWidth: 960 }}>
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span>
              <Link href="/en/comparer">Comparator</Link><span className="sep">/</span>
              <span className="cur">{label}</span>
            </nav>

            <div className="cmp-tabs">
              {AUTRES_PRODUITS.map((p) => (
                <Link key={p.slug} href={`/en/comparer/${p.slug}`} className={`chip${p.slug === produit ? ' on' : ''}`}>{p.label}</Link>
              ))}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 12 }}>
              {label} comparator {year}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 560, lineHeight: 1.6, marginBottom: 6 }}>{data.description}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Select the models to compare side by side.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 960 }}>
            <ComparateurSelector modeles={data.modeles} specsLabels={data.specsLabels} locale="en" />

            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Indicative prices, sourced and dated. Neutral, independent comparison — no affiliate links.
            </p>

            <div style={{ marginTop: 32, padding: 28, background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
              <p style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 16 }}>Still unsure? Answer 4 questions to find your model.</p>
              <Link href={`/en/choisir/${produit}`} className="btn btn-accent">Take the quiz →</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
