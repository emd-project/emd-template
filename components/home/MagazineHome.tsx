/**
 * MagazineHome — home archétype « magazine » (mosaïque + blocs catégorie + sidebar).
 * Server Component, zéro JS. LOCALE-AWARE : sert FR et EN avec le même code via
 * la prop `locale` (articles, URLs, dates, libellés tl()). Images via next/image.
 *
 * CONTENU DE CONFIG (H1, sous-titre, libellés de catégories) : passé par
 * `nicheL` / `categoriesL` / `categoryLabelL` (lib/niche-l10n.ts), pas lu en direct
 * sur `niche`. Sans bloc `localized` dans niche.config, le rendu est celui d'avant.
 *
 * IMAGE STRUCTURELLE : l'en-tête de chaque `.cat-block` porte la couverture de sa
 * catégorie (`category-<slug>` du registre `lib/image-slots`) en vignette carrée,
 * posée à gauche de l'onglet coloré. C'était la seule des quatre variantes de home
 * à n'afficher aucune couverture de catégorie. La vignette reste petite à dessein :
 * `.cat-head` est une ligne (onglet + filet + « voir tout »), un bandeau y changerait
 * le rythme de la page. Sans slot déclaré, OU si le fichier n'a pas encore été
 * généré, l'en-tête est exactement celui d'avant.
 *
 * Un slot est déclaré dès qu'une catégorie existe dans `niche.config` : tester le
 * seul slot laissait donc passer un `next/image` sur un fichier absent. Même garde
 * que `app/(site)/[article]/page.tsx` (`fs.existsSync` sur `public/…`).
 */
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import { type ArticleMeta } from '@/lib/blog'
import { getArticlesL, articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { nicheL, categoriesL, categoryLabelL } from '@/lib/niche-l10n'
import { getCategoryImage } from '@/lib/image-slots'

/** Le fichier de l'image est-il réellement présent dans /public ? */
function imageExists(relativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', relativePath.replace(/^\//, '')))
  } catch {
    return false
  }
}

// L'INDEX de couleur reste positionnel (c'est une couleur, pas du texte) ; le
// LIBELLÉ, lui, est résolu par slug dans la locale de rendu.
const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`

function Cover({ a, fill = false, locale }: { a: ArticleMeta; fill?: boolean; locale: string }) {
  if (a.featureImage) {
    return fill ? (
      <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
    ) : (
      <Image src={a.featureImage} alt={a.title} width={640} height={400} style={{ width: '100%', height: 'auto' }} />
    )
  }
  return <div className="ph" style={fill ? undefined : { aspectRatio: '16/10' }}><span>{categoryLabelL(locale, a.categorie)}</span></div>
}

export function MagazineHome({ locale = niche.defaultLocale }: { locale?: string }) {
  const L = (k: string) => tl(locale, `home.${k}`)
  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)

  const catLabel = (slug: string) => categoryLabelL(locale, slug)
  const cats = categoriesL(locale)
  const subtitle = nicheL(locale, 'subtitle')

  const articles = getArticlesL(locale)
  const mosaic = articles.slice(0, 5)
  const [lead, ...rest4] = mosaic

  const byCat = cats
    .map((c) => ({ ...c, items: articles.filter((a) => a.categorie === c.slug) }))
    .filter((c) => c.items.length > 0)
    .slice(0, 3)

  const popular = articles.slice(0, 5)

  return (
    <main id="main-content" className="mag-page">

      {cats.length > 0 && (
        <div className="magnav">
          <div className="wrap">
            <Link href={lp('/')} className="home">{niche.siteName}</Link>
            {cats.map((c) => (
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
                <Cover a={lead} fill locale={locale} />
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
                    <Cover a={a} fill locale={locale} />
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
              // Slot déclaré ET fichier réellement généré, sinon pas de vignette.
              const cover = getCategoryImage(c.slug)
              const coverPath = cover && imageExists(cover.path) ? cover.path : null
              return (
                <section key={c.slug} className="cat-block">
                  <div className="cat-head">
                    {cover && coverPath && (
                      <Image
                        src={coverPath}
                        alt={cover.alt}
                        width={38}
                        height={38}
                        style={{ width: 38, height: 38, flex: '0 0 38px', objectFit: 'cover', borderRadius: 'var(--r-sm)', marginRight: 12 }}
                      />
                    )}
                    <span className="cat-label" style={{ background: `var(--cat-${CAT_INDEX[c.slug] ?? 1})` }}>{c.label}</span>
                    <span className="rule" style={{ background: `var(--cat-${CAT_INDEX[c.slug] ?? 1})` }} />
                    <Link href={lp(`/blog/${c.slug}`)} className="seeall">{L('seeAll')}</Link>
                  </div>
                  <div className="cat-layout">
                    <Link href={href(leadArt)} className="lead-art">
                      <Cover a={leadArt} locale={locale} />
                      <h3>{leadArt.title}</h3>
                      {leadArt.description && <p>{leadArt.description}</p>}
                      <div className="post-meta">{fmt(leadArt.publishedAt)} · {leadArt.readingTimeMin} min</div>
                    </Link>
                    <div className="cat-list">
                      {others.slice(0, 4).map((a) => (
                        <Link key={href(a)} href={href(a)} className="mini-art">
                          <Cover a={a} locale={locale} />
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
              <blockquote>« {subtitle} »</blockquote>
            </section>

          </div>

          <aside className="sidebar">
            <div className="promo">
              <span className="pblob" />
              <span className="peyebrow">★ {niche.dealWord}</span>
              <h4>{nicheL(locale, 'heroPrefix')} {nicheL(locale, 'entities')} {nicheL(locale, 'heroSuffix')}</h4>
              <p>{subtitle}</p>
              <Link href={lp('/comparer')} className="btn btn-white btn-lg" style={{ width: '100%' }}>{L('compare')} <span className="arr">→</span></Link>
            </div>

            {popular.length > 0 && (
              <div className="side-block">
                <div className="side-head">{L('popular')}</div>
                <div className="pop-list">
                  {popular.map((a, i) => (
                    <Link key={href(a)} href={href(a)} className="pop">
                      <span className="rank">{i + 1}</span>
                      <Cover a={a} locale={locale} />
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
              <p>{subtitle}</p>
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
