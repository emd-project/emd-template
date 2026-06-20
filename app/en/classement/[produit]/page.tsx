/**
 * /en/classement/[produit] — ranking (EN mirror of /classement/[produit]).
 * Server Component. EN data via getClassement(slug, 'en') (FR fallback).
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getClassement, getClassements, CLASSEMENT_SLUGS } from '@/lib/classement'
import { getProduit } from '@/lib/comparateur'
import { ClassementList, type ClassementLabels } from '@/components/classement/ClassementList'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`
const stripYear = (s: string) => s.replace(/\s*20\d{2}\s*$/, '').trim()

export const revalidate = 86400

type Params = Promise<{ produit: string }>

const LABELS: ClassementLabels = {
  tldr: 'Key takeaways', criteria: 'Ranking criteria', methodology: 'Methodology', sources: 'Sources',
  bestForPrefix: 'Best for', pros: 'Pros', cons: 'Cons',
  comparatorCta: 'Compare in detail →', quizCta: 'Find my model →',
  tableTitle: 'Comparison table', faqTitle: 'Frequently asked questions',
  model: 'Model', scoreLabel: 'Score', priceLabel: 'Price', bestForCol: 'Best for',
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
    description: c.intro || `The best ${label} in ${year}: Top ${c.items.length}, scores, verdict and comparison table.`,
    alternates: {
      canonical: `${SITE_URL}/en/classement/${produit}`,
      languages: {
        fr: `${SITE_URL}/classement/${produit}`,
        en: `${SITE_URL}/en/classement/${produit}`,
        'x-default': `${SITE_URL}/classement/${produit}`,
      },
    },
    openGraph: { title: `Top ${c.items.length} best ${label} ${year}`, description: c.intro, url: `${SITE_URL}/en/classement/${produit}`, siteName: niche.siteName, type: 'article', locale: 'en' },
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
          <div className="wrap" style={{ maxWidth: 920 }}>
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">{label} ranking</span>
            </nav>
            {tabs.length > 1 && (
              <div className="cmp-tabs">
                {tabs.map((t) => (
                  <Link key={t.slug} href={`/en/classement/${t.slug}`} className={`chip${t.slug === produit ? ' on' : ''}`}>{stripYear(t.label)}</Link>
                ))}
              </div>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.4vw, 48px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.08, marginBottom: 12 }}>
              Top {c.items.length} best {label} {year}
            </h1>
            {c.intro && <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 620, lineHeight: 1.6 }}>{c.intro}</p>}
            {c.updated && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>Updated {new Date(c.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 920 }}>
            <ClassementList
              classement={c}
              labels={LABELS}
              comparerHref={hasComparateur ? `/en/comparer/${produit}` : undefined}
              quizHref={`/en/choisir/${produit}`}
            />
          </div>
        </section>
      </main>
    </>
  )
}
