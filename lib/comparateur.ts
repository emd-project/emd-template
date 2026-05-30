/**
 * lib/comparateur.ts — données statiques de tous les comparateurs produit.
 * Placeholder vide — le prompt d'init remplit ce fichier avec les données de la niche.
 * Toujours passer amazonUrl via AffiliateLink / addAffiliateTag().
 */

export type ModeleComparateur = {
  nom: string
  prix: number
  nouveaute?: boolean
  amazonUrl: string  // '' = à venir
  specs: Record<string, string>
}

export type ProduitComparateur = {
  id: string
  label: string
  description: string
  specsLabels: Record<string, string>
  modeles: ModeleComparateur[]
}

// Placeholder — à remplir par le prompt d'init avec les produits de la niche
export const COMPARATEURS: Record<string, ProduitComparateur> = {}

/** All valid product slugs for static generation. */
export const PRODUIT_SLUGS = Object.keys(COMPARATEURS)

/** Get a single product by slug. */
export function getProduit(slug: string): ProduitComparateur | undefined {
  return COMPARATEURS[slug]
}
