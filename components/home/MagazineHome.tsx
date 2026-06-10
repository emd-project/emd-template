/**
 * MagazineHome — home archétype « magazine » à la structure Voltéo.
 * Mosaïque hero + blocs par catégorie (lead + liste) + sidebar.
 * Server Component, zéro JS. Images via next/image (sinon placeholder).
 */
import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles, articleHref, formatDate, type ArticleMeta } from '@/lib/blog'
import { niche } from '@/niche.config'

/* slug catégorie → classe badge générique c1..c5 (couleur auto) */
const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`
const catLabel = (slug: string) =>
  niche.categories.find((c) => c.slug === slug)?.label ?? slug

/* Visuel d'une carte : image réelle (fill) ou placeholder rayé */
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

export function MagazineHome() {
  const articles = getAllArticles()
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
            <Link href="/" className="home">{niche.siteName}</Link>
            {niche.categories.map((c) => (
              <Link key={c.slug} href={`/blog/${c.slug}`}>
                <span className="mn-pip" style={{ background: `var(--cat-${CAT_INDEX[c.slug] ?? 1})` }} />{c.label}
              </Link>
            ))}
            <Link href="/blog">Tous les articles</Link>
          </div>
        </div>
      )}

      {/* Mosaïque hero */}
      {lead && (
        <section className="mag-hero">
          <div className="wrap">
            <div className="mag-mosaic">
              <Link href={articleHref(lead)} className="mcard feat-big">
                <Cover a={lead} fill />
                <div className="mc-body">
                  <span className="mc-flag"><span className={`tag ${catClass(lead.categorie)}`}><span className="pip" />{catLabel(lead.categorie)}</span></span>
                  <h2>{lead.title}</h2>
                  {lead.description && <p>{lead.description}</p>}
                  <div className="mc-meta">{formatDate(lead.publishedAt)} · {lead.readingTimeMin} min</div>
                </div>
              </Link>
              <div className="mosaic-right">
                {rest4.map((a) => (
                  <Link key={articleHref(a)} href={articleHref(a)} className="mcard">
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
                    <Link href={`/blog/${c.slug}`} className="seeall">Tout voir →</Link>
                  </div>
                  <div className="cat-layout">
                    <Link href={articleHref(leadArt)} className="lead-art">
                      <Cover a={leadArt} />
                      <h3>{leadArt.title}</h3>
                      {leadArt.description && <p>{leadArt.description}</p>}
                      <div className="post-meta">{formatDate(leadArt.publishedAt)} · {leadArt.readingTimeMin} min</div>
                    </Link>
                    <div className="cat-list">
                      {others.slice(0, 4).map((a) => (
                        <Link key={articleHref(a)} href={articleHref(a)} className="mini-art">
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
              <Link href="/comparer" className="btn btn-white btn-lg" style={{ width: '100%' }}>Comparer <span className="arr">→</span></Link>
            </div>

            {popular.length > 0 && (
              <div className="side-block">
                <div className="side-head">Articles populaires</div>
                <div className="pop-list">
                  {popular.map((a, i) => (
                    <Link key={articleHref(a)} href={articleHref(a)} className="pop">
                      <span className="rank">{i + 1}</span>
                      <Cover a={a} />
                      <div>
                        <h4>{a.title}</h4>
                        <div className="pmeta">{formatDate(a.publishedAt)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="side-news">
              <h4>{niche.ctaSecondary?.text ?? 'Newsletter'}</h4>
              <p>{niche.subtitle}</p>
              <form>
                <input type="email" placeholder="votre@email.com" required aria-label="Email" />
                <button type="submit" className="btn btn-primary">S&apos;inscrire</button>
              </form>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
