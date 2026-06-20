/**
 * lib/blog-l10n.ts — Helpers blog LOCALE-AWARE (additif, non destructif).
 *
 * Permet aux composants partagés (homes, listings) de servir FR et EN avec le
 * MÊME code : on choisit la source d'articles, le préfixe d'URL et le format de
 * date selon la locale, sans dupliquer de composant. Lit `niche.defaultLocale`
 * pour décider ce qui est « la locale sans préfixe ».
 */
import { niche } from '@/niche.config'
import { getAllArticles, getAllArticlesEn, articleHref, type ArticleMeta } from '@/lib/blog'

/** Articles de la locale : défaut → FR ; toute autre → miroir EN. */
export function getArticlesL(locale: string): ArticleMeta[] {
  return locale === niche.defaultLocale ? getAllArticles() : getAllArticlesEn()
}

/** Href d'un article respectant le préfixe de locale (no-op sur la locale par défaut). */
export function articleHrefL(locale: string, a: ArticleMeta): string {
  if (locale === niche.defaultLocale) return articleHref(a)
  if (a.standalone) return `/${locale}/${a.slug}`
  return `/${locale}/blog/${a.categorie}/${a.slug}`
}

/** Date formatée selon la locale (fr-FR / en-GB). */
export function formatDateL(locale: string, iso: string): string {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
