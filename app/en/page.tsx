/**
 * /en — English home, mirror of app/(site)/page.tsx.
 *
 * Same niche-driven dispatch as the FR home (niche.style.hero === 'split'
 * → comparator archetype ; otherwise → magazine archetype). Both archetypes
 * are ported here as local EN variants rather than reusing the FR components
 * (MagazineHome/ComparateurHome) because those render French copy in hard
 * (and use getAllArticles() / articleHref() / formatDate(), all FR).
 *
 * i18n (block 2c) :
 *  - Reads the EN mirror via getAllArticlesEn() (not the FR getAllArticles()).
 *  - Internal hrefs are built under /en/blog (articleHref() emits FR /blog paths).
 *  - Copy is written in English inline (t() is locked to niche.defaultLocale = fr,
 *    so it cannot localise EN strings — same convention as /en/blog & /en/legal-notice).
 *  - Dates formatted en-GB (formatDate() in lib/blog is fr-FR only).
 *  - LangSwitch is NOT mounted here (block 4).
 *
 * Sections NOT ported (too coupled to FR / out of scope for a clean EN build):
 *  - The "How it works" / stats / "Compare" CTAs of the comparator archetype point
 *    to FR-only tool routes (/comparer, /quiz, /simulateur — no /en/* mirror yet).
 *    Their copy is localised in English but the hrefs intentionally remain the
 *    existing FR routes (no dead /en/* links are emitted).
 */
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getAllArticlesEn, type ArticleMeta } from '@/lib/blog'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 3600

/* slug catégorie → classe badge générique c1..c5 (couleur auto) */
const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) =>
  niche.categories.find((c) => c.slug === slug)?.label ?? slug

/** EN date formatting (formatDate() in lib/blog is fr-FR only). */
const formatDateEn = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** EN article href (articleHref() emits FR /blog/... paths). */
const articleHrefEn = (a: ArticleMeta) => `/en/blog/${a.categorie}/${a.slug}`

