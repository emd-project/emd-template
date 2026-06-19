/**
 * lib/comparateur.ts — données statiques de tous les comparateurs produit.
 * Placeholder vide — le prompt d'init / la tâche pages-clés remplit ce fichier
 * avec les données factuelles de la niche (modèles + specs sourcés/datés).
 *
 * Modèle EMD = MENTION, PAS d'affiliation. Le champ `amazonUrl` est conservé
 * pour compatibilité mais ne doit PAS porter de lien affilié : '' par défaut,
 * ou au plus un lien NEUTRE vers la source officielle / la page de la marque.
 * (À renommer en `sourceUrl` lors du passage data-driven — changement build-risqué.)
 */

export type ModeleComparateur = {
  nom: string
  prix: number
  nouveaute?: boolean
  amazonUrl: string  // '' = aucun lien ; sinon lien NEUTRE (source officielle/marque), jamais affilié
  specs: Record<string, string>
}

export type ProduitComparateur = {
  id: string
  label: string
  description: string
  specsLabels: Record<string, string>
  modeles: ModeleComparateur[]
}

// Placeholder — à remplir avec les produits factuels de la niche (sourcés/datés)
export const COMPARATEURS: Record<string, ProduitComparateur> = {}

/** All valid product slugs for static generation. */
export const PRODUIT_SLUGS = Object.keys(COMPARATEURS)

/** Get a single product by slug. */
export function getProduit(slug: string): ProduitComparateur | undefined {
  return COMPARATEURS[slug]
}
