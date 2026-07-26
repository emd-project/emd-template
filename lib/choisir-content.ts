/**
 * lib/choisir-content.ts — contenu éditorial structuré des pages /choisir/[produit].
 * Les DONNÉES vivent dans `content/data/choisir.json` (remplies par la tâche
 * pages-clés / l'init — DATA, pas de code). Ce module ne fait que typer et exposer.
 * Le contenu est pur texte ; le rendu JSX est dans ChoisirEditorial.
 */
import choisirData from '@/content/data/choisir.json'

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

/** Contenu éditorial /choisir, chargé depuis content/data/choisir.json. */
export const CHOISIR_CONTENT = choisirData as unknown as Record<string, ChoisirProductContent>

/** Get editorial content for a /choisir/[produit] page. */
export function getChoisirContent(produit: string, _year?: number): ChoisirProductContent | undefined {
  return CHOISIR_CONTENT[produit]
}

/**
 * True si `content/data/choisir.json` contient une entrée pour ce produit.
 *
 * Garde anti-lien-mort : on n'affiche le CTA « Faire le quiz → » (comparer,
 * classement) que si la page /choisir/[produit] a vraiment quelque chose à rendre.
 */
export function hasChoisirContent(produit: string): boolean {
  return Boolean(CHOISIR_CONTENT[produit])
}
