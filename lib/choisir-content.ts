/**
 * Contenu éditorial structuré pour les pages /choisir/[produit].
 * Placeholder vide — le prompt d'init remplit ce fichier avec le contenu de la niche.
 * Le contenu est pur texte ; le rendu JSX est dans ChoisirEditorial.
 */

export type ChoisirTable = {
  headers: string[]
  rows: string[][]
}

export type ChoisirSection = {
  id: string
  title: string
  intro: string
  paragraphs?: string[]
  table?: ChoisirTable
  tip?: string
  internalLink?: { text: string; href: string }
}

export type ChoisirFAQ = { q: string; a: string }

export type ChoisirProductContent = {
  tldr: string[]
  sections: ChoisirSection[]
  faq: ChoisirFAQ[]
}

// Placeholder — à remplir par le prompt d'init
export const CHOISIR_CONTENT: Record<string, ChoisirProductContent> = {}

/** Get editorial content for a /choisir/[produit] page. */
export function getChoisirContent(produit: string, _year?: number): ChoisirProductContent | undefined {
  return CHOISIR_CONTENT[produit]
}
