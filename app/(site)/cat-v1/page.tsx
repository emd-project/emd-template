/**
 * Preview variante catégorie « classic » (hub-hero + grille). noindex — supprimé
 * à l'init. Rend la 1re catégorie peuplée ; message si le template est vierge.
 */
import type { Metadata } from 'next'
import { getAllArticles, getCategories } from '@/lib/blog'
import { CategoryView } from '@/components/category/CategoryView'

export const metadata: Metadata = {
  title: 'Preview — Catégorie classic',
  robots: { index: false, follow: false },
}

export default function PreviewCatV1() {
  const categories = getCategories()
  const first = categories[0]
  if (!first) return <main id="main-content" className="section"><div className="wrap"><p>Aucune catégorie peuplée : ajoutez des articles pour prévisualiser.</p></div></main>
  const all = getAllArticles().filter((a) => a.categorie === first.slug)
  return <CategoryView locale="fr" variant="classic" categorie={first.slug} articles={all} categories={categories} currentPage={1} />
}
