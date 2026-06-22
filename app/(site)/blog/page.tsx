/**
 * /blog — hub éditorial à la structure Voltéo.
 * hub-hero + barre de filtres + article à la une + grille d'articles + guides.
 * Server Component · ISR 3600s · searchParams: page
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getAllArticles, getCategories, formatDate, articleHref, type ArticleMeta } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { Pagination } from '@/components/blog/Pagination'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 3600

const ARTICLES_PER_PAGE = 9

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) =>
  niche.categories.find((c) => c.slug === slug)?.label ?? slug

type SearchParams = Promise<{ page?: string }>

export function generateMetadata(): Metadata {
  // Description riche (140-160 visé) au lieu de blog.heroSubtitle (trop court pour le SEO).
  // Titre sans année (l'année reste dans le H1 visible via currentYear()).
  const description = `Guides, comparatifs et tests indépendants sur les ${niche.entities} : analyses chiffrées et conseils concrets pour choisir en toute confiance.`
  return {
    title: `${t('nav.blog')} | ${niche.siteName}`,
    description,
    // hreflang réciproque (bloc 4) : la hub FR pointe vers son miroir EN (/en/blog).
    alternates: {
      canonical: `${SITE_URL}/blog`,
      languages: {
        fr: `${SITE_URL}/blog`,
        en: `${SITE_URL}/en/blog`,
        'x-default': `${SITE_URL}/blog`,
      },
    },
    openGraph: {
      title: t('nav.blog'),
      description,
      url: `${SITE_URL}/blog`,
      siteName: niche.siteName,
      type: 'website',
    },
  }
}

function Cover({ a, className }: { a: ArticleMeta; className?: string }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:980px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
  return <div className={`ph ${className ?? ''}`}><span>{catLabel(a.categorie)}</span></div>
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const allArticles = getAllArticles()
  const categories = getCategories()
  const [featured, ...rest] = allArticles

  const paged = rest.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)
  const totalPages = Math.ceil(rest.length / ARTICLES_PER_PAGE)
  const showFeatured = featured && currentPage === 1

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('blog.breadcrumbHome'), item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: t('blog.breadcrumbBlog'), item: `${SITE_URL}/blog` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">

        {/* ── Hero hub ── */}
        <header className="hub-hero">
          <span className="glow" aria-hidden="true" />
          <div className="wrap">
            <nav className="crumb" aria-label={t('blog.filterLabel')}>
              <Link href="/">{t('blog.breadcrumbHome')}</Link><span className="sep">/</span><span className="cur">{t('blog.breadcrumbBlog')}</span>
            </nav>
            <span className="kicker"><span className="tag c1" style={{ padding: '3px 10px' }}><span className="pip" />{niche.siteName}</span></span>
            <h1>{t('nav.blog')} {currentYear()}</h1>
            <p className="lead">{t('blog.heroSubtitle')}</p>
            <div className="meta">
              <span>{allArticles.length} articles</span>
            </div>
          </div>
        </header>

        {/* ── Filtres catégories ── */}
        <div className="filter-bar">
          <div className="wrap">
            <Link href="/blog" className="chip on">{t('blog.filterAll')}</Link>
            {categories.map(({ slug, label }) => (
              <Link key={slug} href={`/blog/${slug}`} className="chip">
                <span className="pip" style={{ background: `var(--cat-${CAT_INDEX[slug] ?? 1})` }} />{label}
              </Link>
            ))}
          </div>
        </div>

        {allArticles.length === 0 ? (
          <section className="section"><div className="wrap"><p style={{ color: 'var(--ink-3)' }}>{t('blog.emptyState')}</p></div></section>
        ) : (
          <>
            {/* ── Article à la une ── */}
            {showFeatured && (
              <section className="section" style={{ paddingTop: 56, paddingBottom: 0 }}>
                <div className="wrap">
                  <Link href={articleHref(featured)} className="featured">
                    <div className="feat-img"><Cover a={featured} /></div>
                    <div className="feat-body">
                      <span className="feat-flag"><span className={`tag ${catClass(featured.categorie)}`}><span className="pip" />{catLabel(featured.categorie)}</span></span>
                      <h2>{featured.title}</h2>
                      {featured.description && <p>{featured.description}</p>}
                      <div className="feat-meta">
                        {niche.author.name && <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{niche.author.name} · </span>}
                        <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time> · {featured.readingTimeMin} min
                      </div>
                    </div>
                  </Link>
                </div>
              </section>
            )}

            {/* ── Liste ── */}
            <section className="section" style={{ paddingTop: 48 }}>
              <div className="wrap">
                <div className="list-head">
                  <h3>{t('nav.blog')}</h3>
                  <span className="count">{allArticles.length} articles</span>
                </div>
                <div className="posts">
                  {paged.map((a) => (
                    <Link key={`${a.categorie}/${a.slug}`} href={articleHref(a)} className="post">
                      <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                      <div className="post-body">
                        <span className={`tag ${catClass(a.categorie)}`}><span className="pip" />{catLabel(a.categorie)}</span>
                        <h3>{a.title}</h3>
                        {a.description && <p>{a.description}</p>}
                        <div className="post-meta">{formatDate(a.publishedAt)} · {a.readingTimeMin} min</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
                </div>
              </div>
            </section>

            {/* ── Guides par thème ── */}
            {categories.length > 0 && (
              <section className="section guides">
                <div className="wrap">
                  <div className="sec-head" style={{ marginBottom: 36 }}>
                    <span className="eyebrow">{t('blog.toolsSectionEyebrow')}</span>
                    <h2 style={{ fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 800, marginTop: 14 }}>{t('blog.toolsSectionTitle')}</h2>
                  </div>
                  <div className="guide-grid">
                    {categories.map(({ slug, label, count }) => (
                      <Link key={slug} href={`/blog/${slug}`} className="guide">
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
