/**
 * ComparateurHome — home archétype « comparateur » (hero split + grille catégories
 * + comment ça marche + stats + teaser blog + newsletter). Server Component.
 * LOCALE-AWARE : sert FR et EN via la prop `locale`. Les outils interactifs vivent
 * sur /comparer, /simulateur, /quiz.
 */
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta } from '@/lib/blog'
import { getArticlesL, articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug

function Cover({ a }: { a: ArticleMeta }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

export function ComparateurHome({ locale = niche.defaultLocale }: { locale?: string }) {
  const L = (k: string) => tl(locale, `home.${k}`)
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)

  const articles = getArticlesL(locale).slice(0, 3)
  const word = niche.rotatingWords?.[0] ?? niche.entities

  return (
    <main id="main-content">

      <header className="hero">
        <div className="hero-bg" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /><span className="blob b3" /></div>
        <div className="wrap">
          <div className="hero-text">
            <span className="eyebrow hero-eyebrow">{niche.siteName}</span>
            <h1>{niche.heroPrefix} <span className="hl">{word}</span> {niche.heroSuffix}</h1>
            <p className="hero-sub">{niche.subtitle}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={lp(niche.ctaPrimary?.url ?? '/comparer')} className="btn btn-primary btn-lg">{L('compare')} <span className="arr">→</span></Link>
              {niche.quiz.enabled && <Link href={lp('/quiz')} className="btn btn-ghost btn-lg">{L('takeQuiz')}</Link>}
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="bill-card bill-main">
              <div className="bill-head"><span className="who">{niche.siteName}</span><span className="tag green"><span className="pip" />{L('optimized')}</span></div>
              <div className="bill-label">{niche.tagline}</div>
              <div className="bill-amt"><span className="cur">★</span> {niche.categories.length || 5}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '68%', background: 'var(--green)' }} /></div>
            </div>
            <div className="save-chip">
              <div className="lbl">{L('comparedNeutral')}</div>
              <div className="val">{niche.entities}</div>
            </div>
          </div>
        </div>
      </header>

      {niche.categories.length > 0 && (
        <section className="section" id="categories">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">{L('cmpCatEyebrow')}</span>
              <h2>{L('cmpCatTitle')}</h2>
            </div>
            <div className="cat-grid">
              {niche.categories.map((c) => {
                const n = CAT_INDEX[c.slug] ?? 1
                return (
                  <Link key={c.slug} href={lp('/comparer')} className="cat">
                    <span className="glow" style={{ background: `var(--cat-${n})` }} />
                    <span className="cat-ic" style={{ background: `var(--cat-${n}-soft)`, color: `var(--cat-${n})` }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><circle cx="12" cy="12" r="8" /></svg>
                    </span>
                    <h3>{c.label}</h3>
                    {c.description && <p>{c.description}</p>}
                    <span className="go" style={{ color: `var(--cat-${n})` }}>{L('compare')} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="section how">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow" style={{ margin: '0 auto' }}>{L('howEyebrow')}</span>
            <h2>{L('howTitle')}</h2>
          </div>
          <div className="steps">
            <div className="step"><span className="line" /><div className="num">1</div><h3>{L('step1Title')}</h3><p>{L('step1Desc')}</p></div>
            <div className="step"><span className="line" /><div className="num">2</div><h3>{L('step2Title')}</h3><p>{L('step2Desc')}</p></div>
            <div className="step"><div className="num">3</div><h3>{L('step3Title')}</h3><p>{L('step3Desc')}</p></div>
          </div>
        </div>
      </section>

      <section className="section stats">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat"><div className="n">{niche.categories.length || 5}</div><div className="l">{L('statCategories')}</div></div>
            <div className="stat"><div className="n">100%</div><div className="l">{L('statIndependent')}</div></div>
            <div className="stat"><div className="n">0 €</div><div className="l">{L('statFree')}</div></div>
            <div className="stat"><div className="n">2 min</div><div className="l">{L('statTime')}</div></div>
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="section" style={{ background: 'var(--cream-2)' }}>
          <div className="wrap">
            <div className="blog-head">
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">{L('magEyebrow')}</span>
                <h2>{L('magTitle')}</h2>
              </div>
              <Link href={lp('/blog')} className="btn btn-ghost">{L('allArticles')} <span className="arr">→</span></Link>
            </div>
            <div className="posts">
              {articles.map((a) => (
                <Link key={href(a)} href={href(a)} className="post">
                  <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                  <div className="post-body">
                    <span className={`tag c${CAT_INDEX[a.categorie] ?? 1}`}><span className="pip" />{catLabel(a.categorie)}</span>
                    <h3>{a.title}</h3>
                    {a.description && <p>{a.description}</p>}
                    <div className="post-meta">{fmt(a.publishedAt)} · {a.readingTimeMin} min</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="news">
            <h2>{L('stayInformed')}</h2>
            <p>{niche.subtitle}</p>
            <form className="news-form">
              <input type="email" placeholder={L('emailPlaceholder')} required aria-label="Email" />
              <button type="submit" className="btn btn-primary">{L('subscribe')}</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
