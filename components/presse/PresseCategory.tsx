/**
 * PresseCategory — page `/blog/{categorie}` de l'identité ÉDITORIALE (`presse`).
 * Server Component, locale-aware. Signature alignée sur `CategoryView` (mêmes props,
 * même pagination) : c'est `CategoryView` qui délègue ici quand la variante vaut
 * `presse`.
 *
 * Structure : fil d'Ariane centré → eyebrow « Catégorie » + H1 sérif + description +
 * compteur → chips (la catégorie courante active, teintée de son accent) →
 * « Le guide du mois » (1er article) → « Articles {label} » (grille 3 col + pagination).
 *
 * 100 % token-driven — l'accent de la catégorie vient de `categoryAccent(index)`.
 */
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta } from '@/lib/blog'
import { articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath, categoryAccent } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { Pagination } from '@/components/blog/Pagination'

const SERIF = 'var(--next-font-display), Georgia, serif'
const ARTICLES_PER_PAGE = 12

const catIndex = (slug: string) => Math.max(0, niche.categories.findIndex((c) => c.slug === slug))
const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug
const catColor = (slug: string) => categoryAccent(catIndex(slug))
const catDescription = (slug: string) => niche.categories.find((c) => c.slug === slug)?.description

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

export function PresseCategory({
  locale = niche.defaultLocale,
  categorie,
  articles,
  categories,
  currentPage = 1,
}: {
  locale?: string
  categorie: string
  articles: ArticleMeta[]
  categories: { slug: string; label: string; count: number }[]
  currentPage?: number
}) {
  const t = (k: string, vars?: Record<string, string | number>) => tl(locale, `presse.${k}`, vars)
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)

  const label = catLabel(categorie)
  const color = catColor(categorie)
  const description = catDescription(categorie)

  const total = articles.length
  const [lead, ...rest] = articles
  const showLead = Boolean(lead) && currentPage === 1
  const pool = showLead ? rest : articles
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
          <Link href={lp('/blog')} style={{ color: 'inherit', textDecoration: 'none' }}>
            {t('magazine')}
          </Link>
          <span aria-hidden="true" style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </nav>

        <div
          style={{
            marginTop: 22,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color,
          }}
        >
          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
          {t('category')}
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 'clamp(36px, 6vw, 68px)',
            lineHeight: 1.04,
            letterSpacing: '-0.015em',
            margin: '14px 0 0',
            textWrap: 'balance',
          }}
        >
          {label}
        </h1>

        {description && (
          <p style={{ margin: '16px auto 0', maxWidth: '58ch', fontSize: 16, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}

        <div style={{ ...metaStyle, marginTop: 16, fontSize: 12, letterSpacing: '0.1em' }}>
          {total} {t('articles')}
        </div>
      </header>

      {/* ── Chips catégories ────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          <Link href={lp('/blog')} style={chip}>
            {t('all')}
          </Link>
          {categories.map(({ slug, label: lbl }) => {
            const on = slug === categorie
            const c = catColor(slug)
            return (
              <Link
                key={slug}
                href={lp(`/blog/${slug}`)}
                aria-current={on ? 'page' : undefined}
                style={
                  on
                    ? { ...chip, background: c, borderColor: c, color: 'var(--bg-primary)' }
                    : chip
                }
              >
                {!on && <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />}
                {lbl}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Le guide du mois ────────────────────────────────────── */}
      {showLead && lead && (
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
            {t('guideOfMonth')}
          </div>
          <Link href={href(lead)} className="presse-lead" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Cover a={lead} ratio="3/2" sizes="(max-width: 900px) 100vw, 55vw" />
            <div>
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
                {label}
              </span>
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
                {lead.title}
              </h2>
              {lead.description && (
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 14px', maxWidth: '52ch' }}>
                  {lead.description}
                </p>
              )}
              <div style={{ ...metaStyle, fontSize: 12, letterSpacing: '0.06em' }}>
                {niche.author.name ? `${niche.author.name} · ` : ''}
                {fmt(lead.publishedAt)} · {lead.readingTimeMin} min
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Articles de la catégorie ────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 72px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 16,
            borderBottom: `2px solid ${color}`,
            paddingBottom: 12,
            marginBottom: 34,
          }}
        >
          <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(20px, 2.4vw, 28px)', margin: 0 }}>
            {t('articlesIn', { label })}
          </h2>
          <span style={{ ...metaStyle, fontSize: 11.5 }}>
            {total} {t('articles')}
          </span>
        </div>

        <div className="presse-grid3">
          {paged.map((a) => (
            <Link key={`${a.categorie}/${a.slug}`} href={href(a)} style={{ color: 'inherit', textDecoration: 'none' }}>
              <Cover a={a} ratio="16/11" sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 360px" />
              <div style={{ paddingTop: 14 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: catColor(a.categorie),
                  }}
                >
                  <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: catColor(a.categorie) }} />
                  {catLabel(a.categorie)}
                </span>
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={lp(`/blog/${categorie}`)}
              locale={locale}
            />
          </div>
        )}
      </section>
    </main>
  )
}
