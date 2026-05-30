/**
 * /blog/[categorie] — hub catégorie.
 * Grille complète des articles de la catégorie + breadcrumb + pagination.
 * Server Component · ISR 3600s.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { getAllArticles, getCategories, CATEGORY_LABELS, CATEGORY_ACCENT } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { Pagination } from '@/components/blog/Pagination'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 3600

const ARTICLES_PER_PAGE = 12

type Params = Promise<{ categorie: string }>
type SearchParams = Promise<{ page?: string }>

export async function generateStaticParams() {
  const categories = getCategories()
  return categories.map(({ slug }) => ({ categorie: slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie } = await params
  const label = CATEGORY_LABELS[categorie] ?? categorie
  const year = currentYear()
  return {
    title: `${label} — articles et guides ${year} | ${niche.siteName}`,
    description: `Tous les articles ${label} : guides d'achat, comparatifs et conseils.`,
    alternates: { canonical: `${SITE_URL}/blog/${categorie}` },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { categorie } = await params
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const all = getAllArticles().filter((a) => a.categorie === categorie)
  if (all.length === 0) notFound()

  const label = CATEGORY_LABELS[categorie] ?? categorie
  const accent = CATEGORY_ACCENT[categorie] ?? 'var(--accent-1)'
  const totalPages = Math.ceil(all.length / ARTICLES_PER_PAGE)
  const paged = all.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}/blog/${categorie}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        {/* Hero avec accent catégorie */}
        <section
          style={{
            background: `radial-gradient(ellipse 100% 80% at 0% 0%, color-mix(in srgb, ${accent} 10%, transparent) 0%, transparent 65%)`,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-14) var(--space-6) var(--space-10)' }} className="blog-hero-inner">
            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
              <ol style={{ display: 'flex', gap: 'var(--space-2)', listStyle: 'none', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <li><Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accueil</Link></li>
                <li aria-hidden="true">›</li>
                <li><Link href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</Link></li>
                <li aria-hidden="true">›</li>
                <li aria-current="page" style={{ color: 'var(--text-secondary)' }}>{label}</li>
              </ol>
            </nav>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, marginBottom: 'var(--space-3)' }}>
                  Catégorie
                </span>
                <h1 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  <Balancer>{label}</Balancer>
                </h1>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', flexShrink: 0 }}>
                {all.length} article{all.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </section>

        {/* Onglets — liens vers les autres catégories */}
        <nav aria-label="Autres catégories" style={{ borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-10)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 var(--space-6)', display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '2px solid transparent', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Tous
            </Link>
            {Object.entries(CATEGORY_LABELS).map(([slug, lbl]) => {
              const isActive = slug === categorie
              const a = CATEGORY_ACCENT[slug] ?? 'var(--accent-1)'
              return (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', fontSize: '13px', fontWeight: isActive ? 700 : 500, color: isActive ? a : 'var(--text-secondary)', borderBottom: isActive ? `2px solid ${a}` : '2px solid transparent', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  {lbl}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Grille */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 var(--space-6) var(--space-24)' }}>
          <ul role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)', listStyle: 'none', margin: 0, padding: 0 }}>
            {paged.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} showCategory={false} />
              </li>
            ))}
          </ul>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/blog/${categorie}`} />
        </div>
      </main>
    </>
  )
}
