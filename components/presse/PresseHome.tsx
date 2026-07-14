/**
 * PresseHome — home de l'identité ÉDITORIALE (variante `presse`), portée de la
 * maquette « Éditorial Beauté & Mode ». Server Component, locale-aware.
 *
 * Structure : « la une » (1 article lead + 3 brèves), puis une SECTION PAR CATÉGORIE
 * (1 lead + 3 brèves), le « mot de la rédaction » (citation de l'auteur), et une
 * COLONNE STICKY (sélection → classement, à ne pas manquer, newsletter).
 *
 * 100 % TOKEN-DRIVEN : la maquette utilisait rose/mauve/or/terre/sauge → ce sont
 * `--accent-1..5` (les accents de catégorie). Le LAYOUT est figé, la PALETTE et la
 * TYPO restent celles du site (seedées sur le domaine) → deux sites beauté partagent
 * la structure mais pas la DA (anti-empreinte).
 */
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta } from '@/lib/blog'
import { getArticlesL, articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath, categoryAccent } from '@/niche.config'
import { tl } from '@/lib/i18n'

const SERIF = 'var(--next-font-display), Georgia, serif'

const catIndex = (slug: string) => Math.max(0, niche.categories.findIndex((c) => c.slug === slug))
const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug
const catColor = (slug: string) => categoryAccent(catIndex(slug))

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

const RULE = <span aria-hidden="true" style={{ height: 1, background: 'var(--border)' }} />

const metaStyle = {
  fontSize: 11.5,
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
} as const

