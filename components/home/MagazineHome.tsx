/**
 * MagazineHome — home archétype « magazine » (mosaïque + blocs catégorie + sidebar).
 * Server Component, zéro JS. LOCALE-AWARE : sert FR et EN avec le même code via
 * la prop `locale` (articles, URLs, dates, libellés tl()). Images via next/image.
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
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) =>
  niche.categories.find((c) => c.slug === slug)?.label ?? slug

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

export function MagazineHome({ locale = niche.defaultLocale }: { locale?: string }) {
  const L = (k: string) => tl(locale, `home.${k}`)
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)

  const articles = getArticlesL(locale)
  const mosaic = articles.slice(0, 5)
  const [lead, ...rest4] = mosaic

  const byCat = niche.categories
    .map((c) => ({ ...c, items: articles.filter((a) => a.categorie === c.slug) }))
    .filter((c) => c.items.length > 0)
    .slice(0, 3)

  const popular = articles.slice(0, 5)

  return (
    <main id="main-content" className="mag-page">

      {niche.categories.length > 0 && (
        <div className="magnav">
          <div className="wrap">
            <Link href={lp('/')} className="home">{niche.siteName}</Link>
            {niche.categories.map((c) => (
              <Link key={c.slug} href={lp(`/blog/${c.slug}`)}>
                <span className="mn-pip" style={{ background: `var(--cat-${CAT_INDEX[c.slug] ?? 1})` }} />{c.label}
              </Link>
            ))}
            <Link href={lp('/blog')}>{L('allArticles')}</Link>
          </div>
        </div>
      )}

      {lead && (
        <section className="mag-hero">
          <div className="wrap">
            <div className="mag-mosaic">
              <Link href={href(lead)} className="mcard feat-big">
                <Cover a={lead} fill />
                <div className="mc-body">
                  <span className="mc-flag"><span className={`tag ${catClass(lead.categorie)}`}><span className="pip" />{catLabel(lead.categorie)}</span></span>
                  <h2>{lead.title}</h2>
                  {lead.description && <p>{lead.description}</p>}
                  <div className="mc-meta">{fmt(lead.publishedAt)} · {lead.readingTimeMin} min</div>
                </div>
              </Link>
              <div className="mosaic-right">
                {rest4.map((a) => (
                  <Link key={href(a)} href={href(a)} className="mcard">
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
                    <Link href={lp(`/blog/${c.slug}`)} className="seeall">{L('seeAll')}</Link>
                  </div>
                  <div className="cat-layout">
                    <Link href={href(leadArt)} className="lead-art">
                      <Cover a={leadArt} />
                      <h3>{leadArt.title}</h3>
                      {leadArt.description && <p>{leadArt.description}</p>}
                      <div className="post-meta">{fmt(leadArt.publishedAt)} · {leadArt.readingTimeMin} min</div>
                    </Link>
                    <div className="cat-list">
                      {others.slice(0, 4).map((a) => (
                        <Link key={href(a)} href={href(a)} className="mini-art">
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

            <section className="edito">
              <span className="eyebrow" style={{ justifyContent: 'center' }}>{niche.siteName}</span>
              <blockquote>« {niche.subtitle} »</blockquote>
            </section>

          </div>

          <aside className="sidebar">
            <div className="promo">
              <span className="pblob" />
              <span className="peyebrow">★ {niche.dealWord}</span>
              <h4>{niche.heroPrefix} {niche.entities} {niche.heroSuffix}</h4>
              <p>{niche.subtitle}</p>
              <Link href={lp('/comparer')} className="btn btn-white btn-lg" style={{ width: '100%' }}>{L('compare')} <span className="arr">→</span></Link>
            </div>

            {popular.length > 0 && (
              <div className="side-block">
                <div className="side-head">{L('popular')}</div>
                <div className="pop-list">
                  {popular.map((a, i) => (
                    <Link key={href(a)} href={href(a)} className="pop">
                      <span className="rank">{i + 1}</span>
                      <Cover a={a} />
                      <div>
                        <h4>{a.title}</h4>
                        <div className="pmeta">{fmt(a.publishedAt)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="side-news">
              <h4>{L('newsletter')}</h4>
              <p>{niche.subtitle}</p>
              <form>
                <input type="email" placeholder={L('emailPlaceholder')} required aria-label="Email" />
                <button type="submit" className="btn btn-primary">{L('subscribe')}</button>
              </form>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
