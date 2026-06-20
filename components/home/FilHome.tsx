/**
 * FilHome — home archétype « Le fil » (portée de home-magazine-fil).
 * Server Component, animations 100 % CSS (pas de carrousel JS : la une affiche
 * le dernier article ; les autres restent dans le DOM masqués pour le SEO).
 * LOCALE-AWARE via `locale`. Tout est alimenté par les articles réels.
 */
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta } from '@/lib/blog'
import { getArticlesL, articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'

const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug
const catN = (slug: string) => (Math.max(0, niche.categories.findIndex((c) => c.slug === slug)) % 5) + 1
const Arrow = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
const TrendIc = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></svg>)

const T = {
  fr: { live: 'En direct de la rédaction', articlesWeek: 'articles', breaking: 'Dernière minute', frontPage: 'À la une', liveFeed: 'Le fil · en continu', seeFeed: 'Voir tout le fil', rubTitle: 'Explorez par rubrique.', allArticles: 'Tous les articles', mostRead: 'Le plus lu cette semaine', edito: 'L’édito', newsTitle: 'L’alerte qui fait économiser.', min: 'min' },
  en: { live: 'Live from the newsroom', articlesWeek: 'articles', breaking: 'Breaking', frontPage: 'Front page', liveFeed: 'The feed · live', seeFeed: 'See the whole feed', rubTitle: 'Explore by topic.', allArticles: 'All articles', mostRead: 'Most read this week', edito: 'Editorial', newsTitle: 'The alert that saves you money.', min: 'min' },
}

function Cover({ a }: { a: ArticleMeta }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 60vw" style={{ objectFit: 'cover' }} />
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

export function FilHome({ locale = niche.defaultLocale }: { locale?: string }) {
  const t = T[locale === 'en' ? 'en' : 'fr']
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)
  const fmtShort = (iso: string) => new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short' })

  const articles = getArticlesL(locale)
  const feat = articles[0]
  const liveItems = articles.slice(1, 7)
  const breaking = articles.slice(0, 4)
  const top = articles.slice(0, 5)
  const chips = niche.categories.slice(0, 2)

  return (
    <main id="main-content" className="fil-page">

      <div className="fil-status">
        <div className="wrap">
          <span className="fil-live"><span className="fil-pdot" /> {t.live}</span>
          <div className="right"><span><b>{articles.length}</b> {t.articlesWeek}</span><span>{niche.siteName}</span></div>
        </div>
      </div>

      {breaking.length > 0 && (
        <div className="fil-breaking">
          <span className="lab"><span className="wd" /> {t.breaking}</span>
          <div className="fil-bk-mask">
            <div className="fil-bk-track">
              {[...breaking, ...breaking].map((a, i) => (
                <span className="bk" key={i}><b>{catLabel(a.categorie)} :</b> {a.title}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="fil-hero" id="fil">
        {chips.length > 0 && (
          <div className="fil-chips" aria-hidden="true">
            {chips.map((c, i) => (
              <span key={c.slug} className={`fil-chip h${i + 1}`}><span className="cp" style={{ background: `var(--cat-${(i % 5) + 1})` }} /> {c.label}</span>
            ))}
          </div>
        )}
        <div className="wrap">
          <div className="fil-feature">
            {feat && (
              <Link href={href(feat)} className="ffeat on">
                <Cover a={feat} />
                <div className="body">
                  <span className="flag"><span className={`tag c${catN(feat.categorie)}`}><span className="pip" />{t.frontPage} · {catLabel(feat.categorie)}</span></span>
                  <h2>{feat.title}</h2>
                  {feat.description && <p>{feat.description}</p>}
                  <div className="meta">{fmt(feat.publishedAt)} · {feat.readingTimeMin} {t.min}</div>
                </div>
              </Link>
            )}
          </div>

          <aside className="fil-live-col">
            <div className="fil-live-head"><span className="fil-pdot" /> {t.liveFeed}</div>
            <div className="fl-list">
              <div className="fl-track">
                {(liveItems.length ? [...liveItems, ...liveItems] : []).map((a, i) => {
                  const dup = i >= liveItems.length
                  return (
                    <Link href={href(a)} className="fl-item" key={i} aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined}>
                      <span className="fl-time">{fmtShort(a.publishedAt)}</span>
                      <h4>{a.title}</h4>
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="fil-live-foot">
              <Link href={lp('/blog')}>{t.seeFeed} <Arrow /></Link>
            </div>
          </aside>
        </div>
      </header>

      {niche.categories.length > 0 && (
        <section className="fil-rub" id="rubriques">
          <div className="wrap">
            <div className="fil-sec-head">
              <h2>{t.rubTitle}</h2>
              <Link href={lp('/blog')} className="more">{t.allArticles} <Arrow /></Link>
            </div>
            <div className="rub-grid">
              {niche.categories.map((c, i) => {
                const count = articles.filter((a) => a.categorie === c.slug).length
                return (
                  <Link href={lp(`/blog/${c.slug}`)} className="rub" key={c.slug}>
                    <span className="rub-ic" style={{ background: `var(--cat-${(i % 5) + 1})` }}><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="7" /></svg></span>
                    <h3>{c.label}</h3>
                    <span className="rub-n">{count} {t.articlesWeek}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="fil-mid" id="plus-lu">
        <div className="wrap">
          <div>
            <div className="trend-head"><TrendIc /> {t.mostRead}</div>
            <div className="trend">
              {top.map((a, i) => (
                <Link href={href(a)} className="trd" key={a.slug}>
                  <span className="trn">{i + 1}</span>
                  <div><h4>{a.title}</h4><div className="trm">{catLabel(a.categorie)} · {fmtShort(a.publishedAt)}</div></div>
                  <span className="trv">{a.readingTimeMin} {t.min}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="fil-quote">
            <span className="qglow" />
            <span className="eyebrow">{t.edito}</span>
            <blockquote>« {niche.author?.bio || niche.subtitle} »</blockquote>
            {niche.author?.name && <cite>{niche.author.name}<small>{niche.author.title}</small></cite>}
          </div>
        </div>
      </section>

      <section className="fil-news" id="newsletter">
        <div className="wrap">
          <div className="fil-news-card">
            <div>
              <h2>{t.newsTitle}</h2>
              <p>{niche.subtitle}</p>
            </div>
            <form className="fil-news-form">
              <input type="email" placeholder={tl(locale, 'home.emailPlaceholder')} required aria-label="Email" />
              <button type="submit" className="btn btn-primary btn-lg">{tl(locale, 'home.subscribe')}</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
