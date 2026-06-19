import type { MetadataRoute } from 'next'
import { niche, isMultilingual, localePath } from '@/niche.config'
import {
  getAllArticles,
  getCategories,
  getAllArticlesEn,
  getCategoriesEn,
  articleHref,
} from '@/lib/blog'
import { articleSlugFrToEn } from '@/lib/i18n/article-slugs'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

/**
 * Sitemap dynamique — FONDATION SEO TECH (toutes les niches en héritent).
 *
 * Principes :
 *  - On n'émet QUE des URLs indexables (pas les pages légales noindex, pas les
 *    routes désactivées par niche.config). Émettre du noindex déclenche des
 *    avertissements « Submitted URL marked noindex » en Search Console.
 *  - Contenu FR ET EN énuméré dynamiquement (articles + catégories réellement
 *    présents). Rien n'est codé en dur côté contenu → un nouveau site se
 *    sitemap tout seul au fil des publications.
 *  - hreflang réciproque (`alternates.languages` : fr + en + x-default) ajouté
 *    aux paires FR↔EN qui existent vraiment (home, blog, catégories mirrorées,
 *    articles dont la traduction est connue via articleSlugFrToEn). Évite les
 *    annotations hreflang cassées (règle d'or : réciprocité + auto-référence).
 *  - Catégories bornées à la liste blanche niche.categories (slugs routables) ;
 *    les catégories « fantômes » d'articles standalone ne sont pas émises.
 */

/** Date valide garantie (frontmatter parfois vide → évite un Invalid Date). */
function safeDate(iso?: string): Date {
  if (!iso) return new Date()
  const d = new Date(iso)
  return isNaN(d.getTime()) ? new Date() : d
}

/** Slugs de catégories réellement routables (liste blanche niche.config). */
const CATEGORY_SLUGS = new Set(niche.categories.map((c) => c.slug))

export default function sitemap(): MetadataRoute.Sitemap {
  const en = isMultilingual()
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  /** Helper hreflang FR↔EN (réciproque + x-default sur le FR canonique). */
  const pair = (frUrl: string, enUrl: string) => ({
    alternates: { languages: { fr: frUrl, en: enUrl, 'x-default': frUrl } },
  })

  // ── FR : pages clés ──────────────────────────────────────────────────────
  entries.push({
    url: SITE_URL,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1,
    ...(en ? pair(SITE_URL, `${SITE_URL}/en`) : {}),
  })
  entries.push({
    url: `${SITE_URL}/blog`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
    ...(en ? pair(`${SITE_URL}/blog`, `${SITE_URL}/en/blog`) : {}),
  })
  if (niche.comparator.enabled) {
    entries.push({ url: `${SITE_URL}/comparer`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 })
  }
  if (niche.quiz.enabled) {
    entries.push({ url: `${SITE_URL}/quiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })
  }
  if (niche.simulator.enabled) {
    entries.push({ url: `${SITE_URL}/simulateur`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })
  }
  entries.push({ url: `${SITE_URL}/deals`, lastModified: now, changeFrequency: 'daily', priority: 0.7 })

  // Auteur (modèle mono-auteur par défaut ; étendre si une liste d'auteurs arrive).
  if (niche.author.slug) {
    entries.push({ url: `${SITE_URL}/auteurs/${niche.author.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 })
  }

  // ── FR : catégories (liste blanche, ≥ 1 article) ─────────────────────────
  const enCategorySlugs = new Set(en ? getCategoriesEn().map((c) => c.slug) : [])
  for (const c of getCategories()) {
    if (!CATEGORY_SLUGS.has(c.slug)) continue
    const frUrl = `${SITE_URL}/blog/${c.slug}`
    entries.push({
      url: frUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
      ...(en && enCategorySlugs.has(c.slug)
        ? pair(frUrl, `${SITE_URL}${localePath('en', `/blog/${c.slug}`)}`)
        : {}),
    })
  }

  // ── FR : articles (blog + standalone) ────────────────────────────────────
  for (const a of getAllArticles()) {
    const frUrl = `${SITE_URL}${articleHref(a)}`
    const enSlug = a.standalone ? undefined : articleSlugFrToEn[a.slug]
    entries.push({
      url: frUrl,
      lastModified: safeDate(a.updatedAt ?? a.publishedAt),
      changeFrequency: 'monthly',
      priority: a.standalone ? 0.6 : 0.7,
      ...(en && enSlug
        ? pair(frUrl, `${SITE_URL}/en/blog/${a.categorie}/${enSlug}`)
        : {}),
    })
  }

  if (!en) return entries

  // ── EN : pages clés (uniquement les routes EN qui existent et sont indexables) ──
  entries.push(
    { url: `${SITE_URL}/en`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/en/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  )

  // EN : catégories (≥ 1 article EN).
  for (const c of getCategoriesEn()) {
    entries.push({
      url: `${SITE_URL}${localePath('en', `/blog/${c.slug}`)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  // EN : articles publiés.
  for (const a of getAllArticlesEn()) {
    entries.push({
      url: `${SITE_URL}${localePath('en', `/blog/${a.categorie}/${a.slug}`)}`,
      lastModified: safeDate(a.updatedAt ?? a.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return entries
}
