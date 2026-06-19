/**
 * /en/legal-notice — Legal notice (EN mirror of /mentions-legales, Voltéo style).
 * Static. noindex: legal page. Company data is identical to the FR version
 * (legal facts: MentionBox SRL, BE 0784.700.405…), only the copy is translated.
 * Note: EMD has no affiliation — no « affiliate links » section.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export function generateMetadata(): Metadata {
  return {
    title: `Legal notice | ${niche.siteName}`,
    description: `Legal notice for ${niche.siteName}.`,
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/en/legal-notice`,
      languages: {
        fr: `${SITE_URL}/mentions-legales`,
        en: `${SITE_URL}/en/legal-notice`,
        'x-default': `${SITE_URL}/mentions-legales`,
      },
    },
  }
}

const h2 = { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 14px' } as const
const block = { fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.75 } as const

export default function LegalNoticePage() {
  return (
    <main id="main-content" className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 40 }}>
          Legal notice
        </h1>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Site publisher</h2>
          <div style={block}>
            <p>Site: {niche.siteName} — https://{niche.domain}</p>
            <p>Company: MentionBox SRL — a limited liability company under Belgian law</p>
            <p>Company number: BE 0784.700.405</p>
            <p>Registered office: Rue Blanche-Eau 15, 6950 Nassogne, Belgium</p>
            <p>Email: emd@mentionbox.be</p>
            <p>Publication director: MentionBox SRL</p>
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Host</h2>
          <div style={block}>
            <p>Vercel Inc.</p>
            <p>440 N Barranca Ave #4133, Covina, CA 91723, United States</p>
            <p>https://vercel.com</p>
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Intellectual property</h2>
          <p style={block}>
            All content on this site (text, images, graphics, logo, icons, etc.) is the exclusive
            property of {niche.siteName}, unless stated otherwise. Any reproduction, representation,
            modification, publication or adaptation of all or part of the site&rsquo;s elements is
            prohibited without prior written authorisation.
          </p>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Personal data</h2>
          <p style={block}>
            Information about the collection and processing of personal data is detailed in our{' '}
            <Link href="/en/privacy" style={{ color: 'var(--primary-d)', textDecoration: 'underline' }}>
              privacy policy
            </Link>.
          </p>
        </section>

        <section>
          <p style={{ ...block, color: 'var(--ink-2)', fontSize: 14 }}>
            The authoritative version is the{' '}
            <Link href="/mentions-legales" style={{ color: 'var(--primary-d)', textDecoration: 'underline' }} hrefLang="fr">
              French legal notice
            </Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
