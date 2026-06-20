/**
 * ArticleView — rendu d'un article MDX, UNIQUE et LOCALE-AWARE (FR + EN).
 * Server Component async (compile le MDX). Remplace la logique dupliquée des
 * routes FR et EN : tout le « chrome » passe par tl(locale, …) → plus aucune
 * chaîne en dur à traduire. La VARIANTE (classic|feature) est pilotée par une
 * classe CSS sur <article> ; le pipeline MDX/SEO est inchangé.
 *
 * Les routes restent responsables de : data loading (lecteurs FR/EN), notFound,
 * generateMetadata, generateStaticParams. Elles passent meta/content/related ici.
 */
import Link from 'next/link'
import Image from 'next/image'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import type { ComponentProps, ReactNode } from 'react'
import { remarkAmazonAffiliate } from '@/lib/plugins/remarkAmazonAffiliate'
import { processShortcodes } from '@/lib/content/shortcodes'
import { type ArticleMeta } from '@/lib/blog'
import { articleHrefL, formatDateL } from '@/lib/blog-l10n'
import { extractHeadings, slugify, type TocItem } from '@/lib/utils/headings'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { resolveArticleVariant, type ArticleVariant } from '@/lib/variants'
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  niche.categories.map((c, i) => [c.slug, (i % 5) + 1])
)
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  niche.categories.map((c) => [c.slug, c.label])
)

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props?: { children?: ReactNode } }).props?.children)
  }
  return ''
}

