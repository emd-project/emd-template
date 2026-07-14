/**
 * /classement/[produit] — classement « Top N » (asset GEO, data-driven).
 * Server Component. Possède l'intent best/top/meilleur (cf. CLAUDE.md anti-cannibalisation).
 * Modèle MENTION : aucun CTA d'achat — au plus un lien NEUTRE vers la source officielle.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getClassement, getClassements, CLASSEMENT_SLUGS } from '@/lib/classement'
import { getProduit } from '@/lib/comparateur'
import { ClassementList, type ClassementLabels } from '@/components/classement/ClassementList'
import { currentYear } from '@/lib/utils/year'
import { best } from '@/lib/utils/grammar'
import { excerpt } from '@/lib/utils/text'
import { t } from '@/lib/i18n'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`
const stripYear = (s: string) => s.replace(/\s*20\d{2}\s*$/, '').trim()

export const revalidate = 86400

type Params = Promise<{ produit: string }>

const LABELS: ClassementLabels = {
  tldr: 'En bref', criteria: 'Critères de classement', methodology: 'Méthodologie', sources: 'Sources',
  bestForPrefix: 'Meilleur pour', pros: 'Pour', cons: 'Contre',
  comparatorCta: 'Comparer en détail →', quizCta: 'Trouver mon modèle →',
  tableTitle: 'Tableau comparatif', faqTitle: 'Questions fréquentes',
  model: 'Modèle', scoreLabel: 'Note', priceLabel: 'Prix', bestForCol: 'Meilleur pour',
  viewOfficial: t('ui.viewOfficial'),
}

export function generateStaticParams() {
  return CLASSEMENT_SLUGS.map((produit) => ({ produit }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { produit } = await params
  const c = getClassement(produit)
  if (!c) return {}
  const year = currentYear()
  const label = stripYear(c.label)
  const g = c.genre ?? niche.entityGender
  const plural = c.items.length > 1
  const desc = c.excerpt || excerpt(c.intro) || `Le classement des ${best(g, true)} ${label} en ${year} : Top ${c.items.length}, scores, verdict et tableau comparatif.`
  return {
    title: `Top ${c.items.length} ${best(g, plural)} ${label} ${year} — classement | ${niche.siteName}`,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/classement/${produit}`,
      languages: {
        fr: `${SITE_URL}/classement/${produit}`,
        en: `${SITE_URL}/en/classement/${produit}`,
        'x-default': `${SITE_URL}/classement/${produit}`,
      },
    },
    openGraph: { title: `Top ${c.items.length} ${best(g, plural)} ${label} ${year}`, description: desc, url: `${SITE_URL}/classement/${produit}`, siteName: niche.siteName, type: 'article' },
  }
}

export default async function ClassementPage({ params }: { params: Params }) {
  const { produit } = await params
  const c = getClassement(produit)
  if (!c) notFound()

  const year = currentYear()
  const label = stripYear(c.label)
  const g = c.genre ?? niche.entityGender
  const plural = c.items.length > 1
  const tabs = Object.values(getClassements('fr'))
  const hasComparateur = Boolean(getProduit(produit))

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Classement', item: `${SITE_URL}/classement/${produit}` },
        { '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}/classement/${produit}` },
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
            <nav className="crumb" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link><span className="sep">/</span><span className="cur">Classement {label}</span>
            </nav>
            {tabs.length > 1 && (
              <div className="cmp-tabs">
                {tabs.map((tab) => (
                  <Link key={tab.slug} href={`/classement/${tab.slug}`} className={`chip${tab.slug === produit ? ' on' : ''}`}>{stripYear(tab.label)}</Link>
                ))}
              </div>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.4vw, 48px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.08, marginBottom: 12 }}>
              Top {c.items.length} {best(g, plural)} {label} {year}
            </h1>
            {c.intro && <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 620, lineHeight: 1.6 }}>{c.intro}</p>}
            {c.updated && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>Mis à jour le {new Date(c.updated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 920 }}>
            <ClassementList
              classement={c}
              labels={LABELS}
              comparerHref={hasComparateur ? `/comparer/${produit}` : undefined}
              quizHref={`/choisir/${produit}`}
            />
          </div>
        </section>
      </main>
    </>
  )
}
