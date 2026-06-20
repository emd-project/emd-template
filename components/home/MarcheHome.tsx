/**
 * MarcheHome — home archétype « Marché en direct » (portée de home-comparateur-marche).
 * Server Component, animations 100 % CSS. LOCALE-AWARE via `locale`.
 * Le « terminal de tarifs » + le classement sont alimentés par lib/classement
 * (data-driven, locale-aware) et MASQUÉS si aucun classement n'existe (runtime bête).
 * Aucun prix/valeur inventé : tout vient des données ou des catégories.
 */
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta } from '@/lib/blog'
import { getArticlesL, articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { getClassements } from '@/lib/classement'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'

const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug
const CatIc = () => (<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="7" /></svg>)
const Check = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>)
const Arrow = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
const SPARK = ['48%', '70%', '40%', '64%', '52%', '78%', '44%']

const T = {
  fr: { live: 'Marché en direct · à l’instant', tracked: 'catégories suivies', pill: 'Le marché, en direct', readBlog: 'Lire le blog', m1: '100 % indépendant', m2: 'Sans inscription', m3: 'Mise à jour continue', boardEye: 'Au classement', boardTitle: 'Le meilleur choix, par catégorie.', boardDesc: 'On compare en continu et on ne garde que l’option gagnante du moment.', updated: 'Dernière analyse', cCat: 'Élément', cPick: 'Meilleur', cProv: 'Référence', cScore: 'Score', cTrend: 'Tendance', bestOf: 'Choix gagnant', seeDetail: 'Voir le détail', articles: 'articles', blogEye: 'Le blog', blogTitle: 'Comprenez avant de choisir.', blogDesc: 'Guides et décryptages, rangés par thème.', readWeek: 'À lire cette semaine', finalEye: 'Alerte', finalTitle: 'Soyez prévenu dès qu’une meilleure option apparaît.', finalDesc: 'Une fois par mois, l’essentiel — sans spam.' },
  en: { live: 'Live market · just now', tracked: 'categories tracked', pill: 'The market, live', readBlog: 'Read the blog', m1: '100% independent', m2: 'No sign-up', m3: 'Continuously updated', boardEye: 'Ranking', boardTitle: 'The best pick, by category.', boardDesc: 'We compare continuously and keep only the current winner.', updated: 'Last analysis', cCat: 'Item', cPick: 'Best', cProv: 'Reference', cScore: 'Score', cTrend: 'Trend', bestOf: 'Top pick', seeDetail: 'See details', articles: 'articles', blogEye: 'The blog', blogTitle: 'Understand before you choose.', blogDesc: 'Guides and analysis, sorted by topic.', readWeek: 'Read this week', finalEye: 'Alert', finalTitle: 'Get notified as soon as a better option appears.', finalDesc: 'Once a month, the essentials — no spam.' },
}

