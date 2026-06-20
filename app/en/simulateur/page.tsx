/**
 * /en/simulateur — price-cycle simulator (EN mirror of /simulateur).
 * Static data. Server Component · ISR 86400s. No affiliate CTA (EMD = mention).
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: niche.simulator.title ? `${niche.simulator.title} ${year} | ${niche.siteName}` : `Price simulator ${year} | ${niche.siteName}`,
    description: niche.simulator.description || `Price-cycle analysis. Buy at the right time and save.`,
    alternates: {
      canonical: `${SITE_URL}/en/simulateur`,
      languages: {
        fr: `${SITE_URL}/simulateur`,
        en: `${SITE_URL}/en/simulateur`,
        'x-default': `${SITE_URL}/simulateur`,
      },
    },
    openGraph: { title: niche.simulator.title || `Price simulator ${year}`, description: niche.simulator.description || `${niche.entities} price cycles.`, url: `${SITE_URL}/en/simulateur`, siteName: niche.siteName, type: 'website', locale: 'en' },
  }
}

type CyclePrix = {
  modele: string; lancement: string; prixLancement: number; prixActuel: number
  prochaineAnnonce: string; recommandation: 'acheter' | 'attendre' | 'deal'
  sourceUrl?: string
}

const CYCLES: CyclePrix[] = []

const REC_CONFIG = {
  acheter: { label: 'Good time', color: 'var(--green)' },
  attendre: { label: 'Wait', color: 'var(--gaz)' },
  deal: { label: 'Great deal', color: 'var(--primary)' },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
    { '@type': 'ListItem', position: 2, name: 'Simulator', item: `${SITE_URL}/en/simulateur` },
  ],
}

export default function SimulatorPageEn() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
          <div className="wrap">
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 28, fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 20vw, 280px)', fontWeight: 800, color: 'var(--primary)', opacity: 0.05, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>€</span>
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">Simulator</span>
            </nav>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 16 }}>Price cycles</h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-2)', maxWidth: 560, lineHeight: 1.6, marginBottom: 16 }}>
              Prices of older models drop with every new release. This table tells you whether you are before or after the optimal window.
            </p>
            <Link href="/en/blog" style={{ fontSize: 14, color: 'var(--primary-d)', fontWeight: 600, textDecoration: 'underline' }}>View all guides →</Link>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            {CYCLES.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 16, padding: '64px 24px' }}>
                No price-cycle data yet. Check back soon!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {CYCLES.map((c) => {
                  const rec = REC_CONFIG[c.recommandation]
                  const economie = c.prixLancement - c.prixActuel
                  return (
                    <article key={c.modele} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, alignItems: 'center' }}>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>{c.modele}</h2>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Launched <time dateTime={c.lancement}>{new Date(c.lancement).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</time></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Launch price</div>
                        <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 16, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{c.prixLancement.toLocaleString('en-GB')} €</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Current price</div>
                        <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 20, fontWeight: 700, color: 'var(--primary-d)' }}>{c.prixActuel.toLocaleString('en-GB')} €</div>
                        {economie > 0 && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>−{economie} € vs launch</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Next announcement</div>
                        <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{c.prochaineAnnonce}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: rec.color, padding: '6px 14px', borderRadius: 100 }}>{rec.label}</span>
                        {c.sourceUrl ? (
                          <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-d)', textDecoration: 'underline' }}>View official sheet →</a>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>Indicative prices, sourced and dated. Updated regularly. No affiliate links.</p>
          </div>
        </section>
      </main>
    </>
  )
}
