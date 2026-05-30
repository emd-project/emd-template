/**
 * /blog/[categorie]/[slug] — article MDX.
 * Rendu serveur : AISummarize · AuthorByline · MDX content · FAQ · related · AuthorCard · JSON-LD.
 * next-mdx-remote/rsc pour le rendu MDX côté serveur (App Router).
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { remarkAmazonAffiliate } from '@/lib/plugins/remarkAmazonAffiliate'
import { processShortcodes } from '@/lib/content/shortcodes'
import { getAllArticles, getArticleRaw, articleExists, getRelatedArticles, articleHref } from '@/lib/blog'
import { currentYear } from '@/lib/utils/year'
import { niche, categoryAccent } from '@/niche.config'
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
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { StickyCTA } from '@/components/blog/StickyCTA'
import { FadeIn } from '@/components/motion/FadeIn'
import { addAffiliateTag } from '@/lib/utils/affiliate'
import type { ReactNode } from 'react'

export const revalidate = 86400

type Params = Promise<{ categorie: string; slug: string }>

export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map(({ categorie, slug }) => ({ categorie, slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie, slug } = await params
  if (!articleExists(categorie, slug)) return {}

  const { meta } = getArticleRaw(categorie, slug)
  const year = currentYear()

  return {
    title: `${meta.title} ${year} | ${niche.siteName}`,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/blog/${categorie}/${slug}`,
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
      ...(meta.featureImage ? {
        images: [{
          url: meta.featureImage.startsWith('/') ? `${SITE_URL}${meta.featureImage}` : meta.featureImage,
        }],
      } : {}),
    },
  }
}

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  niche.categories.map((c) => [c.slug, c.label])
)

export default async function ArticlePage({ params }: { params: Params }) {
  const { categorie, slug } = await params
  if (!articleExists(categorie, slug)) notFound()

  const { meta, content } = getArticleRaw(categorie, slug)
  const { content: mdxContent } = await compileMDX({
    source: processShortcodes(content),
    options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkAmazonAffiliate] } },
    components: {
      Tip,
      Warning,
      Verdict,
      ProConTable,
      PullQuote, StatCard, StatRow, CompareBar, CompareBarGroup, ProductCTA, ArticleImage, ProductCarousel,
      table: ({ children }: { children: ReactNode }) => (
        <div className="table-scroll-wrap">
          <table>{children}</table>
        </div>
      ),
    },
  })
  const related = getRelatedArticles(categorie, slug, 3)

  const catLabel = CATEGORY_LABELS[categorie] ?? categorie

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        {
          '@type': 'ListItem',
          position: 3,
          name: catLabel,
          item: `${SITE_URL}/blog/${categorie}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: meta.title,
          item: `${SITE_URL}/blog/${categorie}/${slug}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.title,
      description: meta.description,
      datePublished: meta.publishedAt,
      dateModified: meta.updatedAt ?? meta.publishedAt,
      url: `${SITE_URL}/blog/${categorie}/${slug}`,
      author: {
        '@type': 'Person',
        name: niche.author.name || 'Auteur',
        ...(niche.author.title ? { jobTitle: niche.author.title } : {}),
        ...(niche.author.slug ? { url: `${SITE_URL}/auteurs/${niche.author.slug}` } : {}),
        ...(niche.author.bio ? { description: niche.author.bio } : {}),
      },
      publisher: {
        '@type': 'Organization',
        name: niche.siteName,
        url: SITE_URL,
      },
    },
    ...(meta.faq && meta.faq.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: meta.faq.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ]
      : []),
  ]

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <ReadingProgress />
      <main id="main-content">
        <article>
          {/* Header — background image cinématique par catégorie + overlay + texte */}
          <div
            className="article-hero-band"
            style={{
              position: 'relative',
              overflow: 'hidden',
              minHeight: '520px',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            {/* Image de fond par catégorie */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
              }}
            >
              <ImagePlaceholder
                slotId={`blog-category-background-${categorie}`}
                priority
                fit="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Overlay sombre pour lisibilité */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.75) 60%, rgba(10,10,15,0.92) 100%)',
                zIndex: 1,
              }}
            />

          <header
            style={{
              maxWidth: '760px',
              margin: '0 auto',
              padding: 'var(--space-16) var(--space-6) var(--space-12)',
              position: 'relative',
              zIndex: 2,
              width: '100%',
            }}
          >
            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
              <ol
                style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  listStyle: 'none',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                }}
              >
                <li>
                  <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li>
                  <Link
                    href="/blog"
                    style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li style={{ color: 'var(--text-secondary)' }}>{catLabel}</li>
              </ol>
            </nav>

            {/* Category chip */}
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-1)',
                background: 'rgba(255,61,87,0.1)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {catLabel}
            </span>

            <h1
              style={{
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginBottom: 'var(--space-5)',
                textWrap: 'balance',
              }}
            >
              <Balancer>{meta.title}</Balancer>
            </h1>

            <AuthorByline
              authorSlug={niche.author.slug || 'auteur'}
              authorName={niche.author.name || 'Auteur'}
              publishedAt={meta.publishedAt}
              updatedAt={meta.updatedAt}
              readingTimeMin={meta.readingTimeMin}
            />
          </header>
          </div>{/* /article-hero-band */}

          {/* featureImage n'est plus affichée ici — elle sert uniquement à l'OpenGraph (partage social). */}

          {/* Body — 2-column layout: main + sidebar */}
          <div
            className="article-layout"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '0 var(--space-6) var(--space-12)',
            }}
          >
            {/* Main content */}
            <div style={{ maxWidth: '760px', minWidth: 0 }}>
              {/* AISummarize */}
              {meta.aiSummary && meta.aiSummary.length > 0 && (
                <section id="en-bref">
                  <AISummarize
                    points={meta.aiSummary}
                    articleTitle={meta.title}
                    articleUrl={`${SITE_URL}/blog/${categorie}/${slug}`}
                  />
                </section>
              )}

              {/* MDX content */}
              <div className="prose-article">{mdxContent}</div>
              <AutoProductCTAs ctas={getCTAsForCategory(categorie)} />

              {/* CTA outil contextuel */}
              <ToolCTA categorie={categorie} />

              {/* FAQ */}
              {meta.faq && meta.faq.length > 0 && (
                <section
                  id="faq-section"
                  aria-labelledby="faq-titre"
                  style={{ marginTop: 'var(--space-12)' }}
                >
                  <h2
                    id="faq-titre"
                    style={{
                      fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-6)',
                      textWrap: 'balance',
                    }}
                  >
                    <Balancer>Questions fréquentes</Balancer>
                  </h2>
                  <FaqAccordion items={meta.faq} />
                </section>
              )}

              {/* Continuer votre lecture */}
              {related.length > 0 && (
                <section
                  id="related-section"
                  aria-labelledby="related-titre"
                  style={{ marginTop: 'var(--space-12)' }}
                >
                  <h2
                    id="related-titre"
                    style={{
                      fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                      fontSize: 'clamp(18px, 2.5vw, 22px)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-5)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    <Balancer>{t('article.relatedArticles')}</Balancer>
                  </h2>
                  <ul
                    role="list"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                      listStyle: 'none',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    {related.map((a, i) => (
                      <li key={`${a.categorie}/${a.slug}`} style={{ borderBottom: '1px solid var(--border)' }}>
                        <Link
                          href={articleHref(a)}
                          className="related-link"
                          style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 'var(--space-4)',
                            padding: 'var(--space-4) 0',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--next-font-mono), monospace',
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                              flexShrink: 0,
                              minWidth: '24px',
                            }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--next-font-primary), system-ui, sans-serif',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                lineHeight: 1.35,
                              }}
                            >
                              {a.title}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {CATEGORY_LABELS[a.categorie] ?? a.categorie} · {a.readingTimeMin} min
                            </span>
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }} aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* AuthorCard */}
              <div style={{ marginTop: 'var(--space-12)' }}>
                <AuthorCard
                  authorSlug={niche.author.slug || 'auteur'}
                  authorName={niche.author.name || 'Auteur'}
                  bio={niche.author.bio || ''}
                  variant="inline"
                />
              </div>
            </div>

            {/* Sidebar */}
            <aside
              className="article-sidebar"
              style={{
                position: 'sticky',
                top: '80px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-8)',
                paddingTop: 'var(--space-6)',
              }}
            >
              {/* Table of Contents */}
              <FadeIn delay={100}>
                <nav aria-label={t('sidebar.tocTitle')}>
                  <p
                    style={{
                      fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    {t('sidebar.tocTitle')}
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {meta.aiSummary && meta.aiSummary.length > 0 && (
                      <li>
                        <a href="#en-bref" className="sidebar-toc-link">
                          {t('sidebar.tocSummary')}
                        </a>
                      </li>
                    )}
                    {meta.faq && meta.faq.length > 0 && (
                      <li>
                        <a href="#faq-section" className="sidebar-toc-link">
                          {t('sidebar.tocFaq')}
                        </a>
                      </li>
                    )}
                    {related.length > 0 && (
                      <li>
                        <a href="#related-section" className="sidebar-toc-link">
                          {t('sidebar.tocRelated')}
                        </a>
                      </li>
                    )}
                  </ul>
                </nav>
              </FadeIn>

              {/* Product CTAs (if stickyCta exists) */}
              {meta.stickyCta && meta.stickyCta.length > 0 && (
                <FadeIn delay={200}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                    }}
                  >
                    {meta.stickyCta.map((item, i) => {
                      const isAmazon = item.url.includes('amazon.fr') || item.url.includes('amzn.to')
                      const href = isAmazon ? addAffiliateTag(item.url) : item.url
                      return (
                        <a
                          key={i}
                          href={href}
                          rel={isAmazon ? 'nofollow sponsored noopener' : 'noopener'}
                          target="_blank"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            transition: 'border-color var(--duration) var(--ease-out)',
                          }}
                          className="product-affiliate"
                        >
                          <span
                            style={{
                              flex: 1,
                              fontSize: '13px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: 1.35,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--accent-1)',
                              letterSpacing: '0.02em',
                            }}
                          >
                            Voir →
                          </span>
                        </a>
                      )
                    })}
                  </div>
                </FadeIn>
              )}

              {/* Tool promo — comparateur/quiz for this category */}
              <FadeIn delay={300}>
                <Link
                  href={`/comparer/${categorie}`}
                  style={{
                    display: 'block',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    transition: 'border-color var(--duration) var(--ease-out)',
                  }}
                  className="tool-card"
                >
                  <p
                    style={{
                      fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-1)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {t('sidebar.toolPromo', { label: catLabel })}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {t('sidebar.toolPromoCta')}
                  </p>
                </Link>
              </FadeIn>

              {/* Author card mini */}
              <FadeIn delay={400}>
                <Link
                  href={`/auteurs/${niche.author.slug || 'auteur'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    borderTop: '1px solid var(--border)',
                    textDecoration: 'none',
                  }}
                >
                  {/* Monogram */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, rgba(255,61,87,0.15) 0%, rgba(123,97,255,0.10) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                        fontSize: 13,
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                        opacity: 0.85,
                      }}
                    >
                      {(niche.author.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                      }}
                    >
                      {niche.author.name || 'Auteur'}
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        lineHeight: 1.3,
                      }}
                    >
                      {t('authorCard.viewProfile')}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            </aside>
          </div>
        </article>
      </main>

      {/* Sticky CTA */}
      {meta.stickyCta && meta.stickyCta.length > 0 && (
        <StickyCTA
          items={meta.stickyCta}
          message={meta.stickyCtaMessage}
        />
      )}
    </>
  )
}
