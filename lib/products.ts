/**
 * products.ts — helper to read individual product YAML files by slug.
 * Used by ProductCarousel and other components that need product data by slug.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type ProductLink = {
  store: string
  url: string
}

export type Product = {
  name: string
  categorie: string
  prix: string
  badge?: string
  hook?: string
  image?: string
  active: boolean
  stickyCta?: string
  links?: ProductLink[]
}

const PRODUITS_DIR = path.join(process.cwd(), 'content/produits')

/**
 * Read a single product YAML file by slug.
 * Returns typed Product data or null if the file does not exist.
 */
export function getProduct(slug: string): Product | null {
  const filePath = path.join(PRODUITS_DIR, `${slug}.yaml`)
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(`---\n${raw}\n---`)
    const product = data as Product
    if (product.active === false) return null
    return product
  } catch {
    return null
  }
}

/**
 * Resolve the primary affiliate URL for a product.
 * Prefers the stickyCta store, falls back to first link.
 */
export function getPrimaryLink(product: Product): string {
  if (product.links && product.links.length > 0) {
    if (product.stickyCta) {
      const priority = product.links.find(
        (l) => l.store.toLowerCase() === product.stickyCta!.toLowerCase()
      )
      if (priority) return priority.url
    }
    return product.links[0].url
  }
  return ''
}
