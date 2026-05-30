/**
 * ArticleGrid — grille 3×2 d'articles pour les sections home.
 * Remplace le carousel horizontal. Server Component.
 */
import type { ArticleMeta } from '@/lib/blog'
import { ArticleCard } from '@/components/blog/ArticleCard'

type Props = {
  articles: ArticleMeta[]
  showCategory?: boolean
}

export function ArticleCarousel({ articles, showCategory = false }: Props) {
  if (articles.length === 0) return null

  const displayed = articles.slice(0, 6)

  return (
    <div className="article-grid" role="list" aria-label="Articles">
      {displayed.map((article, i) => (
        <div
          key={`${article.categorie}/${article.slug}`}
          role="listitem"
        >
          <ArticleCard article={article} showCategory={showCategory} index={i} />
        </div>
      ))}
    </div>
  )
}
