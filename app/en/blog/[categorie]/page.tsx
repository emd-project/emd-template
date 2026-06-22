/**
 * /en/blog/[categorie] — English mirror. Corps rendu par <CategoryView locale="en">.
 * SEO conservé dans la route (metadata + hreflang, generateStaticParams borné à
 * getCategoriesEn(), JSON-LD). Server Component · ISR 3600s.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllArticlesEn, getCategoriesEn, CATEGORY_LABELS } from '@/lib/blog'
import { CategoryView } from '@/components/category/CategoryView'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 3600

const catLabel = (slug: string) => CATEGORY_LABELS[slug] ?? slug

type Params = Promise<{ categorie: string }>
type SearchParams = Promise<{ page?: string }>

export async function generateStaticParams() {
  return getCategoriesEn().map(({ slug }) => ({ categorie: slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie } = await params
  const label = catLabel(categorie)
  // No year in the title (avoids > 60 titles and yearly staleness).
  return {
    title: `${label} — articles and guides | ${niche.siteName}`,
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

export default async function CategoryPageEn({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { categorie } = await params
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const all = getAllArticlesEn().filter((a) => a.categorie === categorie)
  if (all.length === 0) notFound()

  const categories = getCategoriesEn()
  const label = catLabel(categorie)

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
      <CategoryView locale="en" categorie={categorie} articles={all} categories={categories} currentPage={currentPage} />
    </>
  )
}
