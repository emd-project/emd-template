/**
 * /en/blog/[categorie]/[slug] — English article (MDX, Voltéo structure).
 * art-hero + 2-column body (sticky TOC + MDX prose) + related + author card.
 * MDX/SEO wiring mirrors the FR article page.
 *
 * i18n (block 2b) :
 *  - Readers use the EN mirror: getArticleRawEn / articleExistsEn / getRelatedArticlesEn.
 *  - generateStaticParams is bounded to EN articles actually present (empty → []).
 *  - Articles are indexable (no noindex).
 *  - hreflang: canonical EN; the FR alternate is resolved via articleSlugEnToFr
 *    (only emitted when a FR translation is known); x-default → FR when known,
 *    else EN self.
 *  - Copy is written in English inline (t() is locked to niche.defaultLocale = fr).
 *  - Internal hrefs are built under /en/blog (articleHref() emits FR /blog paths).
 *
 * i18n (block 2c) :
 *  - The sticky-TOC "Compare now" CTA targeted /en/comparer/[categorie], a route
 *    that does NOT exist yet → masked behind EN_COMPARATOR_ENABLED to avoid a dead
 *    link. Flip the flag to true (and ship /en/comparer) to restore it. FR behaviour
 *    is unaffected (this file is EN-only).
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { remarkAmazonAffiliate } from '@/lib/plugins/remarkAmazonAffiliate'
import { processShortcodes } from '@/lib/content/shortcodes'
import { getAllArticlesEn, getArticleRawEn, articleExistsEn, getRelatedArticlesEn, type ArticleMeta } from '@/lib/blog'
import { articleSlugEnToFr } from '@/lib/i18n/article-slugs'
import { extractHeadings, slugify, type TocItem } from '@/lib/utils/headings'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

/**
 * The EN comparator tree (/en/comparer/...) does not exist yet. Keep the TOC CTA
 * masked until it ships so the EN article emits zero dead links. FR is untouched.
 */
const EN_COMPARATOR_ENABLED = false
import { AISummarize } from '@/components/blog/AISummarize'
import { Tip } from '@/components/blog/Tip'
import { Warning } from '@/components/blog/Warning'
import { Verdict } from '@/components/blog/Verdict'
import { ProConTable } from '@/components/blog/ProConTable'
import { PullQuote } from '@/components/blog/PullQuote'
import { StatCard, StatRow } from '@/components/blog/StatCard'
import { CompareBar, CompareBarGroup } from '@/components/blog/CompareBar'
import { ToolCTA } from '@/components/blog/ToolCTA'
import { ProductCTA } from '@/components/blog/ProductCTA'
import { ArticleImage } from '@/components/blog/ArticleImage'
import { AutoProductCTAs } from '@/components/blog/AutoProductCTAs'
import { ProductCarousel } from '@/components/blog/ProductCarousel'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { FaqAccordion } from '@/components/blog/FaqAccordion'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { getCTAsForCategory } from '@/lib/article-ctas'
import { AuthorByline } from '@/components/ui/AuthorByline'
import { AuthorCard } from '@/components/ui/AuthorCard'
import { StickyCTA } from '@/components/blog/StickyCTA'
import type { ReactNode } from 'react'

export const revalidate = 86400

type Params = Promise<{ categorie: string; slug: string }>

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  niche.categories.map((c) => [c.slug, c.label])
)

/** Texte brut d'un noeud React (pour générer l'id d'un titre rendu). */
function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props?: { children?: ReactNode } }).props?.children)
  }
  return ''
}

/** EN date formatting (formatDate() in lib/blog is fr-FR only). */
const formatDateEn = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** EN article href (articleHref() emits FR /blog/... paths). */
const articleHrefEn = (a: ArticleMeta) => `/en/blog/${a.categorie}/${a.slug}`

