/**
 * lib/comparateur.ts — comparateurs produit de la niche.
 * Les DONNÉES vivent dans `content/data/comparateurs.json` (remplies par la tâche
 * pages-clés / l'init — DATA, pas de code, conforme à references/pages-cles.md).
 * Ce module ne fait que TYPER et exposer ces données.
 *
 * Modèle EMD = MENTION, PAS d'affiliation. `sourceUrl` = lien NEUTRE éventuel vers
 * la source officielle / la page de la marque ('' ou absent = aucun lien).
 * Jamais de lien affilié, jamais de tag d'affiliation.
 */
import comparateursData from '@/content/data/comparateurs.json'

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

/** Données comparateur, chargées depuis content/data/comparateurs.json. */
export const COMPARATEURS = comparateursData as unknown as Record<string, ProduitComparateur>

/** All valid product slugs for static generation. */
export const PRODUIT_SLUGS = Object.keys(COMPARATEURS)

/** Get a single product by slug. */
export function getProduit(slug: string): ProduitComparateur | undefined {
  return COMPARATEURS[slug]
}
