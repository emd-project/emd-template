/**
 * lib/comparateur.ts — comparateurs produit de la niche.
 * Les DONNÉES vivent dans `content/data/comparateurs.json` (FR) et
 * `content/data/comparateurs.en.json` (EN) — DATA, pas de code.
 * Ce module ne fait que TYPER et exposer ces données, locale-aware.
 *
 * PARITÉ FR⇄EN : si la locale EN est active, les données EN DOIVENT couvrir le FR.
 * Le test tests/i18n-parity.test.ts échoue sinon (cf. CLAUDE.md).
 *
 * Modèle EMD = MENTION, PAS d'affiliation. `sourceUrl` = lien NEUTRE éventuel.
 */
import comparateursData from '@/content/data/comparateurs.json'
import comparateursDataEn from '@/content/data/comparateurs.en.json'

export type ModeleComparateur = {
  nom: string
  prix: number
  nouveaute?: boolean
  /** Lien NEUTRE éventuel (source officielle / marque). '' ou absent = aucun lien. Jamais affilié. */
  sourceUrl?: string
  specs: Record<string, string>
}

export type ProduitComparateur = {
  id: string
  label: string
  description: string
  specsLabels: Record<string, string>
  modeles: ModeleComparateur[]
}

/** Données comparateur FR (source canonique des slugs). */
export const COMPARATEURS = comparateursData as unknown as Record<string, ProduitComparateur>
/** Données comparateur EN (miroir ; doit couvrir le FR si locale EN active). */
export const COMPARATEURS_EN = comparateursDataEn as unknown as Record<string, ProduitComparateur>

/** All valid product slugs for static generation (slugs canoniques = FR). */
export const PRODUIT_SLUGS = Object.keys(COMPARATEURS)

/** Jeu de comparateurs pour une locale (EN si dispo, sinon repli FR — jamais un crash). */
export function getComparateurs(locale: string = 'fr'): Record<string, ProduitComparateur> {
  if (locale === 'en' && Object.keys(COMPARATEURS_EN).length > 0) return COMPARATEURS_EN
  return COMPARATEURS
}

/** Get a single product by slug, locale-aware (repli FR si l'entrée EN manque). */
export function getProduit(slug: string, locale: string = 'fr'): ProduitComparateur | undefined {
  if (locale === 'en') return COMPARATEURS_EN[slug] ?? COMPARATEURS[slug]
  return COMPARATEURS[slug]
}
