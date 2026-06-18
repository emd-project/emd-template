import type { MetadataRoute } from 'next'
import { niche, isMultilingual, localePath } from '@/niche.config'
import { getAllArticlesEn, getCategoriesEn } from '@/lib/blog'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

/**
 * Sitemap — FR (toujours) + miroir EN (bloc 4, borné au contenu EN réellement présent).
 *
 * i18n :
 *  - Pages EN émises UNIQUEMENT si `isMultilingual()` ET si la route EN existe
 *    réellement (l'arbre app/en/ ne couvre que /en, /en/blog, /en/legal-notice,
 *    /en/privacy + le blog/catégories/articles EN). On n'émet PAS /en/comparer,
 *    /en/quiz, /en/simulateur, /en/deals (pas de route EN → éviterait un 404).
 *  - Blog/catégories/articles EN bornés via getCategoriesEn()/getAllArticlesEn()
 *    → rien tant que content/blog/en/ est vide (build FR non impacté).
 *  - hreflang `alternates.languages` ajouté aux entrées FR qui ont un miroir EN
 *    statique (home + blog), supporté nativement par MetadataRoute.Sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const en = isMultilingual()

  // ── FR (toujours présent) ──────────────────────────────────────────────
  const fr: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      ...(en ? { alternates: { languages: { en: `${SITE_URL}/en` } } } : {}),
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      ...(en ? { alternates: { languages: { en: `${SITE_URL}/en/blog` } } } : {}),
    },
    {
      url: `${SITE_URL}/comparer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/simulateur`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/deals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  if (!en) return fr

  // ── EN (borné au contenu réellement présent dans app/en/ et content/blog/en/) ──
  const enStatic: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/en/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/en/legal-notice`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Catégories EN (uniquement celles ayant ≥ 1 article EN).
  const enCategories: MetadataRoute.Sitemap = getCategoriesEn().map((c) => ({
    url: `${SITE_URL}${localePath('en', `/blog/${c.slug}`)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Articles EN réellement publiés.
  const enArticles: MetadataRoute.Sitemap = getAllArticlesEn().map((a) => ({
    url: `${SITE_URL}${localePath('en', `/blog/${a.categorie}/${a.slug}`)}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(a.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...fr, ...enStatic, ...enCategories, ...enArticles]
}
