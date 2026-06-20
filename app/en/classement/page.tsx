/**
 * /en/classement — rankings hub (EN mirror of /classement). ISR 86400s.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { getClassements } from '@/lib/classement'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: `Rankings ${year} — the best ${niche.entities} | ${niche.siteName}`,
    description: `Our independent rankings of the best ${niche.entities} in ${year}: Top by category, scores and verdicts.`,
    alternates: {
      canonical: `${SITE_URL}/en/classement`,
      languages: { fr: `${SITE_URL}/classement`, en: `${SITE_URL}/en/classement`, 'x-default': `${SITE_URL}/classement` },
    },
    openGraph: { title: `Rankings ${year}`, description: `The best ${niche.entities}, ranked.`, url: `${SITE_URL}/en/classement`, siteName: niche.siteName, type: 'website', locale: 'en' },
  }
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
    { '@type': 'ListItem', position: 2, name: 'Ranking', item: `${SITE_URL}/en/classement` },
  ],
}

export default function ClassementHubPageEn() {
  const classements = Object.values(getClassements('en'))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">Ranking</span>
            </nav>
            <div className="sec-head" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Rankings</span>
              <h2 style={{ margin: '16px 0 12px' }}>The best {niche.entities}, ranked.</h2>
              <p>Our independent Top lists by category — scores, verdicts and comparison table.</p>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 32 }}>
          <div className="wrap">
            {classements.length === 0 ? (
              <p style={{ color: 'var(--ink-3)' }}>No ranking published yet.</p>
            ) : (
              <div className="cat-grid">
                {classements.map((c, i) => {
                  const n = (i % 5) + 1
                  return (
                    <Link key={c.slug} href={`/en/classement/${c.slug}`} className="cat">
                      <span className="glow" style={{ background: `var(--cat-${n})` }} />
                      <span className="cat-ic" style={{ background: `var(--cat-${n}-soft)`, color: `var(--cat-${n})` }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M4 19V5M4 19h16M9 19v-7M14 19V9M19 19v-4" /></svg>
                      </span>
                      <h3>{c.label}</h3>
                      {c.intro && <p>{c.intro}</p>}
                      <span className="go" style={{ color: `var(--cat-${n})` }}>Top {c.items.length} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
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
