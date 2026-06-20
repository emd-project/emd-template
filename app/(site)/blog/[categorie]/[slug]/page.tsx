/**
 * /blog/[categorie]/[slug] — article MDX, structure Voltéo.
 * En-tête : bandeau visuel (image + dégradé) si l'article a une `featureImage`,
 * sinon en-tête sobre (pas de placeholder rayé). Corps 2 colonnes (sommaire sticky
 * + prose MDX) + related + carte auteur. Wiring MDX/SEO préservé.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { remarkAmazonAffiliate } from '@/lib/plugins/remarkAmazonAffiliate'
import { processShortcodes } from '@/lib/content/shortcodes'
import { getAllArticles, getArticleRaw, articleExists, getRelatedArticles, articleHref, formatDate } from '@/lib/blog'
import { articleSlugFrToEn } from '@/lib/i18n/article-slugs'
import { currentYear } from '@/lib/utils/year'
import { extractHeadings, slugify, type TocItem } from '@/lib/utils/headings'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`
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

export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map(({ categorie, slug }) => ({ categorie, slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie, slug } = await params
  if (!articleExists(categorie, slug)) return {}
  const { meta } = getArticleRaw(categorie, slug)
  const year = currentYear()

  // hreflang réciproque (bloc 4) : on n'émet l'alternate EN que si une traduction
  // est connue (articleSlugFrToEn). x-default = FR (canonique). Additif.
  const enSlug = articleSlugFrToEn[slug] ?? null
  const languages: Record<string, string> = {
    fr: `${SITE_URL}/blog/${categorie}/${slug}`,
    'x-default': `${SITE_URL}/blog/${categorie}/${slug}`,
  }
  if (enSlug) languages.en = `${SITE_URL}/en/blog/${categorie}/${enSlug}`

  return {
    title: `${meta.title} ${year} | ${niche.siteName}`,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/blog/${categorie}/${slug}`,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/blog/${categorie}/${slug}`,
      siteName: niche.siteName,
      type: 'article',
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt ?? meta.publishedAt,
      ...(niche.author.name ? { authors: [niche.author.name] } : {}),
      ...(meta.featureImage ? { images: [{ url: meta.featureImage.startsWith('/') ? `${SITE_URL}${meta.featureImage}` : meta.featureImage }] } : {}),
    },
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { categorie, slug } = await params
  if (!articleExists(categorie, slug)) notFound()

  const { meta, content } = getArticleRaw(categorie, slug)
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
  const related = getRelatedArticles(categorie, slug, 3)
  const catLabel = CATEGORY_LABELS[categorie] ?? categorie
  const catCls = `c${CAT_INDEX[categorie] ?? 1}`
  const hasHeroImage = Boolean(meta.featureImage)

  // Sommaire : ancres fixes (En bref) + sections de l'article (H2/H3) + FAQ + Liés.
  const tocItems: TocItem[] = [
    ...(meta.aiSummary && meta.aiSummary.length > 0 ? [{ id: 'en-bref', text: t('sidebar.tocSummary'), level: 2 } as TocItem] : []),
    ...extractHeadings(content),
    ...(meta.faq && meta.faq.length > 0 ? [{ id: 'faq-section', text: t('sidebar.tocFaq'), level: 2 } as TocItem] : []),
    ...(related.length > 0 ? [{ id: 'related-section', text: t('sidebar.tocRelated'), level: 2 } as TocItem] : []),
  ]

  const byline = (
    <AuthorByline
      authorSlug={niche.author.slug || 'auteur'}
      authorName={niche.author.name || 'Auteur'}
      publishedAt={meta.publishedAt}
      updatedAt={meta.updatedAt}
      readingTimeMin={meta.readingTimeMin}
    />
  )

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: catLabel, item: `${SITE_URL}/blog/${categorie}` },
        { '@type': 'ListItem', position: 4, name: meta.title, item: `${SITE_URL}/blog/${categorie}/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: meta.title, description: meta.description,
      datePublished: meta.publishedAt, dateModified: meta.updatedAt ?? meta.publishedAt,
      url: `${SITE_URL}/blog/${categorie}/${slug}`,
      author: {
        '@type': 'Person', name: niche.author.name || 'Auteur',
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

          {hasHeroImage ? (
            <>
              {/* Hero article — bandeau visuel : image + dégradé sombre, titre en blanc */}
              <header
                className="art-hero art-hero--image"
                style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(300px, 40vw, 440px)', display: 'flex', alignItems: 'flex-end' }}
              >
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                  <Image src={meta.featureImage as string} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
                </div>
                <div
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(10,10,15,0.30) 0%, rgba(10,10,15,0.66) 60%, rgba(10,10,15,0.88) 100%)' }}
                />
                <div className="wrap" style={{ position: 'relative', zIndex: 2, paddingTop: 32, paddingBottom: 36 }}>
                  <nav className="crumb" aria-label="Fil d'Ariane" style={{ color: 'rgba(255,255,255,0.82)' }}>
                    <Link href="/" style={{ color: 'inherit' }}>Accueil</Link><span className="sep">/</span>
                    <Link href="/blog" style={{ color: 'inherit' }}>Blog</Link><span className="sep">/</span>
                    <Link href={`/blog/${categorie}`} style={{ color: 'inherit' }}>{catLabel}</Link>
                  </nav>
                  <div className="flag" style={{ marginTop: 12 }}><span className={`tag ${catCls}`}><span className="pip" />{catLabel}</span></div>
                  <h1 style={{ color: '#fff', marginTop: 12 }}>{meta.title}</h1>
                  {meta.description && <p className="standfirst" style={{ color: 'rgba(255,255,255,0.9)' }}>{meta.description}</p>}
                </div>
              </header>
              <div className="wrap" style={{ paddingTop: 20 }}>{byline}</div>
            </>
          ) : (
            /* Hero article (sobre, sans image) */
            <header className="art-hero">
              <div className="wrap">
                <nav className="crumb" aria-label="Fil d'Ariane">
                  <Link href="/">Accueil</Link><span className="sep">/</span>
                  <Link href="/blog">Blog</Link><span className="sep">/</span>
                  <Link href={`/blog/${categorie}`}>{catLabel}</Link>
                </nav>
                <div className="flag"><span className={`tag ${catCls}`}><span className="pip" />{catLabel}</span></div>
                <h1>{meta.title}</h1>
                {meta.description && <p className="standfirst">{meta.description}</p>}
                <div style={{ marginTop: 24 }}>{byline}</div>
              </div>
            </header>
          )}

          {/* Corps : sommaire + prose */}
          <div className="section" style={{ paddingTop: hasHeroImage ? 28 : 48 }}>
            <div className="art-wrap">

              {/* Sommaire sticky */}
              <aside className="toc">
                <TableOfContents items={tocItems} title={t('sidebar.tocTitle')} />
                {niche.comparator.enabled && (
                  <div className="toc-cta">
                    <p>{t('sidebar.toolPromo', { label: catLabel })}</p>
                    <Link href={`/comparer/${categorie}`} className="btn btn-accent">{t('sidebar.toolPromoCta')}</Link>
                  </div>
                )}
              </aside>

              {/* Contenu */}
              <div>
                {meta.aiSummary && meta.aiSummary.length > 0 && (
                  <section id="en-bref">
                    <AISummarize points={meta.aiSummary} articleTitle={meta.title} articleUrl={`${SITE_URL}/blog/${categorie}/${slug}`} />
                  </section>
                )}

                <div className="prose-article">{mdxContent}</div>
                <AutoProductCTAs ctas={getCTAsForCategory(categorie)} />
                <ToolCTA categorie={categorie} />

                {meta.faq && meta.faq.length > 0 && (
                  <section id="faq-section" aria-labelledby="faq-titre" style={{ marginTop: 48 }}>
                    <h2 id="faq-titre" style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, marginBottom: 18 }}>Questions fréquentes</h2>
                    <FaqAccordion items={meta.faq} />
                  </section>
                )}

                {related.length > 0 && (
                  <section id="related-section" className="related" style={{ marginTop: 48, background: 'transparent', padding: 0 }}>
                    <h2 style={{ fontSize: 'clamp(20px,2.5vw,24px)', fontWeight: 800, marginBottom: 18 }}>{t('article.relatedArticles')}</h2>
                    <div className="posts">
                      {related.map((a) => (
                        <Link key={`${a.categorie}/${a.slug}`} href={articleHref(a)} className="post">
                          <div className="post-body">
                            <span className={`tag c${CAT_INDEX[a.categorie] ?? 1}`}><span className="pip" />{CATEGORY_LABELS[a.categorie] ?? a.categorie}</span>
                            <h3>{a.title}</h3>
                            <div className="post-meta">{formatDate(a.publishedAt)} · {a.readingTimeMin} min</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <div style={{ marginTop: 48 }}>
                  <AuthorCard
                    authorSlug={niche.author.slug || 'auteur'}
                    authorName={niche.author.name || 'Auteur'}
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
