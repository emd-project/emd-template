/**
 * ComparateurHome — home archétype « comparateur » à la structure Voltéo.
 * Hero split + grille catégories + comment ça marche + stats + teaser blog + newsletter.
 * Server Component, JS minimal. Les outils interactifs (estimateur, table, quiz)
 * vivent sur /comparer, /simulateur, /quiz — on y renvoie.
 */
import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles, articleHref, formatDate, type ArticleMeta } from '@/lib/blog'
import { niche } from '@/niche.config'

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catLabel = (slug: string) => niche.categories.find((c) => c.slug === slug)?.label ?? slug

function Cover({ a }: { a: ArticleMeta }) {
  if (a.featureImage) return <Image src={a.featureImage} alt={a.title} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
  return <div className="ph"><span>{catLabel(a.categorie)}</span></div>
}

export function ComparateurHome() {
  const articles = getAllArticles().slice(0, 3)
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
              <Link href={niche.ctaPrimary?.url ?? '/comparer'} className="btn btn-primary btn-lg">{niche.ctaPrimary?.text ?? 'Comparer'} <span className="arr">→</span></Link>
              {niche.quiz.enabled && <Link href="/quiz" className="btn btn-ghost btn-lg">{niche.ctaSecondary?.text ?? 'Quiz'}</Link>}
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="bill-card bill-main">
              <div className="bill-head"><span className="who">{niche.siteName}</span><span className="tag green"><span className="pip" />Optimisé</span></div>
              <div className="bill-label">{niche.tagline}</div>
              <div className="bill-amt"><span className="cur">★</span> {niche.categories.length || 5}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '68%', background: 'var(--green)' }} /></div>
            </div>
            <div className="save-chip">
              <div className="lbl">Comparé & neutre</div>
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
              <span className="eyebrow">Que voulez-vous comparer ?</span>
              <h2>Une catégorie, une couleur, le bon choix.</h2>
            </div>
            <div className="cat-grid">
              {niche.categories.map((c) => {
                const n = CAT_INDEX[c.slug] ?? 1
                return (
                  <Link key={c.slug} href={`/comparer/${c.slug}`} className="cat">
                    <span className="glow" style={{ background: `var(--cat-${n})` }} />
                    <span className="cat-ic" style={{ background: `var(--cat-${n}-soft)`, color: `var(--cat-${n})` }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><circle cx="12" cy="12" r="8" /></svg>
                    </span>
                    <h3>{c.label}</h3>
                    {c.description && <p>{c.description}</p>}
                    <span className="go" style={{ color: `var(--cat-${n})` }}>Comparer <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
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
            <span className="eyebrow" style={{ margin: '0 auto' }}>Simple et neutre</span>
            <h2>Décider prend 2 minutes</h2>
          </div>
          <div className="steps">
            <div className="step"><span className="line" /><div className="num">1</div><h3>Dites-nous l&apos;essentiel</h3><p>Quelques infos sur votre besoin, sans paperasse.</p></div>
            <div className="step"><span className="line" /><div className="num">2</div><h3>Comparez sans biais</h3><p>On classe les offres par valeur réelle, sans favoritisme.</p></div>
            <div className="step"><div className="num">3</div><h3>Choisissez sereinement</h3><p>La meilleure option pour VOTRE profil, expliquée.</p></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section stats">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat"><div className="n">{niche.categories.length || 5}</div><div className="l">catégories comparées</div></div>
            <div className="stat"><div className="n">100 %</div><div className="l">indépendant</div></div>
            <div className="stat"><div className="n">0 €</div><div className="l">pour comparer</div></div>
            <div className="stat"><div className="n">2 min</div><div className="l">pour décider</div></div>
          </div>
        </div>
      </section>

      {/* Teaser blog */}
      {articles.length > 0 && (
        <section className="section" style={{ background: 'var(--cream-2)' }}>
          <div className="wrap">
            <div className="blog-head">
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">Le mag</span>
                <h2>Conseils pour bien choisir</h2>
              </div>
              <Link href="/blog" className="btn btn-ghost">Tous les articles <span className="arr">→</span></Link>
            </div>
            <div className="posts">
              {articles.map((a) => (
                <Link key={articleHref(a)} href={articleHref(a)} className="post">
                  <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} /></div>
                  <div className="post-body">
                    <span className={`tag c${CAT_INDEX[a.categorie] ?? 1}`}><span className="pip" />{catLabel(a.categorie)}</span>
                    <h3>{a.title}</h3>
                    {a.description && <p>{a.description}</p>}
                    <div className="post-meta">{formatDate(a.publishedAt)} · {a.readingTimeMin} min</div>
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
            <h2>{niche.ctaSecondary?.text ?? 'Restez informé'}</h2>
            <p>{niche.subtitle}</p>
            <form className="news-form">
              <input type="email" placeholder="votre@email.com" required aria-label="Email" />
              <button type="submit" className="btn btn-primary">S&apos;inscrire</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
