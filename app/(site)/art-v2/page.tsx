/**
 * Preview variante article « presse » (identité éditoriale). noindex — supprimé à
 * l'init. Rend le 1er article réel ; message si le template est vierge.
 *
 * Cette route rendait un 404 (ancienne variante « feature », supprimée). Elle est
 * réaffectée à la variante `presse` — cf. ARTICLE_PREVIEW['art-v2'] dans lib/variants.
 *
 * `PresseStyle` est monté ICI : sur un site NON-presse, le layout ne l'injecte pas
 * et la grille .presse-article (sommaire sticky + contenu) n'existerait pas.
 */
import type { Metadata } from 'next'
import { getAllArticles, getArticleRaw, getRelatedArticles } from '@/lib/blog'
import { ArticleView } from '@/components/article/ArticleView'
import { PresseStyle } from '@/components/presse/PresseStyle'

export const metadata: Metadata = {
  title: 'Preview — Article presse',
  robots: { index: false, follow: false },
}

export default async function PreviewArtV2() {
  const first = getAllArticles()[0]
  if (!first) return <main id="main-content" className="section"><div className="wrap"><p>Aucun article : ajoutez un article pour prévisualiser.</p></div></main>
  const { meta, content } = getArticleRaw(first.categorie, first.slug)
  const related = getRelatedArticles(first.categorie, first.slug, 3)
  return (
    <>
      <PresseStyle />
      <ArticleView locale="fr" variant="presse" categorie={first.categorie} slug={first.slug} meta={meta} content={content} related={related} />
    </>
  )
}
