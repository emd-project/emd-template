/**
 * PresseBlogHub — hub `/blog` de l'identité ÉDITORIALE (variante `presse`).
 * Server Component, locale-aware. Même grammaire visuelle que PresseHome :
 * sérif pour les titres, filets, pastilles de catégorie, 100 % token-driven.
 *
 * Structure : fil d'Ariane centré → eyebrow + H1 + sous-titre + compteur →
 * chips de catégories → « À la une » (1er article) → « Tous les articles »
 * (grille 3 colonnes + pagination) → bandeau « Explorer nos guides » (par thème).
 *
 * Aucune couleur en dur : les 5 couleurs de catégorie sont `--accent-1..5`
 * (via `categoryAccent(i)`), le reste vient des tokens de surface/texte/bordure.
 */
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta } from '@/lib/blog'
import { articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath, categoryAccent } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { Pagination } from '@/components/blog/Pagination'

const SERIF = 'var(--next-font-display), Georgia, serif'
const ARTICLES_PER_PAGE = 9

const catIndex = (slug: string) => Math.max(0, niche.categories.findIndex((c) => c.slug === slug))
const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug
const catColor = (slug: string) => categoryAccent(catIndex(slug))

const metaStyle = {
  fontSize: 11.5,
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
} as const

/** Couverture : vraie image si dispo, sinon aplat teinté par l'accent de la catégorie. */
function Cover({ a, ratio, sizes }: { a: ArticleMeta; ratio: string; sizes: string }) {
  const tint = catColor(a.categorie)
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: ratio,
        borderRadius: 'var(--radius-sm, 3px)',
        overflow: 'hidden',
        background: `linear-gradient(135deg, color-mix(in srgb, ${tint} 34%, var(--bg-surface-2)), color-mix(in srgb, ${tint} 62%, var(--bg-surface-2)))`,
      }}
    >
      {a.featureImage && (
        <Image src={a.featureImage} alt={a.title} fill sizes={sizes} style={{ objectFit: 'cover' }} />
      )}
    </div>
  )
}

function Kicker({ slug }: { slug: string }) {
  const color = catColor(slug)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 700,
        color,
      }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {catLabel(slug)}
    </span>
  )
}

export function PresseBlogHub({
  locale = niche.defaultLocale,
  articles,
  categories,
  currentPage = 1,
}: {
  locale?: string
  articles: ArticleMeta[]
  categories: { slug: string; label: string; count: number }[]
  currentPage?: number
}) {
  const t = (k: string, vars?: Record<string, string | number>) => tl(locale, `presse.${k}`, vars)
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)

  const [featured, ...rest] = articles
  const showFeatured = Boolean(featured) && currentPage === 1
  const pool = showFeatured ? rest : articles
  const totalPages = Math.ceil(pool.length / ARTICLES_PER_PAGE)
  const paged = pool.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  const chip = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    border: '1px solid var(--border)',
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    background: 'transparent',
    whiteSpace: 'nowrap',
  } as const

  return (
    <main id="main-content">
      {/* ── En-tête ─────────────────────────────────────────────── */}
      <header style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px 0', textAlign: 'center' }}>
        <nav
          aria-label={tl(locale, 'nav.mainNav')}
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
        >
          <Link href={lp('/')} style={{ color: 'inherit', textDecoration: 'none' }}>
            {tl(locale, 'article.home')}
          </Link>
          <span aria-hidden="true" style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{t('magazine')}</span>
        </nav>

        <div style={{ marginTop: 22, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-1)' }}>
          ✦ {niche.siteName}
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 'clamp(32px, 5vw, 60px)',
            lineHeight: 1.06,
            letterSpacing: '-0.01em',
            margin: '14px 0 0',
            textWrap: 'balance',
          }}
        >
          {t('magazine')}
        </h1>

        {niche.subtitle && (
          <p style={{ margin: '16px auto 0', maxWidth: '58ch', fontSize: 16, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
            {niche.subtitle}
          </p>
        )}

        <div style={{ ...metaStyle, marginTop: 16, fontSize: 12, letterSpacing: '0.1em' }}>
          {articles.length} {t('articles')}
        </div>
      </header>

      {/* ── Chips catégories ────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          <span style={{ ...chip, background: 'var(--text-primary)', color: 'var(--bg-primary)', borderColor: 'var(--text-primary)' }}>
            {t('all')}
          </span>
          {categories.map(({ slug, label }) => (
            <Link key={slug} href={lp(`/blog/${slug}`)} style={chip}>
              <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: catColor(slug) }} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── À la une ────────────────────────────────────────────── */}
      {showFeatured && featured && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px 0' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: 18,
            }}
          >
            {t('featured')}
          </div>
          <Link href={href(featured)} className="presse-lead" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Cover a={featured} ratio="3/2" sizes="(max-width: 900px) 100vw, 55vw" />
            <div>
              <Kicker slug={featured.categorie} />
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 'clamp(24px, 3.2vw, 38px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  margin: '12px 0 12px',
                  textWrap: 'balance',
                }}
              >
                {featured.title}
              </h2>
              {featured.description && (
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 14px', maxWidth: '52ch' }}>
                  {featured.description}
                </p>
              )}
              <div style={{ ...metaStyle, fontSize: 12, letterSpacing: '0.06em' }}>
                {niche.author.name ? `${niche.author.name} · ` : ''}
                {fmt(featured.publishedAt)} · {featured.readingTimeMin} min
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Tous les articles ───────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 64px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 16,
            borderBottom: '2px solid var(--text-primary)',
            paddingBottom: 12,
            marginBottom: 34,
          }}
        >
          <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(20px, 2.4vw, 28px)', margin: 0 }}>
            {t('allArticles')}
          </h2>
          <span style={{ ...metaStyle, fontSize: 11.5 }}>
            {articles.length} {t('articles')}
          </span>
        </div>

        <div className="presse-grid3">
          {paged.map((a) => (
            <Link key={`${a.categorie}/${a.slug}`} href={href(a)} style={{ color: 'inherit', textDecoration: 'none' }}>
              <Cover a={a} ratio="16/11" sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 360px" />
              <div style={{ paddingTop: 14 }}>
                <Kicker slug={a.categorie} />
                <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 19, lineHeight: 1.22, margin: '8px 0 8px' }}>
                  {a.title}
                </h3>
                <div style={metaStyle}>
                  {fmt(a.publishedAt)} · {a.readingTimeMin} min
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={lp('/blog')} locale={locale} />
          </div>
        )}
      </section>

      {/* ── Explorer nos guides ─────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ background: 'var(--bg-surface-2)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 38 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('byTheme')}
              </span>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 'clamp(24px, 3.4vw, 38px)',
                  lineHeight: 1.12,
                  margin: '14px 0 0',
                }}
              >
                {t('exploreThemes')}
              </h2>
            </div>

            <div className="presse-themes">
              {categories.map(({ slug, label, count }) => {
                const color = catColor(slug)
                return (
                  <Link
                    key={slug}
                    href={lp(`/blog/${slug}`)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                      textAlign: 'center',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md, 4px)',
                      padding: '26px 16px',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: `color-mix(in srgb, ${color} 16%, transparent)`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
                    </span>
                    <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 17, lineHeight: 1.2 }}>{label}</span>
                    <span style={{ ...metaStyle, fontSize: 11 }}>
                      {count} {t('articles')}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
