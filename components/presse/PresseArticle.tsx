/**
 * PresseArticle — mise en page ARTICLE de l'identité ÉDITORIALE (`presse`).
 *
 * ⚠️ Ce composant NE COMPILE PAS le MDX : `ArticleView` reste la seule et unique
 * source de compilation (mêmes composants MDX, même TOC, même JSON-LD, même
 * StickyCTA). PresseArticle est une pure ENVELOPPE DE MISE EN PAGE qui reçoit le
 * contenu déjà rendu (`mdxContent`) et les items de sommaire (`toc`).
 *
 * Structure : hero pleine largeur teinté par l'accent de la catégorie (fil d'Ariane,
 * badge, H1 sérif, ligne auteur) → corps 1080px : sommaire sticky (H2) + colonne de
 * contenu (« En bref » si `aiSummary`, MDX, FAQ si `faq`, « Continuer la lecture »,
 * carte auteur).
 *
 * ZÉRO donnée inventée : chaque bloc n'existe que si le frontmatter le fournit.
 * ZÉRO hex : accents = `--accent-1..5`, surfaces/textes/filets = tokens.
 */
import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { type ArticleMeta } from '@/lib/blog'
import { articleHrefL, formatDateL } from '@/lib/blog-l10n'
import type { TocItem } from '@/lib/utils/headings'
import { niche, localePath, categoryAccent } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { AutoProductCTAs } from '@/components/blog/AutoProductCTAs'
import { ToolCTA } from '@/components/blog/ToolCTA'
import { getCTAsForCategory } from '@/lib/article-ctas'

const SERIF = 'var(--next-font-display), Georgia, serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

const catIndex = (slug: string) => Math.max(0, niche.categories.findIndex((c) => c.slug === slug))
const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug
const catColor = (slug: string) => categoryAccent(catIndex(slug))

const metaStyle = {
  fontSize: 11.5,
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
} as const

