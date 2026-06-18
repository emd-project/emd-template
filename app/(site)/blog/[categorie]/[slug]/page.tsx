/**
 * /blog/[categorie]/[slug] — article MDX, structure Voltéo.
 * art-hero (sans image de fond générée — plafond images) + corps 2 colonnes
 * (sommaire sticky + prose MDX) + related + carte auteur. Wiring MDX/SEO préservé.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { remarkAmazonAffiliate } from '@/lib/plugins/remarkAmazonAffiliate'
import { processShortcodes } from '@/lib/content/shortcodes'
import { getAllArticles, getArticleRaw, articleExists, getRelatedArticles, articleHref, formatDate } from '@/lib/blog'
import { articleSlugFrToEn } from '@/lib/i18n/article-slugs'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`
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
      table: ({ children }: { children: ReactNode }) => (
        <div className="table-scroll-wrap"><table>{children}</table></div>
      ),
    },
  })
  const related = getRelatedArticles(categorie, slug, 3)
  const catLabel = CATEGORY_LABELS[categorie] ?? categorie
  const catCls = `c${CAT_INDEX[categorie] ?? 1}`

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

          {/* Hero article (sobre, sans image de fond générée) */}
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
              <div style={{ marginTop: 24 }}>
                <AuthorByline
                  authorSlug={niche.author.slug || 'auteur'}
                  authorName={niche.author.name || 'Auteur'}
                  publishedAt={meta.publishedAt}
                  updatedAt={meta.updatedAt}
                  readingTimeMin={meta.readingTimeMin}
                />
              </div>
            </div>
          </header>

          {/* Corps : sommaire + prose */}
          <div className="section" style={{ paddingTop: 48 }}>
            <div className="art-wrap">

              {/* Sommaire sticky */}
              <aside className="toc">
                <div className="toc-title">{t('sidebar.tocTitle')}</div>
                <ul>
                  {meta.aiSummary && meta.aiSummary.length > 0 && <li><a href="#en-bref" className="sidebar-toc-link">{t('sidebar.tocSummary')}</a></li>}
                  {meta.faq && meta.faq.length > 0 && <li><a href="#faq-section" className="sidebar-toc-link">{t('sidebar.tocFaq')}</a></li>}
                  {related.length > 0 && <li><a href="#related-section" className="sidebar-toc-link">{t('sidebar.tocRelated')}</a></li>}
                </ul>
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
