/**
 * ArticleMasonry — grille masonry CSS columns.
 * Server Component. Zéro JS.
 */
import type { ArticleMeta } from '@/lib/blog'
import { ArticleCard } from '@/components/blog/ArticleCard'

type Props = {
  articles: ArticleMeta[]
  showCategory?: boolean
}

export function ArticleMasonry({ articles, showCategory = false }: Props) {
  if (articles.length === 0) return null

  return (
    <div className="article-masonry" role="list">
      {articles.map((article) => (
        <div
          key={`${article.categorie}/${article.slug}`}
          className="masonry-item"
          role="listitem"
        >
          <ArticleCard article={article} showCategory={showCategory} />
        </div>
      ))}
    </div>
  )
}