/** Avatar de l'auteur : aplat dégradé teinté + initiale (le template n'a pas de photo d'auteur). */
function Avatar({ name, tint, size }: { name: string; tint: string; size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, color-mix(in srgb, ${tint} 30%, var(--bg-surface-2)), color-mix(in srgb, ${tint} 70%, var(--bg-surface-2)))`,
        color: 'var(--text-primary)',
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: Math.round(size * 0.42),
        lineHeight: 1,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function PresseArticle({
  locale = niche.defaultLocale,
  categorie,
  meta,
  related,
  mdxContent,
  toc,
}: {
  locale?: string
  categorie: string
  meta: ArticleMeta
  related: ArticleMeta[]
  mdxContent: ReactNode
  toc: TocItem[]
}) {
  const t = (k: string, vars?: Record<string, string | number>) => tl(locale, `presse.${k}`, vars)
  const lp = (p: string) => localePath(locale, p)
  const fmt = (iso: string) => formatDateL(locale, iso)

  const label = catLabel(categorie)
  const tint = catColor(categorie)

  const authorName = niche.author.name
  const firstName = authorName ? authorName.split(' ')[0] : ''

  const headings = toc.filter((i) => i.level === 2)
  const keepReading = related.slice(0, 3)

  return (
    <main id="main-content">
      <article>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <header
          style={{
            borderBottom: '1px solid var(--border)',
            background: `linear-gradient(180deg, color-mix(in srgb, ${tint} 16%, var(--bg-primary)), var(--bg-primary))`,
          }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '46px 24px 42px', textAlign: 'center' }}>
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
              <Link href={lp(`/blog/${categorie}`)} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {label}
              </Link>
            </nav>

            <div style={{ marginTop: 20 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: `color-mix(in srgb, ${tint} 18%, var(--bg-surface))`,
                  color: tint,
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: tint }} />
                {label}
              </span>
            </div>

            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 'clamp(30px, 5vw, 50px)',
                lineHeight: 1.08,
                letterSpacing: '-0.015em',
                margin: '18px 0 0',
                textWrap: 'balance',
              }}
            >
              {meta.title}
            </h1>

            {meta.description && (
              <p style={{ margin: '16px auto 0', maxWidth: '56ch', fontSize: 16.5, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                {meta.description}
              </p>
            )}

            {authorName && (
              <div
                style={{
                  marginTop: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  textAlign: 'left',
                }}
              >
                <Avatar name={authorName} tint={tint} size={42} />
                <div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.3, color: 'var(--text-primary)' }}>
                    <strong style={{ fontWeight: 700 }}>{firstName}</strong>
                    {niche.author.title ? <span style={{ color: 'var(--text-secondary)' }}> · {niche.author.title}</span> : null}
                  </div>
                  <div style={{ ...metaStyle, fontSize: 11, marginTop: 3 }}>
                    <time dateTime={meta.publishedAt}>{fmt(meta.publishedAt)}</time> · {meta.readingTimeMin} min
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Corps ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 24px 72px' }}>
          <div className="presse-article">
            {/* Sommaire sticky */}
            {headings.length > 0 ? (
              <aside className="presse-toc">
                <nav
                  aria-label={t('toc')}
                  style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      marginBottom: 14,
                    }}
                  >
                    {t('toc')}
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          style={{
                            fontSize: 13,
                            lineHeight: 1.45,
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                          }}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            ) : (
              <span aria-hidden="true" />
            )}

            {/* Colonne de contenu */}
            <div style={{ minWidth: 0 }}>
              {/* En bref (uniquement si le frontmatter fournit un aiSummary) */}
              {meta.aiSummary && meta.aiSummary.length > 0 && (
                <section
                  id="en-bref"
                  style={{
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md, 4px)',
                    padding: '24px 26px',
                    marginBottom: 34,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: tint,
                      marginBottom: 12,
                    }}
                  >
                    {t('inBrief')}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {meta.aiSummary.map((p, i) => (
                      <li key={i} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Contenu MDX (compilé par ArticleView — mêmes composants) */}
              <div className="prose-article">{mdxContent}</div>

              <AutoProductCTAs ctas={getCTAsForCategory(categorie)} locale={locale} />
              <ToolCTA categorie={categorie} locale={locale} />

              {/* FAQ (uniquement si le frontmatter en porte une) */}
              {meta.faq && meta.faq.length > 0 && (
                <section id="faq-section" aria-labelledby="presse-faq-title" style={{ marginTop: 52 }}>
                  <h2
                    id="presse-faq-title"
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 700,
                      fontSize: 'clamp(22px, 3vw, 30px)',
                      lineHeight: 1.15,
                      margin: '0 0 18px',
                    }}
                  >
                    {t('faq')}
                  </h2>
                  {meta.faq.map(({ q, a }, i) => (
                    <details
                      key={i}
                      style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}
                    >
                      <summary
                        style={{
                          fontFamily: SERIF,
                          fontWeight: 600,
                          fontSize: 17,
                          lineHeight: 1.35,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          listStyle: 'none',
                        }}
                      >
                        {q}
                      </summary>
                      <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{a}</p>
                    </details>
                  ))}
                </section>
              )}

              {/* Continuer la lecture */}
              {keepReading.length > 0 && (
                <section id="related-section" style={{ marginTop: 56 }}>
                  <h2
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 600,
                      fontSize: 'clamp(20px, 2.4vw, 26px)',
                      margin: '0 0 8px',
                      borderBottom: '2px solid var(--text-primary)',
                      paddingBottom: 12,
                    }}
                  >
                    {t('keepReading')}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {keepReading.map((a, i) => (
                      <Link
                        key={`${a.categorie}/${a.slug}`}
                        href={articleHrefL(locale, a)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto',
                          alignItems: 'center',
                          gap: 18,
                          padding: '18px 0',
                          borderBottom: '1px solid var(--border)',
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: catColor(a.categorie) }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>
                          <span
                            style={{
                              display: 'block',
                              fontFamily: SERIF,
                              fontWeight: 600,
                              fontSize: 18,
                              lineHeight: 1.25,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {a.title}
                          </span>
                          <span style={{ ...metaStyle, display: 'block', marginTop: 5 }}>
                            {catLabel(a.categorie)} · {a.readingTimeMin} min
                          </span>
                        </span>
                        <span aria-hidden="true" style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Carte auteur */}
              {authorName && (
                <section
                  style={{
                    marginTop: 56,
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md, 4px)',
                    padding: '28px 26px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 18,
                  }}
                >
                  <Avatar name={authorName} tint={tint} size={56} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...metaStyle, fontSize: 10.5, letterSpacing: '0.16em' }}>{t('writtenBy')}</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.2, margin: '6px 0 4px' }}>
                      {firstName}
                    </div>
                    {niche.author.title && (
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{niche.author.title}</div>
                    )}
                    {niche.author.bio && (
                      <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                        {niche.author.bio}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}
