/**
 * Preview variante article « feature » (immersif). noindex — supprimé à l'init.
 * Rend le 1er article réel ; message si le template est vierge.
 */
import type { Metadata } from 'next'
import { getAllArticles, getArticleRaw, getRelatedArticles } from '@/lib/blog'
import { ArticleView } from '@/components/article/ArticleView'

export const metadata: Metadata = {
  title: 'Preview — Article feature',
  robots: { index: false, follow: false },
}

export default async function PreviewArtV2() {
  const first = getAllArticles()[0]
  if (!first) return <main id="main-content" className="section"><div className="wrap"><p>Aucun article : ajoutez un article pour prévisualiser.</p></div></main>
  const { meta, content } = getArticleRaw(first.categorie, first.slug)
  const related = getRelatedArticles(first.categorie, first.slug, 3)
  return <ArticleView locale="fr" variant="feature" categorie={first.categorie} slug={first.slug} meta={meta} content={content} related={related} />
}
