/**
 * /blog/[categorie]/[slug] — article MDX (FR). Le rendu est délégué à
 * <ArticleView> (composant UNIQUE locale-aware + variante). La route garde :
 * data loading, notFound, generateMetadata, generateStaticParams. ISR 86400s.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllArticles, getArticleRaw, articleExists, getRelatedArticles } from '@/lib/blog'
import { articleSlugFrToEn } from '@/lib/i18n/article-slugs'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'
import { ArticleView } from '@/components/article/ArticleView'
import { resolveArticleVariant } from '@/lib/variants'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

type Params = Promise<{ categorie: string; slug: string }>

export async function generateStaticParams() {
  return getAllArticles().map(({ categorie, slug }) => ({ categorie, slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie, slug } = await params
  if (!articleExists(categorie, slug)) return {}
  const { meta } = getArticleRaw(categorie, slug)
  const year = currentYear()

  const enSlug = articleSlugFrToEn[slug] ?? null
  const languages: Record<string, string> = {
    fr: `${SITE_URL}/blog/${categorie}/${slug}`,
    'x-default': `${SITE_URL}/blog/${categorie}/${slug}`,
  }
  if (enSlug) languages.en = `${SITE_URL}/en/blog/${categorie}/${enSlug}`

  return {
    title: `${meta.title} ${year} | ${niche.siteName}`,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/blog/${categorie}/${slug}`,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/blog/${categorie}/${slug}`,
      siteName: niche.siteName,
      type: 'article',
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt ?? meta.publishedAt,
      ...(niche.author.name ? { authors: [niche.author.name] } : {}),
      ...(meta.featureImage ? { images: [{ url: meta.featureImage.startsWith('/') ? `${SITE_URL}${meta.featureImage}` : meta.featureImage }] } : {}),
    },
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { categorie, slug } = await params
  if (!articleExists(categorie, slug)) notFound()

  const { meta, content } = getArticleRaw(categorie, slug)
  const related = getRelatedArticles(categorie, slug, 3)

  return (
    <ArticleView
      locale="fr"
      variant={resolveArticleVariant()}
      categorie={categorie}
      slug={slug}
      meta={meta}
      content={content}
      related={related}
    />
  )
}
