/**
 * /en/deals — Deals page (EN mirror of /deals).
 * Hero + MarqueeStrip + DealsGrid + FAQ. ISR 900s. No affiliate links (EMD = mention).
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { MarqueeStrip } from '@/components/effects/MarqueeStrip'
import { DealsGrid } from '@/components/deals/DealsGrid'
import { FaqAccordion } from '@/components/blog/FaqAccordion'
import { niche } from '@/niche.config'
import type { Deal } from '@/components/deals/DealsGrid'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 900

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: `Deals ${year} — best current offers | ${niche.siteName}`,
    description: `The best ${niche.entities} deals right now. Hand-picked — no spam.`,
    alternates: {
      canonical: `${SITE_URL}/en/deals`,
      languages: {
        fr: `${SITE_URL}/deals`,
        en: `${SITE_URL}/en/deals`,
        'x-default': `${SITE_URL}/deals`,
      },
    },
    openGraph: { title: `Deals ${year}`, description: `Best ${niche.entities} deals, hand-picked.`, url: `${SITE_URL}/en/deals`, siteName: niche.siteName, type: 'website', locale: 'en' },
  }
}

const DEALS: Deal[] = []
const MARQUEE_ITEMS = ['Selection updated every week', `The best ${niche.entities} deals right now`]

const FAQ_ITEMS = [
  { q: `Where can I find the best deals right now?`, a: `On ${niche.domain}/en/deals we hand-pick the best discounts every week. No fake deals, no inflated pre-promo prices.` },
  { q: `When should I buy at the best price?`, a: `The best moments: Black Friday, the sales, and right after a new model launches — the previous one drops immediately.` },
  { q: `How do you verify deals?`, a: `We compare the displayed price with the official price and price history. If the crossed-out price is inflated, we don't publish it. Independent editorial selection, no sponsored deals.` },
]

const jsonLdBreadcrumb = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
    { '@type': 'ListItem', position: 2, name: 'Deals', item: `${SITE_URL}/en/deals` },
  ],
}
const jsonLdFaq = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
}

export default function DealsPageEn() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <main id="main-content">
        <MarqueeStrip direction="left" speed="slow">
          {MARQUEE_ITEMS.map((item) => (
            <span key={item} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✦</span>{item}
            </span>
          ))}
        </MarqueeStrip>

        <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
          <div className="wrap">
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 28, fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 18vw, 240px)', fontWeight: 800, color: 'var(--primary)', opacity: 0.06, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>%</span>
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">Deals</span>
            </nav>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 16 }}>Deals</h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-2)', maxWidth: 520, lineHeight: 1.6 }}>
              Hand-picked. No sponsored deals, no inflated pre-promo prices. Only real, verified discounts.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            {DEALS.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 16, padding: '64px 24px', lineHeight: 1.6 }}>
                No deals available yet. Check back soon!
              </p>
            ) : (
              <DealsGrid deals={DEALS} />
            )}

            <section aria-labelledby="faq-deals" style={{ marginTop: 48 }}>
              <h2 id="faq-deals" style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--ink)', marginBottom: 24 }}>Frequently asked questions — deals</h2>
              <FaqAccordion items={FAQ_ITEMS} />
            </section>

            <div style={{ marginTop: 40, padding: '20px 24px', background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--ink-3)' }}>
              <strong style={{ color: 'var(--ink-2)' }}>Independence:</strong> editorial selection, no affiliate links or sponsored deals.{' '}
              <Link href="/en/legal-notice" style={{ color: 'var(--primary-d)', textDecoration: 'underline' }}>Legal notice →</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
