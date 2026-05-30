import { HeroSection } from '@/components/home/HeroSection'
import { ArticleTicker } from '@/components/home/ArticleTicker'
import { DealsStrip } from '@/components/home/DealsStrip'
import { RecentArticles } from '@/components/home/RecentArticles'
import { CategorySection } from '@/components/home/CategorySection'
import { FeaturedTools } from '@/components/home/FeaturedTools'
import { AuthorTeaser } from '@/components/home/AuthorTeaser'
import { niche } from '@/niche.config'

/* ── Section registry ─────────────────────────────────────────── */

function CategoriesSection() {
  return (
    <>
      {niche.categories.map((cat, i) => (
        <CategorySection key={cat.slug} slug={cat.slug} label={cat.label} index={i} />
      ))}
    </>
  )
}

const SECTION_MAP: Record<string, React.ComponentType> = {
  ticker: ArticleTicker,
  deals: DealsStrip,
  articles: RecentArticles,
  categories: CategoriesSection,
  tools: FeaturedTools,
  author: AuthorTeaser,
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      {niche.homeSections.map((key) => {
        const Section = SECTION_MAP[key]
        return Section ? <Section key={key} /> : null
      })}
    </main>
  )
}