export function PresseHome({ locale = niche.defaultLocale }: { locale?: string }) {
  const t = (k: string) => tl(locale, `presse.${k}`)
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)

  const articles = getArticlesL(locale)
  const lead = articles[0]
  const side = articles.slice(1, 4)
  const picks = articles.slice(0, 4)

  /** Une brève : vignette carrée + titre sérif. */
  const Brief = ({ a, thumb }: { a: ArticleMeta; thumb: number }) => (
    <Link
      href={href(a)}
      style={{
        display: 'grid',
        gridTemplateColumns: `${thumb}px 1fr`,
        gap: 14,
        color: 'inherit',
        textDecoration: 'none',
        alignItems: 'center',
      }}
    >
      <Cover a={a} ratio="1/1" sizes={`${thumb}px`} />
      <div>
        <span style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: catColor(a.categorie) }}>
          {catLabel(a.categorie)}
        </span>
        <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: thumb >= 120 ? 19 : 15.5, lineHeight: 1.2, margin: '6px 0' }}>
          {a.title}
        </h3>
        <div style={metaStyle}>{a.readingTimeMin} min</div>
      </div>
    </Link>
  )

  return (
    <main id="main-content">
      {/* ── LA UNE ─────────────────────────────────────────────── */}
      {lead && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 8px' }}>
          <div className="presse-une">
            <Link href={href(lead)} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
              <Cover a={lead} ratio="4/3" sizes="(max-width: 900px) 100vw, 60vw" />
              <div style={{ paddingTop: 18 }}>
                <Kicker slug={lead.categorie} />
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 'clamp(26px, 3.6vw, 42px)',
                    lineHeight: 1.08,
                    margin: '12px 0 10px',
                    letterSpacing: '-0.01em',
                    textWrap: 'balance',
                  }}
                >
                  {lead.title}
                </h2>
                {lead.description && (
                  <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 12px', maxWidth: '52ch' }}>
                    {lead.description}
                  </p>
                )}
                <div style={{ ...metaStyle, fontSize: 12, letterSpacing: '0.06em' }}>
                  {fmt(lead.publishedAt)} · {lead.readingTimeMin} min
                </div>
              </div>
            </Link>

            {side.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {side.map((a, i) => (
                  <div key={a.slug} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Brief a={a} thumb={120} />
                    {i < side.length - 1 && RULE}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CORPS + COLONNE ────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 60px' }}>
        <div className="presse-body">
          <div style={{ minWidth: 0 }}>
            {niche.categories.map((c, ci) => {
              const list = articles.filter((a) => a.categorie === c.slug)
              if (list.length === 0) return null
              const head = list[0]
              const rest = list.slice(1, 4)
              const color = categoryAccent(ci)

              return (
                <section
                  key={c.slug}
                  style={{ borderTop: '1px solid var(--border)', paddingTop: 26, marginTop: ci === 0 ? 24 : 40 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                    <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.label}
                    </span>
                    <span aria-hidden="true" style={{ flex: 1, height: 1, background: color, opacity: 0.55 }} />
                    <Link
                      href={lp(`/blog/${c.slug}`)}
                      style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      {t('seeAll')} →
                    </Link>
                  </div>

                  <div className="presse-cat">
                    <Link href={href(head)} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                      <Cover a={head} ratio="16/10" sizes="(max-width: 900px) 100vw, 40vw" />
                      <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 23, lineHeight: 1.16, margin: '14px 0 8px' }}>
                        {head.title}
                      </h3>
                      {head.description && (
                        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                          {head.description}
                        </p>
                      )}
                      <div style={metaStyle}>
                        {fmt(head.publishedAt)} · {head.readingTimeMin} min
                      </div>
                    </Link>

                    {rest.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {rest.map((a, i) => (
                          <div key={a.slug} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Brief a={a} thumb={82} />
                            {i < rest.length - 1 && RULE}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )
            })}

            {/* Le mot de la rédaction */}
            {niche.author?.name && (
              <section style={{ borderTop: '1px solid var(--border)', marginTop: 44, padding: '48px 8px', textAlign: 'center' }}>
                <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('editorsNote')}
                </span>
                <blockquote
                  style={{
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: 'clamp(20px, 2.8vw, 30px)',
                    lineHeight: 1.4,
                    color: 'var(--text-primary)',
                    maxWidth: '24ch',
                    margin: '18px auto 0',
                  }}
                >
                  « {niche.author.formulations?.[0] ?? niche.tagline} »
                </blockquote>
                <div style={{ marginTop: 20, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  {niche.author.name}
                  {niche.author.title ? ` · ${niche.author.title}` : ''}
                </div>
              </section>
            )}
          </div>

          {/* ── COLONNE STICKY ─────────────────────────────────── */}
          <aside className="presse-aside">
            <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md, 4px)', padding: '28px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: categoryAccent(3) }}>
                ✦ {t('selection')}
              </span>
              <h4 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 22, lineHeight: 1.22, margin: '12px 0 10px' }}>
                {t('selectionTitle')}
              </h4>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 18px' }}>
                {t('selectionDesc')}
              </p>
              <Link
                href={lp('/classement')}
                style={{
                  display: 'block',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  fontWeight: 600,
                  fontSize: 13.5,
                  letterSpacing: '0.04em',
                  padding: 13,
                  borderRadius: 'var(--radius-sm, 3px)',
                  textDecoration: 'none',
                }}
              >
                {t('selectionCta')} →
              </Link>
            </div>

            {picks.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    borderBottom: '2px solid var(--text-primary)',
                    paddingBottom: 10,
                    marginBottom: 18,
                  }}
                >
                  {t('picks')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {picks.map((a, i) => (
                    <div key={a.slug} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <Link
                        href={href(a)}
                        style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, color: 'inherit', textDecoration: 'none', alignItems: 'start' }}
                      >
                        <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: categoryAccent(i), lineHeight: 1 }}>
                          {i + 1}
                        </span>
                        <div>
                          <h4 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, lineHeight: 1.24, margin: '0 0 4px' }}>
                            {a.title}
                          </h4>
                          <div style={{ ...metaStyle, fontSize: 11 }}>{fmt(a.publishedAt)}</div>
                        </div>
                      </Link>
                      {i < picks.length - 1 && RULE}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md, 4px)', padding: '26px 22px' }}>
              <h4 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 20, lineHeight: 1.2, margin: '0 0 8px' }}>
                {t('letterTitle')}
              </h4>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                {t('letterDesc')}
              </p>
              <form style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="email"
                  required
                  aria-label="Email"
                  placeholder={tl(locale, 'home.emailPlaceholder')}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm, 3px)',
                    padding: '11px 12px',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-surface)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent-1)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm, 3px)',
                    padding: 12,
                    fontSize: 13.5,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {tl(locale, 'home.subscribe')}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
