/**
 * CategoryView — listing catégorie LOCALE-AWARE + multi-variantes (Server Component).
 * Une seule implémentation pour FR et EN (prop `locale`) et pour les 2 variantes :
 *  - 'classic'   : hub-hero + barre de filtres + grille .posts (historique)
 *  - 'editorial' : une-à-la-une (carte vedette) + PETIT FIL des articles de la
 *                  catégorie (réutilise le bloc .fil-* de l'ancienne home « fil ») + grille
 *
 * La variante 'presse' a été retirée le 2026-08-02 (cf. lib/variants.ts) : c'était
 * une IDENTITÉ complète maintenue pour un seul secteur. Les sites beauté prennent
 * désormais 'classic' ou 'editorial' comme les autres.
 *
 * Le SEO (metadata, JSON-LD, generateStaticParams) reste dans les routes ; ce
 * composant ne rend que le corps. Pagination identique aux variantes.
 *
 * Le LIBELLÉ de la catégorie (H1, fil d'Ariane, tag de la une) vient de
 * `categoryLabelL(locale, slug)` (lib/niche-l10n.ts) et non plus de la map FR
 * `CATEGORY_LABELS` : c'est le H1 de /en/blog/[categorie]. Sans bloc `localized`,
 * la valeur résolue EST celle de `CATEGORY_LABELS` — rendu inchangé.
 *
 * IMAGE STRUCTURELLE : la couverture de la catégorie (`category-<slug>` du
 * registre `lib/image-slots`) sert de FOND au `hub-hero`. Le dégradé du hub est
 * conservé PAR-DESSUS, en voile, pour que le titre reste lisible. Si la catégorie
 * n'a pas de slot déclaré (slug hors `niche.categories`, ou template nu dont
 * `categories` est vide) OU si le fichier n'a pas encore été généré, on ne rend
 * rien de plus : l'en-tête est exactement celui d'avant.
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
import { articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { categoryLabelL } from '@/lib/niche-l10n'
import { Pagination } from '@/components/blog/Pagination'
import { getCategoryImage } from '@/lib/image-slots'
import { resolveCategoryVariant, type CategoryVariant } from '@/lib/variants'

const ARTICLES_PER_PAGE = 12

/** Le fichier de l'image est-il réellement présent dans /public ? */
function imageExists(relativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', relativePath.replace(/^\//, '')))
  } catch {
    return false
  }
}

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const catClass = (slug: string) => `c${CAT_INDEX[slug] ?? 1}`

/**
 * Voile de lisibilité posé sur la couverture du hub. C'est le dégradé du
 * `hub-hero` (var(--cream-2)) rejoué en overlay : opaque en bas, où vivent le
 * titre et le compteur, transparent en haut, où l'image respire.
 */
const HUB_COVER_SCRIM =
  'linear-gradient(180deg, color-mix(in srgb, var(--cream-2) 58%, transparent) 0%, color-mix(in srgb, var(--cream-2) 84%, transparent) 55%, var(--cream-2) 100%)'

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

/** Mots spécifiques catégorie (locale-aware, sans clé JSON dédiée). */
const WORDS: Record<'fr' | 'en', { kicker: string; article: string; articles: string; feed: string }> = {
  fr: { kicker: 'Catégorie', article: 'article', articles: 'articles', feed: 'Le fil' },
  en: { kicker: 'Category', article: 'article', articles: 'articles', feed: 'The feed' },
}

function Cover({ a, fill = false, locale }: { a: ArticleMeta; fill?: boolean; locale: string }) {
  if (a.featureImage) {
    return <Image src={a.featureImage} alt={a.title} fill sizes={fill ? '(max-width:900px) 100vw, 70vw' : '(max-width:900px) 100vw, 33vw'} style={{ objectFit: 'cover' }} />
  }
  return <div className="ph"><span>{categoryLabelL(locale, a.categorie)}</span></div>
}

