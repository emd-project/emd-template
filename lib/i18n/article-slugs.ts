/**
 * lib/i18n/article-slugs.ts — mapping bidirectionnel des slugs d'articles entre locales.
 *
 * Rempli au fil de la publication (la tâche de rédaction quotidienne ajoute une entrée par
 * article). Slug naturel par langue (SEO) → on a besoin du mapping pour :
 *  - le sélecteur de langue (savoir où rediriger, JAMAIS une 404)
 *  - hreflang (pointer vers les bonnes alternates, et seulement si elles existent)
 *  - les redirects (taper un slug FR sur /en/... → bon slug EN)
 *
 * cf. skills/seo-geo-redaction/references/mirror-i18n.md
 */

/** Slugs d'articles FR → EN. Ex : 'meilleure-voiture-electrique-2026': 'best-electric-car-2026' */
export const articleSlugFrToEn: Record<string, string> = {
  // rempli à la publication
  'article-modele': 'article-model',
}

/** Réciproque EN → FR (dérivée automatiquement). */
export const articleSlugEnToFr: Record<string, string> = Object.fromEntries(
  Object.entries(articleSlugFrToEn).map(([fr, en]) => [en, fr]),
)

/**
 * Slug équivalent dans la locale cible, ou `null` si aucune traduction connue.
 * `null` = signal au sélecteur de langue de retomber sur l'accueil (jamais une 404).
 */
export function articleSlugInOrNull(slug: string, from: string, to: string): string | null {
  if (from === to) return slug
  if (from === 'fr' && to === 'en') return articleSlugFrToEn[slug] ?? null
  if (from === 'en' && to === 'fr') return articleSlugEnToFr[slug] ?? null
  return null // autres paires (NL/DE…) : étendre ici si le site ajoute des locales
}

/** Variante tolérante : même slug en dernier recours (pour hreflang best-effort). */
export function translateArticleSlug(slug: string, from: string, to: string): string {
  return articleSlugInOrNull(slug, from, to) ?? slug
}
