/**
 * /en/comparer — Comparator hub (EN mirror of /comparer).
 * Server Component · ISR 86400s. Data shared with FR (comparateurs.json).
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { COMPARATEURS } from '@/lib/comparateur'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: `Comparator ${year} | ${niche.siteName}`,
    description: `Compare all ${niche.entities} side by side. Up-to-date, sourced and neutral data.`,
    alternates: {
      canonical: `${SITE_URL}/en/comparer`,
      languages: {
        fr: `${SITE_URL}/comparer`,
        en: `${SITE_URL}/en/comparer`,
        'x-default': `${SITE_URL}/comparer`,
      },
    },
    openGraph: { title: `Comparator ${year}`, description: `All ${niche.entities} comparators in one place.`, url: `${SITE_URL}/en/comparer`, siteName: niche.siteName, type: 'website', locale: 'en' },
  }
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
    { '@type': 'ListItem', position: 2, name: 'Comparator', item: `${SITE_URL}/en/comparer` },
  ],
}

export default function ComparatorHubPageEn() {
  const produits = Object.values(COMPARATEURS)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">Comparator</span>
            </nav>
            <div className="sec-head" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Compare</span>
              <h2 style={{ margin: '16px 0 12px' }}>One family, models side by side.</h2>
              <p>Pick a family of {niche.entities} to compare the models at a glance.</p>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 32 }}>
          <div className="wrap">
            {produits.length === 0 ? (
              <p style={{ color: 'var(--ink-3)' }}>No comparator family configured yet.</p>
            ) : (
              <div className="cat-grid">
                {produits.map((p, i) => {
                  const n = (i % 5) + 1
                  return (
                    <Link key={p.id} href={`/en/comparer/${p.id}`} className="cat">
                      <span className="glow" style={{ background: `var(--cat-${n})` }} />
                      <span className="cat-ic" style={{ background: `var(--cat-${n}-soft)`, color: `var(--cat-${n})` }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="7" /><rect x="13" y="6" width="3" height="11" /></svg>
                      </span>
                      <h3>{p.label}</h3>
                      <p>{p.description}</p>
                      <span className="go" style={{ color: `var(--cat-${n})` }}>{p.modeles.length} models <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
