/**
 * EN preview — Article « presse » (editorial identity). noindex — removed at site init.
 * Previously a 404 (the old « feature » variant was removed) — now mapped to the
 * `presse` variant, cf. ARTICLE_PREVIEW['art-v2'] in lib/variants.
 *
 * `PresseStyle` is mounted here: on a NON-presse site the layout does not inject it,
 * so the .presse-article grid (sticky TOC + content) would not exist.
 */
import type { Metadata } from 'next'
import { getAllArticlesEn, getArticleRawEn, getRelatedArticlesEn } from '@/lib/blog'
import { ArticleView } from '@/components/article/ArticleView'
import { PresseStyle } from '@/components/presse/PresseStyle'

export const metadata: Metadata = {
  title: 'Preview — Article presse (EN)',
  robots: { index: false, follow: false },
}

export default async function PreviewArtV2En() {
  const first = getAllArticlesEn()[0]
  if (!first) return <main id="main-content" className="section"><div className="wrap"><p>No article yet: add one to preview.</p></div></main>
  const { meta, content } = getArticleRawEn(first.categorie, first.slug)
  const related = getRelatedArticlesEn(first.categorie, first.slug, 3)
  return (
    <>
      <PresseStyle />
      <ArticleView locale="en" variant="presse" categorie={first.categorie} slug={first.slug} meta={meta} content={content} related={related} />
    </>
  )
}
