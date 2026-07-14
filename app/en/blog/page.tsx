/**
 * /en/blog — English mirror of the editorial hub (/blog, Voltéo structure).
 * hub-hero + filter bar + featured article + article grid + theme guides.
 *
 * EDITORIAL identity (`presse`): the BODY is replaced by `PresseBlogHub` with
 * locale="en" (all copy flows through tl(locale, …) — no FR leaks). Metadata,
 * JSON-LD and ISR are left untouched: SEO does not depend on the variant.
 *
 * Server Component · ISR 3600s · searchParams: page
 *
 * i18n (block 2b) : reads the EN mirror via getAllArticlesEn()/getCategoriesEn().
 * Copy is written in English inline (t() is locked to niche.defaultLocale = fr).
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getAllArticlesEn, getCategoriesEn, type ArticleMeta } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { Pagination } from '@/components/blog/Pagination'
import { PresseBlogHub } from '@/components/presse/PresseBlogHub'
import { isPresse } from '@/lib/variants'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 3600

const ARTICLES_PER_PAGE = 9

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) =>
  niche.categories.find((c) => c.slug === slug)?.label ?? slug

/** EN date formatting (formatDate() in lib/blog is fr-FR only). */
const formatDateEn = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** EN article href (articleHref() emits FR /blog/... paths). */
const articleHrefEn = (a: ArticleMeta) => `/en/blog/${a.categorie}/${a.slug}`

type SearchParams = Promise<{ page?: string }>

export function generateMetadata(): Metadata {
  // Description riche EN (sans niche.entities qui est un mot FR → pas de fuite FR).
  // Titre sans année (l'année reste dans le H1 visible).
  const description = 'Independent guides, comparisons and reviews: data-backed analysis and practical advice to choose with confidence.'
  return {
    title: `Blog | ${niche.siteName}`,
    description,
    alternates: {
      canonical: `${SITE_URL}/en/blog`,
      languages: {
        fr: `${SITE_URL}/blog`,
        en: `${SITE_URL}/en/blog`,
        'x-default': `${SITE_URL}/blog`,
      },
    },
    openGraph: {
      title: 'Blog',
      description,
      url: `${SITE_URL}/en/blog`,
      siteName: niche.siteName,
      type: 'website',
      locale: 'en',
    },
  }
}

function Cover({ a, className }: { a: ArticleMeta; className?: string }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:980px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
  return <div className={`ph ${className ?? ''}`}><span>{catLabel(a.categorie)}</span></div>
}

export default async function BlogPageEn({ searchParams }: { searchParams: SearchParams }) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const allArticles = getAllArticlesEn()
  const categories = getCategoriesEn()
  const [featured, ...rest] = allArticles

  const paged = rest.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)
  const totalPages = Math.ceil(rest.length / ARTICLES_PER_PAGE)
  const showFeatured = featured && currentPage === 1

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/en/blog` },
    ],
  }

  const schema = (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  )

  // ── EDITORIAL identity: presse hub (same data, same SEO) ──────────────────
  if (isPresse()) {
    return (
      <>
        {schema}
        <PresseBlogHub locale="en" articles={allArticles} categories={categories} currentPage={currentPage} />
      </>
    )
  }

  return (
    <>
      {schema}

      <main id="main-content">

        {/* ── Hero hub ── */}
        <header className="hub-hero">
          <span className="glow" aria-hidden="true" />
          <div className="wrap">
            <nav className="crumb" aria-label="Breadcrumb">
              <Link href="/en">Home</Link><span className="sep">/</span><span className="cur">Blog</span>
            </nav>
            <span className="kicker"><span className="tag c1" style={{ padding: '3px 10px' }}><span className="pip" />{niche.siteName}</span></span>
            <h1>Blog {currentYear()}</h1>
            <p className="lead">Independent guides, comparisons and reviews from {niche.siteName}.</p>
            <div className="meta">
              <span>{allArticles.length} articles</span>
            </div>
          </div>
        </header>

        {/* ── Category filters ── */}
        <div className="filter-bar">
          <div className="wrap">
            <Link href="/en/blog" className="chip on">All</Link>
            {categories.map(({ slug, label }) => (
              <Link key={slug} href={`/en/blog/${slug}`} className="chip">
                <span className="pip" style={{ background: `var(--cat-${CAT_INDEX[slug] ?? 1})` }} />{label}
              </Link>
            ))}
          </div>
        </div>

        {allArticles.length === 0 ? (
          <section className="section"><div className="wrap"><p style={{ color: 'var(--ink-3)' }}>No articles yet.</p></div></section>
        ) : (
          <>
            {/* ── Featured article ── */}
            {showFeatured && (
              <section className="section" style={{ paddingTop: 56, paddingBottom: 0 }}>
                <div className="wrap">
                  <Link href={articleHrefEn(featured)} className="featured">
                    <div className="feat-img"><Cover a={featured} /></div>
                    <div className="feat-body">
                      <span className="feat-flag"><span className={`tag ${catClass(featured.categorie)}`}><span className="pip" />{catLabel(featured.categorie)}</span></span>
                      <h2>{featured.title}</h2>
                      {featured.description && <p>{featured.description}</p>}
                      <div className="feat-meta">
                        {niche.author.name && <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{niche.author.name} · </span>}
                        <time dateTime={featured.publishedAt}>{formatDateEn(featured.publishedAt)}</time> · {featured.readingTimeMin} min
                      </div>
                    </div>
                  </Link>
                </div>
              </section>
            )}

            {/* ── List ── */}
            <section className="section" style={{ paddingTop: 48 }}>
              <div className="wrap">
                <div className="list-head">
                  <h3>Blog</h3>
                  <span className="count">{allArticles.length} articles</span>
                </div>
                <div className="posts">
                  {paged.map((a) => (
                    <Link key={`${a.categorie}/${a.slug}`} href={articleHrefEn(a)} className="post">
                      <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                      <div className="post-body">
                        <span className={`tag ${catClass(a.categorie)}`}><span className="pip" />{catLabel(a.categorie)}</span>
                        <h3>{a.title}</h3>
                        {a.description && <p>{a.description}</p>}
                        <div className="post-meta">{formatDateEn(a.publishedAt)} · {a.readingTimeMin} min</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/en/blog" locale="en" />
                </div>
              </div>
            </section>

            {/* ── Theme guides ── */}
            {categories.length > 0 && (
              <section className="section guides">
                <div className="wrap">
                  <div className="sec-head" style={{ marginBottom: 36 }}>
                    <span className="eyebrow">Explore by theme</span>
                    <h2 style={{ fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 800, marginTop: 14 }}>Browse our guides</h2>
                  </div>
                  <div className="guide-grid">
                    {categories.map(({ slug, label, count }) => (
                      <Link key={slug} href={`/en/blog/${slug}`} className="guide">
                        <span className="g-ic" style={{ background: `var(--cat-${CAT_INDEX[slug] ?? 1}-soft)`, color: `var(--cat-${CAT_INDEX[slug] ?? 1})` }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><circle cx="12" cy="12" r="8" /></svg>
                        </span>
                        <h4>{label}</h4>
                        <span className="g-count">{count} article{count > 1 ? 's' : ''}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}
