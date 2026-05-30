/**
 * Page auteur — ISR 86400s (revalidate 1 jour).
 * JSON-LD Person schema.
 * DA : filigrane typographique + AuthorCard variant "full".
 * Params asynchrones : await params (Next.js 15+).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Balancer from 'react-wrap-balancer'
import { AuthorCard } from '@/components/ui/AuthorCard'
import { niche } from '@/niche.config'

export const revalidate = 86400

/* ------------------------------------------------------------------ */
/* Données statiques depuis niche.config                               */
/* ------------------------------------------------------------------ */

type AuthorData = {
  slug: string
  name: string
  role: string
  bio: string
  longBio: string[]
  url: string
}

function getAuthors(): Record<string, AuthorData> {
  if (!niche.author.slug) return {}
  return {
    [niche.author.slug]: {
      slug: niche.author.slug,
      name: niche.author.name,
      role: niche.author.title,
      bio: niche.author.bio,
      longBio: [niche.author.bio],
      url: `https://${niche.domain}/auteurs/${niche.author.slug}`,
    },
  }
}

/* ------------------------------------------------------------------ */
/* generateStaticParams                                                 */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return Object.keys(getAuthors()).map((slug) => ({ slug }))
}

/* ------------------------------------------------------------------ */
/* Metadata                                                             */
/* ------------------------------------------------------------------ */

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const author = getAuthors()[slug]
  if (!author) return {}

  return {
    title: `${author.name} — ${author.role} | ${niche.siteName}`,
    description: author.bio,
    alternates: { canonical: author.url },
    openGraph: {
      title: `${author.name} — ${author.role}`,
      description: author.bio,
      url: author.url,
      siteName: niche.siteName,
      type: 'profile',
    },
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default async function AuthorPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const author = getAuthors()[slug]
  if (!author) notFound()

  const initial = author.name.charAt(0).toUpperCase()

  /* JSON-LD Person */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: author.url,
    jobTitle: author.role,
    description: author.bio,
    worksFor: {
      '@type': 'Organization',
      name: niche.siteName,
      url: `https://${niche.domain}`,
    },
  }

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero auteur avec watermark */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'var(--space-20) var(--space-6) var(--space-16)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Filigrane initial — DA signature */}
        <span
          aria-hidden="true"
          className="section-watermark"
          style={{
            position: 'absolute',
            top: 0,
            right: 'var(--space-6)',
            lineHeight: 0.85,
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          }}
        >
          {initial}
        </span>

        {/* Eyebrow */}
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent-1)',
            marginBottom: 'var(--space-4)',
            position: 'relative',
          }}
        >
          L&rsquo;équipe
        </p>

        <h1
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '0',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: 'var(--space-3)',
            position: 'relative',
          }}
        >
          <Balancer>{author.name}</Balancer>
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-12)',
            position: 'relative',
          }}
        >
          {author.role}
        </p>

        {/* AuthorCard full */}
        <AuthorCard
          authorSlug={author.slug}
          authorName={author.name}
          bio={author.bio}
          variant="full"
        />
      </div>

      {/* Biographie longue */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 var(--space-6) var(--space-20)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '0',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Balancer>Pourquoi ce site ?</Balancer>
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {author.longBio.map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontSize: '16px',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </main>
  )
}
