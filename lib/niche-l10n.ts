/**
 * lib/niche-l10n.ts — dimension de LOCALE pour `niche.config.ts`.
 *
 * ┌─ POURQUOI CE FICHIER EXISTE À CÔTÉ DE `tl()` ─────────────────────────────┐
 * │                                                                            │
 * │ `tl(locale, clé)` (lib/i18n.ts) traduit les LIBELLÉS D'INTERFACE : un      │
 * │ vocabulaire FERMÉ, identique pour tous les forks du moteur, versionné dans │
 * │ content/translations/[locale].json (« Comparer », « Voir tout », « min de  │
 * │ lecture »).                                                                │
 * │                                                                            │
 * │ Ce module traduit le CONTENU DE CONFIGURATION : la tagline, le H1, le      │
 * │ sous-titre, les libellés de catégories — un vocabulaire OUVERT et propre à │
 * │ CHAQUE site, qui n'existe que dans son `niche.config.ts`.                  │
 * │                                                                            │
 * │ Les deux ne peuvent pas fusionner : mettre la tagline d'un fork dans       │
 * │ en.json la pousserait dans tous les autres forks, et inventer une clé      │
 * │ `tl()` par site rendrait le fichier de traductions du moteur dépendant de  │
 * │ la niche. Deux dimensions distinctes, qui ne se rejoignent que dans le JSX.│
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * LE CONTRAT — REPLI SILENCIEUX. Le code est partagé par tous les forks, dont
 * aucun n'a de traductions au départ. Sans bloc `localized`, sans la locale
 * demandée, sans le champ, ou avec une chaîne vide : on rend la valeur de BASE.
 * Toujours. Aucun avertissement, aucune chaîne vide, aucune clé brute affichée.
 * Un site sans traductions rend donc exactement ce qu'il rendait avant.
 *
 * Pour la locale par défaut, on lit la base DIRECTEMENT : `localized.fr` est inutile
 * et ne doit pas devenir un second endroit où éditer le contenu français.
 *
 * Aucun accès direct à `niche.localized` ailleurs dans le repo : le repli vit ici.
 */
import { niche, type NicheConfig } from '@/niche.config'

/** Une catégorie telle que déclarée dans `niche.config` (slug, label, accent, description). */
export type NicheCategory = NicheConfig['categories'][number]

/**
 * Champs de config simples (string) surchargeables par locale.
 * Ce sont exactement les clés présentes ET dans `NicheConfig` ET dans le bloc
 * `localized` : le type interdit d'en demander une autre.
 */
export type NicheLocalizedKey =
  | 'tagline'
  | 'subtitle'
  | 'heroPrefix'
  | 'heroSuffix'
  | 'entity'
  | 'entities'

/** `undefined` dès que la valeur est absente, non-string, ou vide/blanche. */
function nonEmpty(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  return value.trim().length > 0 ? value : undefined
}

/** Bloc de surcharge d'une locale, ou `undefined`. Jamais d'exception. */
function overrides(locale: string): NonNullable<NicheConfig['localized']>[string] | undefined {
  if (locale === niche.defaultLocale) return undefined
  return niche.localized?.[locale]
}

/**
 * Valeur d'un champ de config dans une locale. Surcharge non vide si elle existe,
 * SINON la base — toujours, et sans bruit.
 *
 * @example nicheL('en', 'subtitle') // → surcharge EN, ou le sous-titre FR
 */
export function nicheL(locale: string, key: NicheLocalizedKey): string {
  return nonEmpty(overrides(locale)?.[key]) ?? niche[key]
}

/**
 * Mots du hero rotatif dans une locale. La liste surchargée doit être NON VIDE et
 * contenir au moins une chaîne utile, sinon on garde celle de base : un tableau
 * vide viderait le H1.
 */
export function rotatingWordsL(locale: string): string[] {
  const override = overrides(locale)?.rotatingWords
  if (Array.isArray(override)) {
    const clean = override.filter((w) => nonEmpty(w) !== undefined)
    if (clean.length > 0) return clean
  }
  return niche.rotatingWords
}

/** Texte d'un CTA dans une locale. L'URL n'est JAMAIS surchargée : `localePath` la préfixe. */
export function ctaTextL(locale: string, which: 'ctaPrimary' | 'ctaSecondary'): string {
  return nonEmpty(overrides(locale)?.[which]?.text) ?? niche[which].text
}

/**
 * Libellé d'une catégorie dans une locale, PAR SLUG.
 *
 * Indexer les traductions par slug et non par position est délibéré : réordonner
 * `niche.categories` réaffecterait sinon chaque traduction à la catégorie voisine,
 * en silence et sans erreur de compilation.
 *
 * Repli, dans l'ordre : surcharge de locale → `label` de base → le slug lui-même
 * (comportement historique de tous les `catLabel` du repo, préservé).
 */
export function categoryLabelL(locale: string, slug: string): string {
  const base = niche.categories.find((c) => c.slug === slug)?.label ?? slug
  return nonEmpty(overrides(locale)?.categories?.[slug]) ?? base
}

/**
 * Les catégories de `niche.config` avec leurs libellés dans une locale.
 * ORDRE, slugs, accents et descriptions inchangés — seul `label` peut différer.
 * Pour la locale par défaut, on renvoie le tableau de base tel quel (même
 * référence) : zéro copie, zéro divergence possible.
 */
export function categoriesL(locale: string): NicheCategory[] {
  if (overrides(locale) === undefined) return niche.categories
  return niche.categories.map((c) => ({ ...c, label: categoryLabelL(locale, c.slug) }))
}

/** Map slug → libellé dans une locale (équivalent localisé de `categoryLabels()`). */
export function categoryLabelsL(locale: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const c of niche.categories) map[c.slug] = categoryLabelL(locale, c.slug)
  return map
}