export async function generateStaticParams() {
  const articles = getAllArticlesEn()
  return articles.map(({ categorie, slug }) => ({ categorie, slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie, slug } = await params
  if (!articleExistsEn(categorie, slug)) return {}
  const { meta } = getArticleRawEn(categorie, slug)

  // Reciprocal hreflang: only emit FR when a known translation exists.
  const frSlug = articleSlugEnToFr[slug] ?? null
  const frUrl = frSlug ? `${SITE_URL}/blog/${categorie}/${frSlug}` : null
  const languages: Record<string, string> = { en: `${SITE_URL}/en/blog/${categorie}/${slug}` }
  if (frUrl) {
    languages.fr = frUrl
    languages['x-default'] = frUrl
  } else {
    languages['x-default'] = `${SITE_URL}/en/blog/${categorie}/${slug}`
  }

  return {
    title: `${meta.title} | ${niche.siteName}`,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/en/blog/${categorie}/${slug}`,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/en/blog/${categorie}/${slug}`,
      siteName: niche.siteName,
      type: 'article',
      locale: 'en',
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt ?? meta.publishedAt,
      ...(niche.author.name ? { authors: [niche.author.name] } : {}),
      ...(meta.featureImage ? { images: [{ url: meta.featureImage.startsWith('/') ? `${SITE_URL}${meta.featureImage}` : meta.featureImage }] } : {}),
    },
  }
}

export default async function ArticlePageEn({ params }: { params: Params }) {
  const { categorie, slug } = await params
  if (!articleExistsEn(categorie, slug)) notFound()

  const { meta, content } = getArticleRawEn(categorie, slug)
  const { content: mdxContent } = await compileMDX({
    source: processShortcodes(content),
    options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkAmazonAffiliate] } },
    components: {
      Tip, Warning, Verdict, ProConTable, PullQuote, StatCard, StatRow,
      CompareBar, CompareBarGroup, ProductCTA, ArticleImage, ProductCarousel,
      h2: ({ children }: { children?: ReactNode }) => <h2 id={slugify(nodeText(children))}>{children}</h2>,
      h3: ({ children }: { children?: ReactNode }) => <h3 id={slugify(nodeText(children))}>{children}</h3>,
      table: ({ children }: { children: ReactNode }) => (
        <div className="table-scroll-wrap"><table>{children}</table></div>
      ),
    },
  })
  const related = getRelatedArticlesEn(categorie, slug, 3)
  const catLabel = CATEGORY_LABELS[categorie] ?? categorie
  const catCls = `c${CAT_INDEX[categorie] ?? 1}`

  // Sommaire (EN) : ancres fixes + sections de l'article (H2/H3) + FAQ + Related.
  const tocItems: TocItem[] = [
    ...(meta.aiSummary && meta.aiSummary.length > 0 ? [{ id: 'en-bref', text: 'In brief', level: 2 } as TocItem] : []),
    ...extractHeadings(content),
    ...(meta.faq && meta.faq.length > 0 ? [{ id: 'faq-section', text: 'FAQ', level: 2 } as TocItem] : []),
    ...(related.length > 0 ? [{ id: 'related-section', text: 'Related', level: 2 } as TocItem] : []),
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/en/blog` },
        { '@type': 'ListItem', position: 3, name: catLabel, item: `${SITE_URL}/en/blog/${categorie}` },
        { '@type': 'ListItem', position: 4, name: meta.title, item: `${SITE_URL}/en/blog/${categorie}/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: meta.title, description: meta.description,
      datePublished: meta.publishedAt, dateModified: meta.updatedAt ?? meta.publishedAt,
      inLanguage: 'en',
      url: `${SITE_URL}/en/blog/${categorie}/${slug}`,
      author: {
        '@type': 'Person', name: niche.author.name || 'Author',
        ...(niche.author.title ? { jobTitle: niche.author.title } : {}),
        ...(niche.author.slug ? { url: `${SITE_URL}/auteurs/${niche.author.slug}` } : {}),
        ...(niche.author.bio ? { description: niche.author.bio } : {}),
      },
      publisher: { '@type': 'Organization', name: niche.siteName, url: SITE_URL },
    },
    ...(meta.faq && meta.faq.length > 0 ? [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: meta.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }] : []),
  ]

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <ReadingProgress />
      <main id="main-content">
        <article>

          {/* Article hero (sober, no generated background image) */}
          <header className="art-hero">
            <div className="wrap">
              <nav className="crumb" aria-label="Breadcrumb">
                <Link href="/en">Home</Link><span className="sep">/</span>
                <Link href="/en/blog">Blog</Link><span className="sep">/</span>
                <Link href={`/en/blog/${categorie}`}>{catLabel}</Link>
              </nav>
              <div className="flag"><span className={`tag ${catCls}`}><span className="pip" />{catLabel}</span></div>
              <h1>{meta.title}</h1>
              {meta.description && <p className="standfirst">{meta.description}</p>}
              <div style={{ marginTop: 24 }}>
                <AuthorByline
                  authorSlug={niche.author.slug || 'auteur'}
                  authorName={niche.author.name || 'Author'}
                  publishedAt={meta.publishedAt}
                  updatedAt={meta.updatedAt}
                  readingTimeMin={meta.readingTimeMin}
                />
              </div>
            </div>
          </header>

          {/* Body: TOC + prose */}
          <div className="section" style={{ paddingTop: 48 }}>
            <div className="art-wrap">

              {/* Sticky TOC */}
              <aside className="toc">
                <TableOfContents items={tocItems} title="Contents" />
                {/* i18n (block 2c): masked until /en/comparer ships → no dead link. */}
                {EN_COMPARATOR_ENABLED && niche.comparator.enabled && (
                  <div className="toc-cta">
                    <p>Compare the best {catLabel} options.</p>
                    <Link href={`/en/comparer/${categorie}`} className="btn btn-accent">Compare now</Link>
                  </div>
                )}
              </aside>

              {/* Content */}
              <div>
                {meta.aiSummary && meta.aiSummary.length > 0 && (
                  <section id="en-bref">
                    <AISummarize points={meta.aiSummary} articleTitle={meta.title} articleUrl={`${SITE_URL}/en/blog/${categorie}/${slug}`} />
                  </section>
                )}

                <div className="prose-article">{mdxContent}</div>
                <AutoProductCTAs ctas={getCTAsForCategory(categorie)} />
                <ToolCTA categorie={categorie} />

                {meta.faq && meta.faq.length > 0 && (
                  <section id="faq-section" aria-labelledby="faq-titre" style={{ marginTop: 48 }}>
                    <h2 id="faq-titre" style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, marginBottom: 18 }}>Frequently asked questions</h2>
                    <FaqAccordion items={meta.faq} />
                  </section>
                )}

                {related.length > 0 && (
                  <section id="related-section" className="related" style={{ marginTop: 48, background: 'transparent', padding: 0 }}>
                    <h2 style={{ fontSize: 'clamp(20px,2.5vw,24px)', fontWeight: 800, marginBottom: 18 }}>Related articles</h2>
                    <div className="posts">
                      {related.map((a) => (
                        <Link key={`${a.categorie}/${a.slug}`} href={articleHrefEn(a)} className="post">
                          <div className="post-body">
                            <span className={`tag c${CAT_INDEX[a.categorie] ?? 1}`}><span className="pip" />{CATEGORY_LABELS[a.categorie] ?? a.categorie}</span>
                            <h3>{a.title}</h3>
                            <div className="post-meta">{formatDateEn(a.publishedAt)} · {a.readingTimeMin} min</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <div style={{ marginTop: 48 }}>
                  <AuthorCard
                    authorSlug={niche.author.slug || 'auteur'}
                    authorName={niche.author.name || 'Author'}
                    bio={niche.author.bio || ''}
                    variant="inline"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      {meta.stickyCta && meta.stickyCta.length > 0 && (
        <StickyCTA items={meta.stickyCta} message={meta.stickyCtaMessage} />
      )}
    </>
  )
}
