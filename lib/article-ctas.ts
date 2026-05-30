/**
 * article-ctas.ts — CTA produit à injecter dans les articles.
 * Lit les produits depuis content/produits/*.yaml (géré via CMS).
 * Supporte le format multi-liens (links[]) et l'ancien format (url).
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { addAffiliateTag } from '@/lib/utils/affiliate'

export type ProductLink = {
  store: string
  url: string
}

export type ArticleCTA = {
  name: string
  price: string
  url: string
  badge?: string
  hook: string
  allLinks?: ProductLink[]
}

type ProductData = {
  name: string
  categorie: string
  prix: string
  /** Ancien format — un seul lien */
  url?: string
  /** Nouveau format — multi-liens */
  links?: ProductLink[]
  /** Nom du store pour le sticky CTA (ex: "Amazon") */
  stickyCta?: string
  badge?: string
  hook: string
  active?: boolean
}

const PRODUITS_DIR = path.join(process.cwd(), 'content/produits')

/** Lit tous les produits depuis content/produits/*.yaml */
function loadProducts(): ProductData[] {
  if (!fs.existsSync(PRODUITS_DIR)) return []
  return fs.readdirSync(PRODUITS_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(PRODUITS_DIR, f), 'utf-8')
      const { data } = matter(`---\n${raw}\n---`)
      return data as ProductData
    })
    .filter((p) => p.active !== false)
}

/** Résout l'URL prioritaire d'un produit (sticky CTA ou premier lien ou fallback url) */
function getPrimaryUrl(product: ProductData): string {
  // Nouveau format: chercher le lien du store prioritaire
  if (product.links && product.links.length > 0) {
    if (product.stickyCta) {
      const priority = product.links.find(
        (l) => l.store.toLowerCase() === product.stickyCta!.toLowerCase()
      )
      if (priority) return priority.url
    }
    // Fallback: premier lien
    return product.links[0].url
  }
  // Ancien format
  return product.url ?? ''
}

/** Résout tous les liens d'un produit avec tags affiliés */
function getAllLinks(product: ProductData): ProductLink[] {
  if (product.links && product.links.length > 0) {
    return product.links.map((l) => ({
      store: l.store,
      url: addAffiliateTag(l.url),
    }))
  }
  if (product.url) {
    return [{ store: 'Amazon', url: addAffiliateTag(product.url) }]
  }
  return []
}

/** Convertit un produit YAML en ArticleCTA */
function toArticleCTA(product: ProductData): ArticleCTA {
  return {
    name: product.name,
    price: product.prix,
    url: addAffiliateTag(getPrimaryUrl(product)),
    badge: product.badge,
    hook: product.hook,
    allLinks: getAllLinks(product),
  }
}

/**
 * Retourne les CTA pour une catégorie.
 * Lit depuis content/produits/ (CMS).
 */
export function getCTAsForCategory(categorie: string): ArticleCTA[] {
  const products = loadProducts()
  const matching = products
    .filter((p) => p.categorie === categorie)
    .map(toArticleCTA)

  if (matching.length > 0) return matching

  // Fallback : catégorie "astuces" → première catégorie avec des produits
  if (categorie === 'astuces' && products.length > 0) {
    const firstCat = products[0].categorie
    const fallback = products.filter((p) => p.categorie === firstCat).map(toArticleCTA)
    if (fallback.length > 0) return fallback
  }

  // Fallback ultime : premiers produits trouvés
  return products.slice(0, 3).map(toArticleCTA)
}

/** Retourne tous les produits (pour le comparateur, etc.) */
export function getAllProducts(): (ProductData & { slug: string })[] {
  if (!fs.existsSync(PRODUITS_DIR)) return []
  return fs.readdirSync(PRODUITS_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => {
      const slug = f.replace('.yaml', '')
      const raw = fs.readFileSync(path.join(PRODUITS_DIR, f), 'utf-8')
      const { data } = matter(`---\n${raw}\n---`)
      return { slug, ...(data as ProductData) }
    })
    .filter((p) => p.active !== false)
}
