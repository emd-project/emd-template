/**
 * /en/classement/[produit] — ranking (EN mirror of /classement/[produit]).
 * Server Component. EN data via getClassement(slug, 'en') (FR fallback).
 * MENTION model: no purchase CTA — at most a NEUTRAL link to the official page.
 *
 * HERO LAYOUT — decision of 2026-08-17, mirrors the FR page exactly.
 * The previous version placed the intro and the key takeaways SIDE BY SIDE, which
 * squeezed the intro into a ~40 % column and turned a six-line paragraph into a
 * fifteen-line wall, pushing the table far down the page. We now stack: a short
 * intro on a comfortable reading measure, then « Key takeaways » FULL WIDTH right
 * below, then the items. The reader reaches the first item without scrolling
 * through three screens.
 *
 * Data-side corollary: `intro` must stay SHORT (2-3 sentences, answer-first). Detail
 * belongs in `sections[]`. A ten-line intro is still a bad intro, whatever the
 * column width.
 *
 * Since the TL;DR is rendered here, we pass `showTldr={false}` to ClassementList to
 * avoid rendering it twice.
 *
 * The « Find my model → » CTA is emitted only when /en/choisir/[produit] actually
 * renders, i.e. when quiz.en.yaml has steps — otherwise it would be a dead link.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getClassement, getClassements, CLASSEMENT_SLUGS } from '@/lib/classement'
import { getProduit } from '@/lib/comparateur'
import { hasQuizSteps } from '@/lib/cms-pages'
import { ClassementList, type ClassementLabels } from '@/components/classement/ClassementList'
import { currentYear } from '@/lib/utils/year'
import { tl } from '@/lib/i18n'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`
const stripYear = (s: string) => s.replace(/\s*20\d{2}\s*$/, '').trim()

/** Content column width. Widened from 920 to 1120 so the table and the item list
 *  breathe, and the intro is no longer strangled. Must match the FR page. */
const WRAP = 1120

export const revalidate = 86400

type Params = Promise<{ produit: string }>

const LABELS: ClassementLabels = {
  tldr: 'Key takeaways', criteria: 'Ranking criteria', methodology: 'Methodology', sources: 'Sources',
  bestForPrefix: 'Best for', pros: 'Pros', cons: 'Cons',
  comparatorCta: 'Compare in detail →', quizCta: 'Find my model →',
  tableTitle: 'Comparison table', faqTitle: 'Frequently asked questions',
  model: 'Model', scoreLabel: 'Score', priceLabel: 'Price', bestForCol: 'Best for',
  viewOfficial: tl('en', 'ui.viewOfficial'),
}

export function generateStaticParams() {
  return CLASSEMENT_SLUGS.map((produit) => ({ produit }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { produit } = await params
  const c = getClassement(produit, 'en')
  if (!c) return {}
  const year = currentYear()
  const label = stripYear(c.label)
  return {
    title: `Top ${c.items.length} best ${label} ${year} — ranking | ${niche.siteName}`,
    description: c.excerpt || c.intro || `The best ${label} in ${year}: Top ${c.items.length}, scores, verdict and comparison table.`,
    alternates: {
      canonical: `${SITE_URL}/en/classement/${produit}`,
      languages: {
        fr: `${SITE_URL}/classement/${produit}`,
        en: `${SITE_URL}/en/classement/${produit}`,
        'x-default': `${SITE_URL}/classement/${produit}`,
      },
    },
    openGraph: { title: `Top ${c.items.length} best ${label} ${year}`, description: c.excerpt || c.intro, url: `${SITE_URL}/en/classement/${produit}`, siteName: niche.siteName, type: 'article', locale: 'en' },
  }
}

export default async function ClassementPageEn({ params }: { params: Params }) {
  const { produit } = await params
  const c = getClassement(produit, 'en')
  if (!c) notFound()

  const year = currentYear()
  const label = stripYear(c.label)
  const tabs = Object.values(getClassements('en'))
  const hasComparateur = Boolean(getProduit(produit, 'en'))
  const hasChoisirEn = hasQuizSteps('en')
  const hasTldr = Boolean(c.tldr && c.tldr.length > 0)

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
        { '@type': 'ListItem', position: 2, name: 'Ranking', item: `${SITE_URL}/en/classement/${produit}` },
        { '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}/en/classement/${produit}` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: `Top ${c.items.length} ${label} ${year}`,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: c.items.length,
      itemListElement: c.items.map((it) => ({ '@type': 'ListItem', position: it.rank, name: it.nom })),
    },
    ...(c.faq && c.faq.length > 0 ? [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: c.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }] : []),
  ]

  return (
    <>
      {jsonLd.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}

      <main id="main-content">
        <section className="section" style={{ paddingBottom: 24 }}>
          <div className="wrap" style={{ maxWidth: WRAP }}>
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">{label} ranking</span>
            </nav>
            {tabs.length > 1 && (
              <div className="cmp-tabs">
                {tabs.map((tab) => (
                  <Link key={tab.slug} href={`/en/classement/${tab.slug}`} className={`chip${tab.slug === produit ? ' on' : ''}`}>{stripYear(tab.label)}</Link>
                ))}
              </div>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.4vw, 48px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.08, marginBottom: 12 }}>
              Top {c.items.length} best {label} {year}
            </h1>

            {/* Intro — READING measure (~78ch), not a narrow column. */}
            {c.intro && (
              <p style={{ fontSize: 17.5, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0, maxWidth: '78ch' }}>
                {c.intro}
              </p>
            )}
            {c.updated && (
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, marginBottom: 0 }}>
                Updated {new Date(c.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}

            {/* Key takeaways — FULL WIDTH, stacked under the intro. */}
            {hasTldr && (
              <aside
                aria-label={LABELS.tldr}
                style={{
                  marginTop: 'var(--space-7)',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                  padding: 'var(--space-6)',
                }}
              >
                <div className="eyebrow" style={{ marginBottom: 'var(--space-4)' }}>{LABELS.tldr}</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {c.tldr?.map((line, i) => (
                    <li key={i} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span aria-hidden="true" style={{ color: 'var(--accent-1)', fontWeight: 700, flexShrink: 0 }}>→</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: WRAP }}>
            <ClassementList
              classement={c}
              labels={LABELS}
              comparerHref={hasComparateur ? `/en/comparer/${produit}` : undefined}
              quizHref={hasChoisirEn ? `/en/choisir/${produit}` : undefined}
              showTldr={false}
            />
          </div>
        </section>
      </main>
    </>
  )
}
