/**
 * CategoryView — listing catégorie LOCALE-AWARE + multi-variantes (Server Component).
 * Une seule implémentation pour FR et EN (prop `locale`) et pour les 2 variantes :
 *  - 'classic'   : hub-hero + barre de filtres + grille .posts (comportement historique)
 *  - 'editorial' : une-à-la-une (carte vedette) + grille du reste
 * Le SEO (metadata, JSON-LD, generateStaticParams) reste dans les routes ; ce
 * composant ne rend que le corps. Pagination identique aux deux variantes.
 */
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta, CATEGORY_LABELS } from '@/lib/blog'
import { articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { Pagination } from '@/components/blog/Pagination'
import { resolveCategoryVariant, type CategoryVariant } from '@/lib/variants'

const ARTICLES_PER_PAGE = 12

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) => CATEGORY_LABELS[slug] ?? slug

/** Mots spécifiques catégorie (locale-aware, sans clé JSON dédiée). */
const WORDS: Record<'fr' | 'en', { kicker: string; article: string; articles: string }> = {
  fr: { kicker: 'Catégorie', article: 'article', articles: 'articles' },
  en: { kicker: 'Category', article: 'article', articles: 'articles' },
}

function Cover({ a, fill = false }: { a: ArticleMeta; fill?: boolean }) {
  if (a.featureImage) {
    return <Image src={a.featureImage} alt={a.title} fill sizes={fill ? '(max-width:900px) 100vw, 70vw' : '(max-width:900px) 100vw, 33vw'} style={{ objectFit: 'cover' }} />
  }
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

export function CategoryView({
  locale = niche.defaultLocale,
  variant,
  categorie,
  articles,
  categories,
  currentPage,
}: {
  locale?: string
  variant?: CategoryVariant
  categorie: string
  articles: ArticleMeta[]
  categories: { slug: string; label: string; count: number }[]
  currentPage: number
}) {
  const v = variant ?? resolveCategoryVariant()
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)
  const w = WORDS[locale === 'en' ? 'en' : 'fr']
  const label = catLabel(categorie)

  const total = articles.length
  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE)
  const paged = articles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  const editorial = v === 'editorial'
  const lead = editorial && currentPage === 1 ? paged[0] : null
  const grid = lead ? paged.slice(1) : paged

  const countLabel = `${total} ${total > 1 ? w.articles : w.article}`

  return (
    <main id="main-content">
      <header className="hub-hero">
        <span className="glow" aria-hidden="true" />
        <div className="wrap">
          <nav className="crumb" aria-label={tl(locale, 'nav.mainNav')}>
            <Link href={lp('/')}>{tl(locale, 'article.home')}</Link><span className="sep">/</span>
            <Link href={lp('/blog')}>{tl(locale, 'nav.blog')}</Link><span className="sep">/</span><span className="cur">{label}</span>
          </nav>
          <span className="kicker"><span className={`tag ${catClass(categorie)}`} style={{ padding: '3px 10px' }}><span className="pip" />{w.kicker}</span></span>
          <h1>{label}</h1>
          <div className="meta"><span>{countLabel}</span></div>
        </div>
      </header>

      <div className="filter-bar">
        <div className="wrap">
          <Link href={lp('/blog')} className="chip">{tl(locale, 'blog.filterAll')}</Link>
          {categories.map(({ slug, label: lbl }) => (
            <Link key={slug} href={lp(`/blog/${slug}`)} className={`chip${slug === categorie ? ' on' : ''}`}>
              <span className="pip" style={{ background: `var(--cat-${CAT_INDEX[slug] ?? 1})` }} />{lbl}
            </Link>
          ))}
        </div>
      </div>

      {lead && (
        <section className="mag-hero">
          <div className="wrap">
            <Link href={href(lead)} className="mcard feat-big" style={{ display: 'block' }}>
              <Cover a={lead} fill />
              <div className="mc-body">
                <span className="mc-flag"><span className={`tag ${catClass(lead.categorie)}`}><span className="pip" />{label}</span></span>
                <h2>{lead.title}</h2>
                {lead.description && <p>{lead.description}</p>}
                <div className="mc-meta">{fmt(lead.publishedAt)} · {lead.readingTimeMin} min</div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: lead ? 24 : 48 }}>
        <div className="wrap">
          <div className="posts">
            {grid.map((a) => (
              <Link key={a.slug} href={href(a)} className="post">
                <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                <div className="post-body">
                  <h3>{a.title}</h3>
                  {a.description && <p>{a.description}</p>}
                  <div className="post-meta">{fmt(a.publishedAt)} · {a.readingTimeMin} min</div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={lp(`/blog/${categorie}`)} locale={locale} />
          </div>
        </div>
      </section>
    </main>
  )
}
