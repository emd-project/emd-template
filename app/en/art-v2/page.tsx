/** EN preview — Article feature. noindex — removed at site init. */
import type { Metadata } from 'next'
import { getAllArticlesEn, getArticleRawEn, getRelatedArticlesEn } from '@/lib/blog'
import { ArticleView } from '@/components/article/ArticleView'

export const metadata: Metadata = {
  title: 'Preview — Article feature (EN)',
  robots: { index: false, follow: false },
}

export default async function PreviewArtV2En() {
  const first = getAllArticlesEn()[0]
  if (!first) return <main id="main-content" className="section"><div className="wrap"><p>No article yet: add one to preview.</p></div></main>
  const { meta, content } = getArticleRawEn(first.categorie, first.slug)
  const related = getRelatedArticlesEn(first.categorie, first.slug, 3)
  return <ArticleView locale="en" variant="feature" categorie={first.categorie} slug={first.slug} meta={meta} content={content} related={related} />
}
