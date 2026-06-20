/**
 * /en/blog/[categorie]/[slug] — English article (MDX). Rendu délégué à
 * <ArticleView locale="en">. La route garde data loading (lecteurs EN), notFound,
 * generateMetadata (+ hreflang réciproque) et generateStaticParams. ISR 86400s.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllArticlesEn, getArticleRawEn, articleExistsEn, getRelatedArticlesEn } from '@/lib/blog'
import { articleSlugEnToFr } from '@/lib/i18n/article-slugs'
import { niche } from '@/niche.config'
import { ArticleView } from '@/components/article/ArticleView'
import { resolveArticleVariant } from '@/lib/variants'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

type Params = Promise<{ categorie: string; slug: string }>

export async function generateStaticParams() {
  return getAllArticlesEn().map(({ categorie, slug }) => ({ categorie, slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie, slug } = await params
  if (!articleExistsEn(categorie, slug)) return {}
  const { meta } = getArticleRawEn(categorie, slug)

  const frSlug = articleSlugEnToFr[slug] ?? null
  const frUrl = frSlug ? `${SITE_URL}/blog/${categorie}/${frSlug}` : null
  const languages: Record<string, string> = { en: `${SITE_URL}/en/blog/${categorie}/${slug}` }
  if (frUrl) {
    languages.fr = frUrl
    languages['x-default'] = frUrl
  } else {
    languages['x-default'] = `${SITE_URL}/en/blog/${categorie}/${slug}`
  }

  return {
    title: `${meta.title} | ${niche.siteName}`,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/en/blog/${categorie}/${slug}`,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/en/blog/${categorie}/${slug}`,
      siteName: niche.siteName,
      type: 'article',
      locale: 'en',
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt ?? meta.publishedAt,
      ...(niche.author.name ? { authors: [niche.author.name] } : {}),
      ...(meta.featureImage ? { images: [{ url: meta.featureImage.startsWith('/') ? `${SITE_URL}${meta.featureImage}` : meta.featureImage }] } : {}),
    },
  }
}

export default async function ArticlePageEn({ params }: { params: Params }) {
  const { categorie, slug } = await params
  if (!articleExistsEn(categorie, slug)) notFound()

  const { meta, content } = getArticleRawEn(categorie, slug)
  const related = getRelatedArticlesEn(categorie, slug, 3)

  return (
    <ArticleView
      locale="en"
      variant={resolveArticleVariant()}
      categorie={categorie}
      slug={slug}
      meta={meta}
      content={content}
      related={related}
    />
  )
}