export function CategoryView({
  locale = niche.defaultLocale,
  variant,
  categorie,
  articles,
  categories,
  currentPage,
}: {
  locale?: string
  variant?: CategoryVariant
  categorie: string
  articles: ArticleMeta[]
  categories: { slug: string; label: string; count: number }[]
  currentPage: number
}) {
  const v = variant ?? resolveCategoryVariant()

  const lp = (p: string) => localePath(locale, p)
  const href = (a: ArticleMeta) => articleHrefL(locale, a)
  const fmt = (iso: string) => formatDateL(locale, iso)
  const fmtShort = (iso: string) => new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short' })
  const w = WORDS[locale === 'en' ? 'en' : 'fr']
  const label = categoryLabelL(locale, categorie)

  // Slot absent (catégorie hors config, template nu) ou fichier pas encore
  // généré → en-tête inchangé.
  const cover = getCategoryImage(categorie)
  const coverPath = cover && imageExists(cover.path) ? cover.path : null

  const total = articles.length
  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE)
  const paged = articles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  const editorial = v === 'editorial'
  const showFeature = editorial && currentPage === 1 && paged.length > 0
  const lead = showFeature ? paged[0] : null
  const feed = showFeature ? paged.slice(1, 6) : []
  const grid = showFeature ? paged.slice(6) : paged

  const countLabel = `${total} ${total > 1 ? w.articles : w.article}`

  return (
    <main id="main-content">
      <header className="hub-hero">
        {cover && coverPath && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <Image src={coverPath} alt={cover.alt} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: HUB_COVER_SCRIM }} />
          </div>
        )}
        <span className="glow" aria-hidden="true" />
        <div className="wrap">
          <nav className="crumb" aria-label={tl(locale, 'nav.mainNav')}>
            <Link href={lp('/')}>{tl(locale, 'article.home')}</Link><span className="sep">/</span>
            <Link href={lp('/blog')}>{tl(locale, 'nav.blog')}</Link><span className="sep">/</span><span className="cur">{label}</span>
          </nav>
          <span className="kicker"><span className={`tag ${catClass(categorie)}`} style={{ padding: '3px 10px' }}><span className="pip" />{w.kicker}</span></span>
          <h1>{label}</h1>
          <div className="meta"><span>{countLabel}</span></div>
        </div>
      </header>

      <div className="filter-bar">
        <div className="wrap">
          <Link href={lp('/blog')} className="chip">{tl(locale, 'blog.filterAll')}</Link>
          {categories.map(({ slug, label: lbl }) => (
            <Link key={slug} href={lp(`/blog/${slug}`)} className={`chip${slug === categorie ? ' on' : ''}`}>
              <span className="pip" style={{ background: `var(--cat-${CAT_INDEX[slug] ?? 1})` }} />{lbl}
            </Link>
          ))}
        </div>
      </div>

      {/* Editorial : une-à-la-une + petit fil (style home « fil ») */}
      {lead && (
        <section className="fil-hero" style={{ paddingTop: 28 }}>
          <div className="wrap">
            <div className="fil-feature">
              <Link href={href(lead)} className="ffeat on">
                <Cover a={lead} fill locale={locale} />
                <div className="body">
                  <span className="flag"><span className={`tag ${catClass(lead.categorie)}`}><span className="pip" />{label}</span></span>
                  <h2>{lead.title}</h2>
                  {lead.description && <p>{lead.description}</p>}
                  <div className="meta">{fmt(lead.publishedAt)} · {lead.readingTimeMin} min</div>
                </div>
              </Link>
            </div>

            <aside className="fil-live-col">
              <div className="fil-live-head"><span className="fil-pdot" /> {w.feed} · {label}</div>
              <div className="fl-list">
                <div className="fl-track">
                  {(feed.length ? [...feed, ...feed] : []).map((a, i) => {
                    const dup = i >= feed.length
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
                <Link href={lp(`/blog/${categorie}`)}>{tl(locale, 'home.seeAll')} <Arrow /></Link>
              </div>
            </aside>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: lead ? 24 : 48 }}>
        <div className="wrap">
          <div className="posts">
            {grid.map((a) => (
              <Link key={a.slug} href={href(a)} className="post">
                <div className="post-img" style={{ position: 'relative', overflow: 'hidden' }}><Cover a={a} locale={locale} /></div>
                <div className="post-body">
                  <h3>{a.title}</h3>
                  {a.description && <p>{a.description}</p>}
                  <div className="post-meta">{fmt(a.publishedAt)} · {a.readingTimeMin} min</div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={lp(`/blog/${categorie}`)} locale={locale} />
          </div>
        </div>
      </section>
    </main>
  )
}
