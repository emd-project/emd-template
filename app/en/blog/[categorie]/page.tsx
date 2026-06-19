/**
 * /en/blog/[categorie] — English mirror of the category hub (Voltéo structure).
 * hub-hero + filter bar (active category) + article grid + pagination.
 * Server Component · ISR 3600s.
 *
 * i18n (block 2b) : reads the EN mirror; generateStaticParams is bounded to
 * getCategoriesEn() (whitelist-only — never a locale folder; empty → [] which
 * still compiles). Same segment name as FR ([categorie]).
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getAllArticlesEn, getCategoriesEn, CATEGORY_LABELS, type ArticleMeta } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { Pagination } from '@/components/blog/Pagination'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 3600

const ARTICLES_PER_PAGE = 12

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) => CATEGORY_LABELS[slug] ?? slug

const formatDateEn = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const articleHrefEn = (a: ArticleMeta) => `/en/blog/${a.categorie}/${a.slug}`

type Params = Promise<{ categorie: string }>
type SearchParams = Promise<{ page?: string }>

export async function generateStaticParams() {
  return getCategoriesEn().map(({ slug }) => ({ categorie: slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie } = await params
  const label = catLabel(categorie)
  const year = currentYear()
  return {
    title: `${label} — articles and guides ${year} | ${niche.siteName}`,
    description: `All ${label} articles: guides, comparisons and advice.`,
    alternates: {
      canonical: `${SITE_URL}/en/blog/${categorie}`,
      languages: {
        fr: `${SITE_URL}/blog/${categorie}`,
        en: `${SITE_URL}/en/blog/${categorie}`,
        'x-default': `${SITE_URL}/blog/${categorie}`,
      },
    },
  }
}

function Cover({ a }: { a: ArticleMeta }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

export default async function CategoryPageEn({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { categorie } = await params
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const all = getAllArticlesEn().filter((a) => a.categorie === categorie)
  if (all.length === 0) notFound()

  const categories = getCategoriesEn()
  const label = catLabel(categorie)
  const totalPages = Math.ceil(all.length / ARTICLES_PER_PAGE)
  const paged = all.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/en/blog` },
      { '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}/en/blog/${categorie}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <header className="hub-hero">
          <span className="glow" aria-hidden="true" />
          <div className="wrap">
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span>
              <Link href="/en/blog">Blog</Link><span className="sep">/</span><span className="cur">{label}</span>
            </nav>
            <span className="kicker"><span className={`tag ${catClass(categorie)}`} style={{ padding: '3px 10px' }}><span className="pip" />Category</span></span>
            <h1>{label}</h1>
            <div className="meta"><span>{all.length} article{all.length > 1 ? 's' : ''}</span></div>
          </div>
        </header>

        <div className="filter-bar">
          <div className="wrap">
            <Link href="/en/blog" className="chip">All</Link>
            {categories.map(({ slug, label: lbl }) => (
              <Link key={slug} href={`/en/blog/${slug}`} className={`chip${slug === categorie ? ' on' : ''}`}>
                <span className="pip" style={{ background: `var(--cat-${CAT_INDEX[slug] ?? 1})` }} />{lbl}
              </Link>
            ))}
          </div>
        </div>

        <section className="section" style={{ paddingTop: 48 }}>
          <div className="wrap">
            <div className="posts">
              {paged.map((a) => (
                <Link key={a.slug} href={articleHrefEn(a)} className="post">
                  <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                  <div className="post-body">
                    <h3>{a.title}</h3>
                    {a.description && <p>{a.description}</p>}
                    <div className="post-meta">{formatDateEn(a.publishedAt)} · {a.readingTimeMin} min</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/en/blog/${categorie}`} locale="en" />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