export async function ArticleView({
  locale = niche.defaultLocale,
  variant,
  categorie,
  slug,
  meta,
  content,
  related,
}: {
  locale?: string
  variant?: ArticleVariant
  categorie: string
  slug: string
  meta: ArticleMeta
  content: string
  related: ArticleMeta[]
}) {
  const v = variant ?? resolveArticleVariant()
  const isEn = locale !== niche.defaultLocale
  const lp = (p: string) => localePath(locale, p)
  const base = lp(`/blog/${categorie}/${slug}`)
  const url = `${SITE_URL}${base}`
  const authorName = niche.author.name || (isEn ? 'Author' : 'Auteur')

  const { content: mdxContent } = await compileMDX({
    source: processShortcodes(content),
    options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkAmazonAffiliate] } },
    components: {
      Tip,
      Warning: (mp: ComponentProps<typeof Warning>) => <Warning {...mp} locale={locale} />,
      Verdict,
      ProConTable: (mp: ComponentProps<typeof ProConTable>) => <ProConTable {...mp} locale={locale} />,
      PullQuote, StatCard, StatRow,
      CompareBar, CompareBarGroup,
      ProductCTA: (mp: ComponentProps<typeof ProductCTA>) => <ProductCTA {...mp} locale={locale} />,
      ArticleImage,
      ProductCarousel: (mp: ComponentProps<typeof ProductCarousel>) => <ProductCarousel {...mp} locale={locale} />,
      h2: ({ children }: { children?: ReactNode }) => <h2 id={slugify(nodeText(children))}>{children}</h2>,
      h3: ({ children }: { children?: ReactNode }) => <h3 id={slugify(nodeText(children))}>{children}</h3>,
      table: ({ children }: { children: ReactNode }) => (
        <div className="table-scroll-wrap"><table>{children}</table></div>
      ),
    },
  })

  const catLabel = CATEGORY_LABELS[categorie] ?? categorie
  const catCls = `c${CAT_INDEX[categorie] ?? 1}`
  const hasHeroImage = Boolean(meta.featureImage)

  const tocItems: TocItem[] = [
    ...(meta.aiSummary && meta.aiSummary.length > 0 ? [{ id: 'en-bref', text: tl(locale, 'sidebar.tocSummary'), level: 2 } as TocItem] : []),
    ...extractHeadings(content),
    ...(meta.faq && meta.faq.length > 0 ? [{ id: 'faq-section', text: tl(locale, 'sidebar.tocFaq'), level: 2 } as TocItem] : []),
    ...(related.length > 0 ? [{ id: 'related-section', text: tl(locale, 'sidebar.tocRelated'), level: 2 } as TocItem] : []),
  ]

  const byline = (
    <AuthorByline
      authorSlug={niche.author.slug || 'auteur'}
      authorName={authorName}
      publishedAt={meta.publishedAt}
      updatedAt={meta.updatedAt}
      readingTimeMin={meta.readingTimeMin}
      locale={locale}
    />
  )

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: tl(locale, 'article.home'), item: `${SITE_URL}${lp('/')}` },
        { '@type': 'ListItem', position: 2, name: tl(locale, 'nav.blog'), item: `${SITE_URL}${lp('/blog')}` },
        { '@type': 'ListItem', position: 3, name: catLabel, item: `${SITE_URL}${lp(`/blog/${categorie}`)}` },
        { '@type': 'ListItem', position: 4, name: meta.title, item: url },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: meta.title, description: meta.description,
      datePublished: meta.publishedAt, dateModified: meta.updatedAt ?? meta.publishedAt,
      inLanguage: locale,
      url,
      author: {
        '@type': 'Person', name: authorName,
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
        <article className={`art-v-${v}`}>

          {hasHeroImage ? (
            <>
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
                  <nav className="crumb" aria-label={tl(locale, 'nav.mainNav')} style={{ color: 'rgba(255,255,255,0.82)' }}>
                    <Link href={lp('/')} style={{ color: 'inherit' }}>{tl(locale, 'article.home')}</Link><span className="sep">/</span>
                    <Link href={lp('/blog')} style={{ color: 'inherit' }}>{tl(locale, 'nav.blog')}</Link><span className="sep">/</span>
                    <Link href={lp(`/blog/${categorie}`)} style={{ color: 'inherit' }}>{catLabel}</Link>
                  </nav>
                  <div className="flag" style={{ marginTop: 12 }}><span className={`tag ${catCls}`}><span className="pip" />{catLabel}</span></div>
                  <h1 style={{ color: '#fff', marginTop: 12 }}>{meta.title}</h1>
                  {meta.description && <p className="standfirst" style={{ color: 'rgba(255,255,255,0.9)' }}>{meta.description}</p>}
                </div>
              </header>
              <div className="wrap" style={{ paddingTop: 20 }}>{byline}</div>
            </>
          ) : (
            <header className="art-hero">
              <div className="wrap">
                <nav className="crumb" aria-label={tl(locale, 'nav.mainNav')}>
                  <Link href={lp('/')}>{tl(locale, 'article.home')}</Link><span className="sep">/</span>
                  <Link href={lp('/blog')}>{tl(locale, 'nav.blog')}</Link><span className="sep">/</span>
                  <Link href={lp(`/blog/${categorie}`)}>{catLabel}</Link>
                </nav>
                <div className="flag"><span className={`tag ${catCls}`}><span className="pip" />{catLabel}</span></div>
                <h1>{meta.title}</h1>
                {meta.description && <p className="standfirst">{meta.description}</p>}
                <div style={{ marginTop: 24 }}>{byline}</div>
              </div>
            </header>
          )}

          <div className="section" style={{ paddingTop: hasHeroImage ? 28 : 48 }}>
            <div className="art-wrap">

              <aside className="toc">
                <TableOfContents items={tocItems} title={tl(locale, 'sidebar.tocTitle')} />
                {niche.comparator.enabled && !isEn && (
                  <div className="toc-cta">
                    <p>{tl(locale, 'sidebar.toolPromo', { label: catLabel })}</p>
                    <Link href={lp(`/comparer/${categorie}`)} className="btn btn-accent">{tl(locale, 'sidebar.toolPromoCta')}</Link>
                  </div>
                )}
              </aside>

              <div>
                {meta.aiSummary && meta.aiSummary.length > 0 && (
                  <section id="en-bref">
                    <AISummarize points={meta.aiSummary} articleTitle={meta.title} articleUrl={url} locale={locale} />
                  </section>
                )}

                <div className="prose-article">{mdxContent}</div>
                <AutoProductCTAs ctas={getCTAsForCategory(categorie)} locale={locale} />
                <ToolCTA categorie={categorie} locale={locale} />

                {meta.faq && meta.faq.length > 0 && (
                  <section id="faq-section" aria-labelledby="faq-titre" style={{ marginTop: 48 }}>
                    <h2 id="faq-titre" style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, marginBottom: 18 }}>{tl(locale, 'article.faq')}</h2>
                    <FaqAccordion items={meta.faq} />
                  </section>
                )}

                {related.length > 0 && (
                  <section id="related-section" className="related" style={{ marginTop: 48, background: 'transparent', padding: 0 }}>
                    <h2 style={{ fontSize: 'clamp(20px,2.5vw,24px)', fontWeight: 800, marginBottom: 18 }}>{tl(locale, 'article.relatedArticles')}</h2>
                    <div className="posts">
                      {related.map((a) => (
                        <Link key={`${a.categorie}/${a.slug}`} href={articleHrefL(locale, a)} className="post">
                          <div className="post-body">
                            <span className={`tag c${CAT_INDEX[a.categorie] ?? 1}`}><span className="pip" />{CATEGORY_LABELS[a.categorie] ?? a.categorie}</span>
                            <h3>{a.title}</h3>
                            <div className="post-meta">{formatDateL(locale, a.publishedAt)} · {a.readingTimeMin} min</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <div style={{ marginTop: 48 }}>
                  <AuthorCard
                    authorSlug={niche.author.slug || 'auteur'}
                    authorName={authorName}
                    bio={niche.author.bio || ''}
                    variant="inline"
                    locale={locale}
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      {meta.stickyCta && meta.stickyCta.length > 0 && (
        <StickyCTA items={meta.stickyCta} message={meta.stickyCtaMessage} locale={locale} />
      )}
    </>
  )
}