export function generateMetadata(): Metadata {
  return {
    title: `${niche.siteName} | ${niche.tagline}`,
    description: niche.subtitle,
    alternates: {
      canonical: `${SITE_URL}/en`,
      languages: {
        fr: `${SITE_URL}/`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/`,
      },
    },
    openGraph: {
      title: niche.siteName,
      description: niche.subtitle,
      url: `${SITE_URL}/en`,
      siteName: niche.siteName,
      type: 'website',
      locale: 'en',
    },
  }
}

export default function HomePageEn() {
  return niche.style.hero === 'split' ? <ComparateurHomeEn /> : <MagazineHomeEn />
}

/* ────────────────────────────────────────────────────────────────────
 * Magazine archetype (EN) — mirror of components/home/MagazineHome.tsx
 * ──────────────────────────────────────────────────────────────────── */

function Cover({ a, fill = false }: { a: ArticleMeta; fill?: boolean }) {
  if (a.featureImage) {
    return fill ? (
      <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
    ) : (
      <Image src={a.featureImage} alt={a.title} width={640} height={400} style={{ width: '100%', height: 'auto' }} />
    )
  }
  return <div className="ph" style={fill ? undefined : { aspectRatio: '16/10' }}><span>{catLabel(a.categorie)}</span></div>
}

function MagazineHomeEn() {
  const articles = getAllArticlesEn()
  const mosaic = articles.slice(0, 5)
  const [lead, ...rest4] = mosaic

  // Blocs par catégorie (catégories ayant au moins 1 article), max 3 blocs
  const byCat = niche.categories
    .map((c) => ({ ...c, items: articles.filter((a) => a.categorie === c.slug) }))
    .filter((c) => c.items.length > 0)
    .slice(0, 3)

  const popular = articles.slice(0, 5)

  return (
    <main id="main-content" className="mag-page">

      {/* Bandeau de rubriques */}
      {niche.categories.length > 0 && (
        <div className="magnav">
          <div className="wrap">
            <Link href="/en" className="home">{niche.siteName}</Link>
            {niche.categories.map((c) => (
              <Link key={c.slug} href={`/en/blog/${c.slug}`}>
                <span className="mn-pip" style={{ background: `var(--cat-${CAT_INDEX[c.slug] ?? 1})` }} />{c.label}
              </Link>
            ))}
            <Link href="/en/blog">All articles</Link>
          </div>
        </div>
      )}

      {/* Mosaïque hero */}
      {lead && (
        <section className="mag-hero">
          <div className="wrap">
            <div className="mag-mosaic">
              <Link href={articleHrefEn(lead)} className="mcard feat-big">
                <Cover a={lead} fill />
                <div className="mc-body">
                  <span className="mc-flag"><span className={`tag ${catClass(lead.categorie)}`}><span className="pip" />{catLabel(lead.categorie)}</span></span>
                  <h2>{lead.title}</h2>
                  {lead.description && <p>{lead.description}</p>}
                  <div className="mc-meta">{formatDateEn(lead.publishedAt)} · {lead.readingTimeMin} min</div>
                </div>
              </Link>
              <div className="mosaic-right">
                {rest4.map((a) => (
                  <Link key={articleHrefEn(a)} href={articleHrefEn(a)} className="mcard">
                    <Cover a={a} fill />
                    <div className="mc-body">
                      <span className="mc-flag"><span className={`tag ${catClass(a.categorie)}`}><span className="pip" />{catLabel(a.categorie)}</span></span>
                      <h3>{a.title}</h3>
                      <div className="mc-meta">{a.readingTimeMin} min</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Corps : main + sidebar */}
      <div className="mag-body">
        <div className="wrap">
          <div className="mag-main">

            {byCat.map((c) => {
              const [leadArt, ...others] = c.items
              return (
                <section key={c.slug} className="cat-block">
                  <div className="cat-head">
                    <span className="cat-label" style={{ background: `var(--cat-${CAT_INDEX[c.slug] ?? 1})` }}>{c.label}</span>
                    <span className="rule" style={{ background: `var(--cat-${CAT_INDEX[c.slug] ?? 1})` }} />
                    <Link href={`/en/blog/${c.slug}`} className="seeall">See all →</Link>
                  </div>
                  <div className="cat-layout">
                    <Link href={articleHrefEn(leadArt)} className="lead-art">
                      <Cover a={leadArt} />
                      <h3>{leadArt.title}</h3>
                      {leadArt.description && <p>{leadArt.description}</p>}
                      <div className="post-meta">{formatDateEn(leadArt.publishedAt)} · {leadArt.readingTimeMin} min</div>
                    </Link>
                    <div className="cat-list">
                      {others.slice(0, 4).map((a) => (
                        <Link key={articleHrefEn(a)} href={articleHrefEn(a)} className="mini-art">
                          <Cover a={a} />
                          <div>
                            <h4>{a.title}</h4>
                            <div className="post-meta">{a.readingTimeMin} min</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )
            })}

            {/* Édito */}
            <section className="edito">
              <span className="eyebrow" style={{ justifyContent: 'center' }}>{niche.siteName}</span>
              <blockquote>« {niche.subtitle} »</blockquote>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="promo">
              <span className="pblob" />
              <span className="peyebrow">★ {niche.dealWord}</span>
              <h4>{niche.heroPrefix} {niche.entities} {niche.heroSuffix}</h4>
              <p>{niche.subtitle}</p>
              <Link href="/comparer" className="btn btn-white btn-lg" style={{ width: '100%' }}>Compare <span className="arr">→</span></Link>
            </div>

            {popular.length > 0 && (
              <div className="side-block">
                <div className="side-head">Popular articles</div>
                <div className="pop-list">
                  {popular.map((a, i) => (
                    <Link key={articleHrefEn(a)} href={articleHrefEn(a)} className="pop">
                      <span className="rank">{i + 1}</span>
                      <Cover a={a} />
                      <div>
                        <h4>{a.title}</h4>
                        <div className="pmeta">{formatDateEn(a.publishedAt)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="side-news">
              <h4>Newsletter</h4>
              <p>{niche.subtitle}</p>
              <form>
                <input type="email" placeholder="you@email.com" required aria-label="Email" />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Comparator archetype (EN) — mirror of components/home/ComparateurHome.tsx
 * Tool CTAs keep their existing FR routes (/comparer, /quiz) — no /en/* mirror
 * exists yet, so we do NOT emit /en/comparer etc. (would be dead links).
 * ──────────────────────────────────────────────────────────────────── */

function CoverThird({ a }: { a: ArticleMeta }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

function ComparateurHomeEn() {
  const articles = getAllArticlesEn().slice(0, 3)
  const word = niche.rotatingWords?.[0] ?? niche.entities

  return (
    <main id="main-content">

      {/* Hero split */}
      <header className="hero">
        <div className="hero-bg" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /><span className="blob b3" /></div>
        <div className="wrap">
          <div className="hero-text">
            <span className="eyebrow hero-eyebrow">{niche.siteName}</span>
            <h1>{niche.heroPrefix} <span className="hl">{word}</span> {niche.heroSuffix}</h1>
            <p className="hero-sub">{niche.subtitle}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={niche.ctaPrimary?.url ?? '/comparer'} className="btn btn-primary btn-lg">Compare <span className="arr">→</span></Link>
              {niche.quiz.enabled && <Link href="/quiz" className="btn btn-ghost btn-lg">Take the quiz</Link>}
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="bill-card bill-main">
              <div className="bill-head"><span className="who">{niche.siteName}</span><span className="tag green"><span className="pip" />Optimised</span></div>
              <div className="bill-label">{niche.tagline}</div>
              <div className="bill-amt"><span className="cur">★</span> {niche.categories.length || 5}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '68%', background: 'var(--green)' }} /></div>
            </div>
            <div className="save-chip">
              <div className="lbl">Compared & neutral</div>
              <div className="val">{niche.entities}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Catégories */}
      {niche.categories.length > 0 && (
        <section className="section" id="categories">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">What do you want to compare?</span>
              <h2>One category, one colour, the right choice.</h2>
            </div>
            <div className="cat-grid">
              {niche.categories.map((c) => {
                const n = CAT_INDEX[c.slug] ?? 1
                return (
                  <Link key={c.slug} href={`/en/blog/${c.slug}`} className="cat">
                    <span className="glow" style={{ background: `var(--cat-${n})` }} />
                    <span className="cat-ic" style={{ background: `var(--cat-${n}-soft)`, color: `var(--cat-${n})` }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><circle cx="12" cy="12" r="8" /></svg>
                    </span>
                    <h3>{c.label}</h3>
                    {c.description && <p>{c.description}</p>}
                    <span className="go" style={{ color: `var(--cat-${n})` }}>Read <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Comment ça marche */}
      <section className="section how">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow" style={{ margin: '0 auto' }}>Simple and neutral</span>
            <h2>Decide in 2 minutes</h2>
          </div>
          <div className="steps">
            <div className="step"><span className="line" /><div className="num">1</div><h3>Tell us the essentials</h3><p>A few details about your needs, no paperwork.</p></div>
            <div className="step"><span className="line" /><div className="num">2</div><h3>Compare without bias</h3><p>We rank offers by real value, with no favouritism.</p></div>
            <div className="step"><div className="num">3</div><h3>Choose with confidence</h3><p>The best option for YOUR profile, explained.</p></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section stats">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat"><div className="n">{niche.categories.length || 5}</div><div className="l">categories compared</div></div>
            <div className="stat"><div className="n">100%</div><div className="l">independent</div></div>
            <div className="stat"><div className="n">€0</div><div className="l">to compare</div></div>
            <div className="stat"><div className="n">2 min</div><div className="l">to decide</div></div>
          </div>
        </div>
      </section>

      {/* Teaser blog */}
      {articles.length > 0 && (
        <section className="section" style={{ background: 'var(--cream-2)' }}>
          <div className="wrap">
            <div className="blog-head">
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">The mag</span>
                <h2>Tips to choose well</h2>
              </div>
              <Link href="/en/blog" className="btn btn-ghost">All articles <span className="arr">→</span></Link>
            </div>
            <div className="posts">
              {articles.map((a) => (
                <Link key={articleHrefEn(a)} href={articleHrefEn(a)} className="post">
                  <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><CoverThird a={a} /></div>
                  <div className="post-body">
                    <span className={`tag c${CAT_INDEX[a.categorie] ?? 1}`}><span className="pip" />{catLabel(a.categorie)}</span>
                    <h3>{a.title}</h3>
                    {a.description && <p>{a.description}</p>}
                    <div className="post-meta">{formatDateEn(a.publishedAt)} · {a.readingTimeMin} min</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="section">
        <div className="wrap">
          <div className="news">
            <h2>Stay informed</h2>
            <p>{niche.subtitle}</p>
            <form className="news-form">
              <input type="email" placeholder="you@email.com" required aria-label="Email" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
