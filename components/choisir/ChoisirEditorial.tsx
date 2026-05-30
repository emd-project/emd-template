/**
 * ChoisirEditorial — Server Component
 * Renders editorial content (TL;DR, sections, FAQ, author) for /choisir/[produit].
 */

import Link from 'next/link'
import { AuthorByline } from '@/components/ui/AuthorByline'
import { AuthorCard } from '@/components/ui/AuthorCard'
import { AffiliateLink } from '@/components/ui/AffiliateLink'
import { COMPARATEURS } from '@/lib/comparateur'
import { niche } from '@/niche.config'
import type { ChoisirProductContent } from '@/lib/choisir-content'

type Props = {
  content: ChoisirProductContent
  produit: string
  publishedAt: string
}

/** Resolve Amazon URL from comparateur data by matching model name in card title. */
function findAmazonUrl(produit: string, modeleName: string): string | null {
  const data = COMPARATEURS[produit]
  if (!data) return null
  const modele = data.modeles.find((m) => modeleName.includes(m.nom) || m.nom.includes(modeleName))
  return modele?.amazonUrl || 'https://amzn.to/4c4vSyD'
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--space-10)',
}

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--next-font-display), system-ui, sans-serif',
  fontSize: 'clamp(20px, 3vw, 28px)',
  fontWeight: 800,
  color: 'var(--text-primary)',
  lineHeight: 1.2,
  marginBottom: 'var(--space-4)',
  textWrap: 'balance',
}

const pStyle: React.CSSProperties = {
  fontSize: 'clamp(15px, 1.8vw, 17px)',
  color: 'var(--text-secondary)',
  lineHeight: 1.7,
  marginBottom: 'var(--space-4)',
}

export function ChoisirEditorial({ content, produit, publishedAt }: Props) {
  return (
    <article
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-6) var(--space-4)',
      }}
    >
      {/* Byline */}
      <AuthorByline
        authorSlug={niche.author.slug}
        authorName={niche.author.name}
        publishedAt={publishedAt}
        readingTimeMin={5}
      />

      {/* TL;DR */}
      <div
        style={{
          borderTop: '2px solid var(--accent-4)',
          borderBottom: '1px solid var(--border)',
          paddingTop: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
          marginTop: 'var(--space-6)',
          marginBottom: 'var(--space-10)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--next-font-mono), monospace',
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: 'var(--accent-4)',
            display: 'block',
            marginBottom: 'var(--space-3)',
          }}
        >
          En bref
        </span>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {content.tldr.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 'var(--space-3)', ...pStyle, marginBottom: 0 }}>
              <span style={{ color: 'var(--accent-4)', flexShrink: 0, fontWeight: 700 }} aria-hidden="true">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sections */}
      {content.sections.map((section) => (
        <section key={section.id} id={section.id} style={sectionStyle}>
          <h2 style={h2Style}>{section.title}</h2>
          <p style={pStyle}>{section.intro}</p>

          {section.table && (
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
              }}
            >
              {section.table.rows.map((row, ri) => {
                const amazonUrl = findAmazonUrl(produit, row[1])
                return (
                  <div key={ri} className="comparateur-card-wrap">
                    <div
                      style={{
                        padding: 'var(--space-4) var(--space-5)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--next-font-display), system-ui, sans-serif' }}>
                          {row[1]}
                        </span>
                        <span style={{ fontSize: '14px', fontFamily: 'var(--next-font-mono), monospace', color: 'var(--accent-1)', fontWeight: 600 }}>
                          {row[2]}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 'var(--space-1)' }}>
                        {row[0]}
                      </div>
                      {row[3] && (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                          {row[3]}
                        </p>
                      )}
                      {amazonUrl && (
                        <AffiliateLink
                          href={amazonUrl}
                          style={{
                            display: 'inline-block',
                            marginTop: 'var(--space-3)',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--accent-2)',
                            textDecoration: 'none',
                            borderBottom: '1px solid rgba(255,210,63,0.35)',
                            paddingBottom: '1px',
                          }}
                        >
                          Voir le prix sur Amazon →
                        </AffiliateLink>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {section.paragraphs?.map((p, i) => (
            <p key={i} style={pStyle}>{p}</p>
          ))}

          {section.tip && (
            <aside
              role="note"
              style={{
                margin: 'var(--space-4) 0',
                paddingLeft: 'var(--space-8)',
                position: 'relative',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '1px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--accent-3)',
                  lineHeight: 1.7,
                }}
              >
                →
              </span>
              <p style={{ ...pStyle, marginBottom: 0 }}>
                {section.tip}
              </p>
            </aside>
          )}

          {section.internalLink && (
            <Link
              href={section.internalLink.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--accent-1)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,61,87,0.35)',
                paddingBottom: '2px',
              }}
            >
              {section.internalLink.text} →
            </Link>
          )}
        </section>
      ))}

      {/* FAQ */}
      <ChoisirFAQ faq={content.faq} />

      {/* Author */}
      <div style={{ marginTop: 'var(--space-10)' }}>
        <AuthorCard
          authorSlug={niche.author.slug}
          authorName={niche.author.name}
          bio={niche.author.bio}
          variant="inline"
        />
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// FAQ sub-component + JSON-LD
// ---------------------------------------------------------------------------
function ChoisirFAQ({ faq }: { faq: Props['content']['faq'] }) {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <section id="faq" style={sectionStyle}>
      <h2 style={h2Style}>Questions fréquentes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {faq.map((item, i) => (
          <div
            key={i}
            style={{
              padding: 'var(--space-5) 0',
              borderBottom: i < faq.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--next-font-primary), system-ui, sans-serif',
                fontSize: 'clamp(15px, 2vw, 17px)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
                lineHeight: 1.4,
              }}
            >
              {item.q}
            </h3>
            <p style={{ ...pStyle, marginBottom: 0, color: 'var(--text-muted)' }}>{item.a}</p>
          </div>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  )
}
