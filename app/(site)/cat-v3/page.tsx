/**
 * Preview variante catégorie « presse » (identité éditoriale). noindex — supprimé
 * à l'init. Rend la 1re catégorie peuplée ; message si le template est vierge.
 *
 * `PresseStyle` est monté ICI : sur un site NON-presse, le layout ne l'injecte pas
 * et les grilles (.presse-grid3, .presse-lead, .presse-themes) n'existeraient pas.
 */
import type { Metadata } from 'next'
import { getAllArticles, getCategories } from '@/lib/blog'
import { CategoryView } from '@/components/category/CategoryView'
import { PresseStyle } from '@/components/presse/PresseStyle'

export const metadata: Metadata = {
  title: 'Preview — Catégorie presse',
  robots: { index: false, follow: false },
}

export default function PreviewCatV3() {
  const categories = getCategories()
  const first = categories[0]
  if (!first) return <main id="main-content" className="section"><div className="wrap"><p>Aucune catégorie peuplée : ajoutez des articles pour prévisualiser.</p></div></main>
  const all = getAllArticles().filter((a) => a.categorie === first.slug)
  return (
    <>
      <PresseStyle />
      <CategoryView locale="fr" variant="presse" categorie={first.slug} articles={all} categories={categories} currentPage={1} />
    </>
  )
}
