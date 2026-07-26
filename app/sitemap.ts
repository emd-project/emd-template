import type { MetadataRoute } from 'next'
import { niche, isMultilingual, localePath, simulatorEnabled } from '@/niche.config'
import {
  getAllArticles,
  getCategories,
  getAllArticlesEn,
  getCategoriesEn,
  articleHref,
} from '@/lib/blog'
import { articleSlugFrToEn } from '@/lib/i18n/article-slugs'
import { CLASSEMENT_SLUGS } from '@/lib/classement'
import { PRODUIT_SLUGS } from '@/lib/comparateur'
import { hasChoisirContent } from '@/lib/choisir-content'
import { hasQuizSteps } from '@/lib/cms-pages'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

/**
 * Sitemap dynamique — FONDATION SEO TECH (toutes les niches en héritent).
 *
 * Principes :
 *  - On n'émet QUE des URLs indexables qui répondent 200. Chaque route dont le
 *    rendu peut se terminer par un `notFound()` est donc gardée par la MÊME
 *    condition que la page :
 *      · /simulateur → `simulatorEnabled()` (désactivé par défaut) ;
 *      · /quiz et /en/quiz → `hasQuizSteps(locale)` (pas de questions = 404) ;
 *      · /choisir/[produit] → entrée dans content/data/choisir.json ;
 *      · /deals n'est plus émis du tout (modèle MENTION, page hors doctrine).
 *    Émettre du noindex ou du 404 déclenche des avertissements en Search Console.
 *  - Les CLASSEMENTS sont l'asset GEO n°1 : le hub /classement et chaque
 *    /classement/[produit] sont émis dès qu'un classement existe. Idem pour les
 *    comparateurs (/comparer + /comparer/[produit]).
 *  - Contenu FR ET EN énuméré dynamiquement (articles + catégories réellement
 *    présents). Rien n'est codé en dur côté contenu → un nouveau site se
 *    sitemap tout seul au fil des publications.
 *  - hreflang réciproque (`alternates.languages` : fr + en + x-default) ajouté
 *    aux paires FR↔EN qui existent vraiment (home, blog, catégories mirrorées,
 *    articles dont la traduction est connue via articleSlugFrToEn, classements et
 *    comparateurs — dont les routes EN retombent sur les données FR).
 *    /choisir reste FR-only : les pages EN n'ont pas d'éditorial localisé.
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

  /** URL absolue d'une route EN (respecte localePrefix via localePath). */
  const enHref = (path: string) => `${SITE_URL}${localePath('en', path)}`

  /** Helper hreflang FR↔EN (réciproque + x-default sur le FR canonique). */
  const pair = (frUrl: string, enUrl: string) => ({
    alternates: { languages: { fr: frUrl, en: enUrl, 'x-default': frUrl } },
  })

  // Le quiz ne rend une page que s'il a de vraies questions (sinon 404).
  const quizFr = niche.quiz.enabled && hasQuizSteps(niche.defaultLocale)
  const quizEn = en && niche.quiz.enabled && hasQuizSteps('en')

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
    ...(en ? pair(`${SITE_URL}/blog`, enHref('/blog')) : {}),
  })

  // ── FR : classements (asset GEO n°1) ─────────────────────────────────────
  // Les routes EN retombent sur les données FR (getClassement(slug, 'en')) :
  // chaque slug FR a donc toujours une page EN correspondante.
  if (CLASSEMENT_SLUGS.length > 0) {
    entries.push({
      url: `${SITE_URL}/classement`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      ...(en ? pair(`${SITE_URL}/classement`, enHref('/classement')) : {}),
    })
    for (const slug of CLASSEMENT_SLUGS) {
      const frUrl = `${SITE_URL}/classement/${slug}`
      entries.push({
        url: frUrl,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
        ...(en ? pair(frUrl, enHref(`/classement/${slug}`)) : {}),
      })
    }
  }

  // ── FR : comparateur (hub + une page par produit) ────────────────────────
  if (niche.comparator.enabled) {
    entries.push({
      url: `${SITE_URL}/comparer`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      ...(en ? pair(`${SITE_URL}/comparer`, enHref('/comparer')) : {}),
    })
    for (const slug of PRODUIT_SLUGS) {
      const frUrl = `${SITE_URL}/comparer/${slug}`
      entries.push({
        url: frUrl,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
        ...(en ? pair(frUrl, enHref(`/comparer/${slug}`)) : {}),
      })
    }
  }

  // ── FR : /choisir/[produit] — SEULEMENT si choisir.json a une entrée ──────
  // Sans entrée éditoriale, la page se réduit au quiz (contenu mince) et peut
  // même renvoyer 404 : on ne la propose pas à l'indexation. FR-only : les pages
  // /en/choisir n'ont pas d'éditorial localisé.
  for (const slug of PRODUIT_SLUGS) {
    if (!hasChoisirContent(slug)) continue
    entries.push({
      url: `${SITE_URL}/choisir/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  if (quizFr) {
    entries.push({
      url: `${SITE_URL}/quiz`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(quizEn ? pair(`${SITE_URL}/quiz`, enHref('/quiz')) : {}),
    })
  }
  if (simulatorEnabled()) {
    entries.push({
      url: `${SITE_URL}/simulateur`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(en ? pair(`${SITE_URL}/simulateur`, enHref('/simulateur')) : {}),
    })
  }

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
        ? pair(frUrl, enHref(`/blog/${c.slug}`))
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
    { url: enHref('/blog'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  )

  // EN : classements (miroirs des slugs FR, données EN avec repli FR).
  if (CLASSEMENT_SLUGS.length > 0) {
    entries.push({ url: enHref('/classement'), lastModified: now, changeFrequency: 'weekly', priority: 0.85 })
    for (const slug of CLASSEMENT_SLUGS) {
      entries.push({ url: enHref(`/classement/${slug}`), lastModified: now, changeFrequency: 'weekly', priority: 0.8 })
    }
  }

  // EN : comparateur (hub + produits).
  if (niche.comparator.enabled) {
    entries.push({ url: enHref('/comparer'), lastModified: now, changeFrequency: 'weekly', priority: 0.75 })
    for (const slug of PRODUIT_SLUGS) {
      entries.push({ url: enHref(`/comparer/${slug}`), lastModified: now, changeFrequency: 'weekly', priority: 0.7 })
    }
  }

  if (quizEn) {
    entries.push({ url: enHref('/quiz'), lastModified: now, changeFrequency: 'monthly', priority: 0.65 })
  }
  if (simulatorEnabled()) {
    entries.push({ url: enHref('/simulateur'), lastModified: now, changeFrequency: 'monthly', priority: 0.65 })
  }

  // EN : catégories (≥ 1 article EN).
  for (const c of getCategoriesEn()) {
    entries.push({
      url: enHref(`/blog/${c.slug}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  // EN : articles publiés.
  for (const a of getAllArticlesEn()) {
    entries.push({
      url: enHref(`/blog/${a.categorie}/${a.slug}`),
      lastModified: safeDate(a.updatedAt ?? a.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return entries
}
