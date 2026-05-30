/**
 * CategorySection — section home générique pour une catégorie.
 * Layout : carousel articles + sidebar produits.
 * Server Component.
 */
import Link from 'next/link'
import Balancer from 'react-wrap-balancer'
import { getAllArticles } from '@/lib/blog'
import { ArticleCarousel } from './ArticleCarousel'
import { categoryAccent } from '@/niche.config'
import { FadeIn } from '@/components/motion/FadeIn'
import { t } from '@/lib/i18n'

type CategorySectionProps = {
  slug: string
  label: string
  index: number
}

export function CategorySection({ slug, label, index }: CategorySectionProps) {
  const accent = categoryAccent(index)
  const articles = getAllArticles().filter((a) => a.categorie === slug).slice(0, 6)

  return (
    <section style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-16) 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 var(--space-6)' }}>

        {/* Header — fade-in au scroll */}
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, display: 'block', marginBottom: 'var(--space-2)' }}>
                {label}
              </span>
              <h2 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, margin: 0 }}>
                <Balancer>{t('categorySection.guidesAndTests', { label: label.toLowerCase() })}</Balancer>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={`/comparer/${slug}`} style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textDecoration: 'none', background: accent, borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-4)', whiteSpace: 'nowrap' }}>
                {t('categorySection.compare')}
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Content — fade-in léger décalé */}
        <FadeIn delay={120}>
          {articles.length > 0 ? (
            <ArticleCarousel articles={articles} />
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('categorySection.inProgress', { label: label.toLowerCase() })}</p>
          )}

          <Link href={`/blog/${slug}`} style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', textAlign: 'center', paddingTop: 'var(--space-4)' }}>
            {t('categorySection.viewAll', { label: label.toLowerCase() })}
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
