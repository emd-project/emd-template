/**
 * /blog — hub éditorial style magazine.
 * Featured hero + filtres catégories + grille asymétrique + promo outils.
 * Server Component · ISR 3600s · searchParams: page
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { getAllArticles, getCategories, CATEGORY_ACCENT, formatDate, articleHref } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { Pagination } from '@/components/blog/Pagination'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'
import { FadeIn } from '@/components/motion/FadeIn'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 3600

const ARTICLES_PER_PAGE = 9

type SearchParams = Promise<{ page?: string }>

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: `${t('nav.blog')} ${year} | ${niche.siteName}`,
    description: t('blog.heroSubtitle'),
    alternates: { canonical: `${SITE_URL}/blog` },
    openGraph: {
      title: `${t('nav.blog')} ${year}`,
      description: t('blog.heroSubtitle'),
      url: `${SITE_URL}/blog`,
      siteName: niche.siteName,
      type: 'website',
    },
  }
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const allArticles = getAllArticles()
  const categories = getCategories()
  const [featured, ...rest] = allArticles

  const paged = rest.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  )
  const totalPages = Math.ceil(rest.length / ARTICLES_PER_PAGE)

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
        {/* ── Hero magazine ── */}
        <FadeIn>
          <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-16) var(--space-6) var(--space-10)' }}>
            <nav aria-label={t('blog.filterLabel')} style={{ marginBottom: 'var(--space-6)' }}>
              <ol style={{ display: 'flex', gap: 'var(--space-2)', listStyle: 'none', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <li><Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('blog.breadcrumbHome')}</Link></li>
                <li aria-hidden="true">›</li>
                <li aria-current="page" style={{ color: 'var(--text-secondary)' }}>{t('blog.breadcrumbBlog')}</li>
              </ol>
            </nav>

            {/* Featured article as hero */}
            {featured && currentPage === 1 ? (
              <Link href={articleHref(featured)} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 'var(--space-6)',
                  borderLeft: '4px solid var(--accent-1)',
                  paddingLeft: 'var(--space-8)',
                  paddingTop: 'var(--space-4)',
                  paddingBottom: 'var(--space-4)',
                }} className="blog-hero-featured">
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-1)', display: 'block', marginBottom: 'var(--space-3)' }}>
                      {t('recentArticles.eyebrow')}
                    </span>
                    <h1 style={{
                      fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                      fontSize: 'clamp(32px, 5vw, 60px)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.08,
                      marginBottom: 'var(--space-4)',
                    }}>
                      <Balancer>{featured.title}</Balancer>
                    </h1>
                    {featured.description && (
                      <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '640px', marginBottom: 'var(--space-4)' }}>
                        {featured.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '13px', color: 'var(--text-muted)', alignItems: 'center' }}>
                      {niche.author.name && <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{niche.author.name}</span>}
                      <span aria-hidden="true">·</span>
                      <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                      <span aria-hidden="true">·</span>
                      <span>{t('article.readingTimeShort', { min: featured.readingTimeMin })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div>
                <h1 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 'var(--space-3)' }}>
                  <Balancer>{t('nav.blog')}</Balancer>
                </h1>
                <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6 }}>
                  {t('blog.heroSubtitle')}
                </p>
              </div>
            )}
          </section>
        </FadeIn>

        {/* ── Filtres catégories ── */}
        <nav aria-label={t('blog.filterLabel')} style={{ borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-10)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 var(--space-6)', display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', gap: 0 }}>
            <Link
              href="/blog"
              aria-current="page"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', fontSize: '13px', fontWeight: 700, color: 'var(--accent-1)', borderBottom: '2px solid var(--accent-1)', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              {t('blog.filterAll')}
              <span style={{ fontSize: '11px', background: 'rgba(255,61,87,0.10)', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                {allArticles.length}
              </span>
            </Link>
            {categories.map(({ slug, label, count }) => (
              <Link key={slug} href={`/blog/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', borderBottom: '2px solid transparent', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {label}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{count}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 var(--space-6) var(--space-24)' }}>
          {allArticles.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{t('blog.emptyState')}</p>
          ) : (
            <>
              {/* ── Grille asymétrique ── */}
              {paged.length > 0 && (
                <Stagger staggerDelay={80}>
                  <ul role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', listStyle: 'none', margin: 0, padding: 0 }} className="blog-grid">
                    {paged.map((article, i) => (
                      <li
                        key={`${article.categorie}/${article.slug}`}
                        style={i < 2 ? { gridColumn: 'span 1' } : undefined}
                        className={i < 2 ? 'blog-grid-large' : undefined}
                      >
                        <StaggerItem>
                          <ArticleCard article={article} index={i} />
                        </StaggerItem>
                      </li>
                    ))}
                  </ul>
                </Stagger>
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />

              {/* ── Promo outils ── */}
              <FadeIn>
                <section style={{ marginTop: 'var(--space-16)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-10)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
                    {t('blog.toolsSectionEyebrow')}
                  </span>
                  <h2 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>
                    <Balancer>{t('blog.toolsSectionTitle')}</Balancer>
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
                    {niche.comparator.enabled && (
                      <Link href="/comparer" style={{
                        textDecoration: 'none',
                        padding: 'var(--space-5)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'block',
                        transition: 'border-color 200ms ease',
                      }} className="tool-card">
                        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-1)', marginBottom: 'var(--space-2)' }}>{t('tools.comparator.eyebrow')}</p>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{t('blog.promoComparator')}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t('blog.promoComparatorDesc')}</p>
                      </Link>
                    )}
                    {niche.quiz.enabled && (
                      <Link href="/quiz" style={{
                        textDecoration: 'none',
                        padding: 'var(--space-5)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'block',
                        transition: 'border-color 200ms ease',
                      }} className="tool-card">
                        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-4)', marginBottom: 'var(--space-2)' }}>{t('tools.quiz.eyebrow')}</p>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{t('blog.promoQuiz')}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t('blog.promoQuizDesc')}</p>
                      </Link>
                    )}
                  </div>
                </section>
              </FadeIn>
            </>
          )}
        </div>
      </main>
    </>
  )
}
