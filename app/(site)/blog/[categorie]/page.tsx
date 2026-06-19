/**
 * /blog/[categorie] — hub catégorie, structure Voltéo.
 * hub-hero + barre de filtres (catégorie active) + grille d'articles + pagination.
 * Server Component · ISR 3600s.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getAllArticles, getCategories, CATEGORY_LABELS, formatDate, articleHref, type ArticleMeta } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { Pagination } from '@/components/blog/Pagination'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 3600

const ARTICLES_PER_PAGE = 12

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) => CATEGORY_LABELS[slug] ?? slug

type Params = Promise<{ categorie: string }>
type SearchParams = Promise<{ page?: string }>

export async function generateStaticParams() {
  return getCategories().map(({ slug }) => ({ categorie: slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie } = await params
  const label = catLabel(categorie)
  const year = currentYear()
  return {
    title: `${label} — articles et guides ${year} | ${niche.siteName}`,
    description: `Tous les articles ${label} : guides, comparatifs et conseils.`,
    alternates: { canonical: `${SITE_URL}/blog/${categorie}` },
  }
}

function Cover({ a }: { a: ArticleMeta }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { categorie } = await params
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const all = getAllArticles().filter((a) => a.categorie === categorie)
  if (all.length === 0) notFound()

  const categories = getCategories()
  const label = catLabel(categorie)
  const totalPages = Math.ceil(all.length / ARTICLES_PER_PAGE)
  const paged = all.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

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
        <header className="hub-hero">
          <span className="glow" aria-hidden="true" />
          <div className="wrap">
            <nav className="crumb" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link><span className="sep">/</span>
              <Link href="/blog">Blog</Link><span className="sep">/</span><span className="cur">{label}</span>
            </nav>
            <span className="kicker"><span className={`tag ${catClass(categorie)}`} style={{ padding: '3px 10px' }}><span className="pip" />Catégorie</span></span>
            <h1>{label}</h1>
            <div className="meta"><span>{all.length} article{all.length > 1 ? 's' : ''}</span></div>
          </div>
        </header>

        <div className="filter-bar">
          <div className="wrap">
            <Link href="/blog" className="chip">Tout</Link>
            {categories.map(({ slug, label: lbl }) => (
              <Link key={slug} href={`/blog/${slug}`} className={`chip${slug === categorie ? ' on' : ''}`}>
                <span className="pip" style={{ background: `var(--cat-${CAT_INDEX[slug] ?? 1})` }} />{lbl}
              </Link>
            ))}
          </div>
        </div>

        <section className="section" style={{ paddingTop: 48 }}>
          <div className="wrap">
            <div className="posts">
              {paged.map((a) => (
                <Link key={a.slug} href={articleHref(a)} className="post">
                  <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                  <div className="post-body">
                    <h3>{a.title}</h3>
                    {a.description && <p>{a.description}</p>}
                    <div className="post-meta">{formatDate(a.publishedAt)} · {a.readingTimeMin} min</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/blog/${categorie}`} />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