function Cover({ a }: { a: ArticleMeta }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

export function MarcheHome({ locale = niche.defaultLocale }: { locale?: string }) {
  const t = T[locale === 'en' ? 'en' : 'fr']
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)
  const word = niche.rotatingWords?.[0] ?? niche.entities
  const cats = niche.categories
  const catCount = cats.length || 5

  const articles = getArticlesL(locale)
  const trio = articles.slice(0, 3)

  const board = Object.values(getClassements(locale))[0]
  const items = board?.items ?? []
  const best = items[0]
  const rank = items.slice(1, 6)
  const tickerCats = cats.length ? [...cats, ...cats, ...cats] : []

  return (
    <main id="main-content" className="md-page">

      <div className="md-statusbar">
        <div className="wrap">
          <span className="md-live"><span className="md-dot" /> {t.live}</span>
          <div className="right"><span>{catCount} {t.tracked}</span><span>{niche.siteName}</span></div>
        </div>
      </div>

      <header className="md-hero">
        <div className="md-orbits" aria-hidden="true">
          <span className="md-ring r1" /><span className="md-ring r2" /><span className="md-ring r3" />
          <span className="md-arm a1"><span className="md-orbpos"><span className="md-orb" style={{ background: 'var(--cat-1)' }}><CatIc /></span></span></span>
          <span className="md-arm a2"><span className="md-orbpos"><span className="md-orb" style={{ background: 'var(--cat-3)' }}><CatIc /></span></span></span>
          <span className="md-arm a3"><span className="md-orbpos"><span className="md-orb sm" style={{ background: 'var(--cat-5)' }}><CatIc /></span></span></span>
          <span className="md-arm a4"><span className="md-orbpos"><span className="md-orb sm" style={{ background: 'var(--cat-4)' }}><CatIc /></span></span></span>
        </div>
        <div className="md-orbits left" aria-hidden="true">
          <span className="md-ring r2" /><span className="md-ring r3" />
          <span className="md-arm a2"><span className="md-orbpos"><span className="md-orb sm" style={{ background: 'var(--cat-2)' }}><CatIc /></span></span></span>
        </div>

        <div className="md-chips" aria-hidden="true">
          {cats.slice(0, 6).map((c, i) => (
            <span key={c.slug} className={`md-chip c${i + 1}`}><span className="ci" style={{ background: `var(--cat-${(i % 5) + 1})` }}><CatIc /></span> {c.label}</span>
          ))}
        </div>

        <div className="md-hero-inner">
          <span className="md-pill"><span className="md-dot" /> {t.pill}</span>
          <h2 className="md-title">{niche.heroPrefix} <span className="grad">{word}</span> {niche.heroSuffix}</h2>
          <p className="md-sub">{niche.subtitle}</p>
          <div className="md-cta">
            <Link href={lp(niche.ctaPrimary?.url ?? '/comparer')} className="md-btn md-btn-primary">{tl(locale, 'home.compare')} <span className="arr">→</span></Link>
            <Link href={lp('/blog')} className="md-btn md-btn-ghost">{t.readBlog}</Link>
          </div>
          <div className="md-micro">
            <span className="mi"><Check /> {t.m1}</span><span className="mdot" />
            <span className="mi"><Check /> {t.m2}</span><span className="mdot" />
            <span className="mi"><Check /> {t.m3}</span>
          </div>
        </div>

        {tickerCats.length > 0 && (
          <div className="md-ticker" aria-hidden="true">
            <div className="md-ticker-track">
              {tickerCats.map((c, i) => (<span className="tk" key={i}><b>{c.label}</b></span>))}
            </div>
          </div>
        )}
      </header>

      {items.length > 0 && board && (
        <section className="md-board" id="board">
          <div className="wrap">
            <div className="md-board-head">
              <div>
                <span className="eyebrow">{t.boardEye}</span>
                <h2>{board.title ?? t.boardTitle}</h2>
                <p>{board.intro ?? t.boardDesc}</p>
              </div>
              <span className="md-updated"><span className="md-dot" /> {t.updated}{board.updated ? ` · ${board.updated}` : ''}</span>
            </div>
            <div className="md-board-grid">
              <div className="brow head">
                <span>{t.cCat}</span><span>{t.cPick}</span><span className="h-prov">{t.cProv}</span><span>{t.cScore}</span><span className="h-spark">{t.cTrend}</span><span />
              </div>
              {items.slice(0, 5).map((it, i) => (
                <div className="brow" key={it.rank}>
                  <div className="b-energy"><span className="b-ic" style={{ background: `var(--cat-${(i % 5) + 1})` }}><CatIc /></span><span>{it.nom}{it.bestFor && <small>{it.bestFor}</small>}</span></div>
                  <div className="b-price">{it.prix ?? it.score ?? '—'}</div>
                  <div className="b-prov">{it.badge ?? ''}{it.verdict && <small>{it.verdict}</small>}</div>
                  <div className="b-delta up">{it.score ?? ''}</div>
                  <div className="spark up">{SPARK.map((h, k) => (<i key={k} style={{ height: h }} />))}</div>
                  <Link href={lp(`/classement/${board.slug}`)} className="b-cta">{tl(locale, 'home.compare')} →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="md-flow" id="flow">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{tl(locale, 'home.howEyebrow')}</span>
            <h2>{tl(locale, 'home.howTitle')}</h2>
          </div>
          <div className="md-rail">
            <div className="track" />
            <div className="mstep"><div className="num">1</div><h3>{tl(locale, 'home.step1Title')}</h3><p>{tl(locale, 'home.step1Desc')}</p></div>
            <div className="mstep"><div className="num">2</div><h3>{tl(locale, 'home.step2Title')}</h3><p>{tl(locale, 'home.step2Desc')}</p></div>
            <div className="mstep"><div className="num">3</div><h3>{tl(locale, 'home.step3Title')}</h3><p>{tl(locale, 'home.step3Desc')}</p></div>
          </div>
        </div>
      </section>

      {best && board && (
        <section className="md-spotlight" id="offres">
          <div className="wrap">
            <div className="md-spot-grid">
              <div className="md-best">
                <span className="blob" />
                <span className="tag tag-best"><span className="pip" style={{ background: 'var(--bg-primary)' }} />{t.bestOf}</span>
                <h3>{best.nom}</h3>
                {best.bestFor && <p className="sub">{best.bestFor}</p>}
                {best.prix && <div className="price"><span className="amt">{best.prix}</span></div>}
                {best.score && <span className="save">{best.score}</span>}
                {best.pros && best.pros.length > 0 && (
                  <ul>{best.pros.slice(0, 3).map((p, i) => (<li key={i}><Check /> {p}</li>))}</ul>
                )}
                <Link href={lp(`/classement/${board.slug}`)} className="md-btn md-btn-ghost">{t.seeDetail} <span className="arr">→</span></Link>
              </div>
              <div className="md-rank">
                {rank.map((it) => (
                  <Link href={lp(`/classement/${board.slug}`)} className="rk" key={it.rank}>
                    <span className="rkn">{it.rank}</span>
                    <span className="rkp"><b>{it.nom}</b>{it.badge && <small>{it.badge}</small>}</span>
                    <span className="rka"><b>{it.prix ?? it.score ?? ''}</b></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="md-blog" id="blog">
        <div className="wrap">
          <div className="md-blog-head">
            <div>
              <span className="eyebrow">{t.blogEye}</span>
              <h2>{t.blogTitle}</h2>
              <p>{t.blogDesc}</p>
            </div>
            <Link href={lp('/blog')} className="more">{tl(locale, 'home.allArticles')} <Arrow /></Link>
          </div>

          {cats.length > 0 && (
            <div className="md-cat-grid">
              {cats.map((c, i) => {
                const count = articles.filter((a) => a.categorie === c.slug).length
                return (
                  <Link href={lp(`/blog/${c.slug}`)} className="md-cat" key={c.slug}>
                    <span className="ic" style={{ background: `var(--cat-${(i % 5) + 1})` }}><CatIc /></span>
                    <span className="tx"><h3>{c.label}</h3><small>{count} {t.articles}</small></span>
                    <span className="go"><Arrow /></span>
                  </Link>
                )
              })}
            </div>
          )}

          {trio.length > 0 && (
            <div className="md-read">
              <div className="lbl">{t.readWeek}</div>
              <div className="md-posts">
                {trio.map((a) => (
                  <Link href={href(a)} className="md-post" key={a.slug}>
                    <div className="ph" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                    <div className="pb">
                      <span className={`tag c${(niche.categories.findIndex((c) => c.slug === a.categorie) % 5) + 1}`}><span className="pip" />{catLabel(a.categorie)}</span>
                      <h3>{a.title}</h3>
                      {a.description && <p>{a.description}</p>}
                      <div className="pm">{fmt(a.publishedAt)} · {a.readingTimeMin} min</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="md-final">
        <div className="wrap">
          <div className="md-final-card">
            <span className="glow g1" /><span className="glow g2" />
            <span className="eyebrow">{t.finalEye}</span>
            <h2>{t.finalTitle}</h2>
            <p>{t.finalDesc}</p>
            <form className="md-news-form">
              <input type="email" placeholder={tl(locale, 'home.emailPlaceholder')} required aria-label="Email" />
              <button type="submit" className="md-btn md-btn-primary">{tl(locale, 'home.subscribe')} <span className="arr">→</span></button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
