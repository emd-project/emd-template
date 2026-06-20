/**
 * /blog/[categorie] — hub catégorie. Le corps est rendu par <CategoryView>
 * (composant locale-aware + multi-variantes). La route garde le SEO :
 * metadata, generateStaticParams, JSON-LD BreadcrumbList. Server Component · ISR 3600s.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllArticles, getCategories, CATEGORY_LABELS } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { CategoryView } from '@/components/category/CategoryView'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 3600

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
    alternates: {
      canonical: `${SITE_URL}/blog/${categorie}`,
      languages: {
        fr: `${SITE_URL}/blog/${categorie}`,
        en: `${SITE_URL}/en/blog/${categorie}`,
        'x-default': `${SITE_URL}/blog/${categorie}`,
      },
    },
  }
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { categorie } = await params
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const all = getAllArticles().filter((a) => a.categorie === categorie)
  if (all.length === 0) notFound()

  const categories = getCategories()
  const label = catLabel(categorie)

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
      <CategoryView locale="fr" categorie={categorie} articles={all} categories={categories} currentPage={currentPage} />
    </>
  )
}
