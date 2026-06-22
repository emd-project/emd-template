/**
 * /en/auteurs/[slug] — author page (EN mirror). JSON-LD Person. ISR 86400s.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuthorCard } from '@/components/ui/AuthorCard'
import { niche } from '@/niche.config'

export const revalidate = 86400

type AuthorData = { slug: string; name: string; role: string; bio: string; longBio: string[]; url: string }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

/** SEO description = bio truncated to ~155 chars (word-safe), never the full bio. */
function metaDescription(bio: string): string {
  if (bio.length <= 155) return bio
  return bio.slice(0, 152).replace(/\s+\S*$/, '').trimEnd() + '…'
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
      url: `${SITE_URL}/en/auteurs/${niche.author.slug}`,
    },
  }
}

export function generateStaticParams() {
  return Object.keys(getAuthors()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const author = getAuthors()[slug]
  if (!author) return {}
  const description = metaDescription(author.bio)
  return {
    title: `${author.name} — ${author.role} | ${niche.siteName}`,
    description,
    alternates: {
      canonical: `${SITE_URL}/en/auteurs/${slug}`,
      languages: {
        fr: `${SITE_URL}/auteurs/${slug}`,
        en: `${SITE_URL}/en/auteurs/${slug}`,
        'x-default': `${SITE_URL}/auteurs/${slug}`,
      },
    },
    openGraph: { title: `${author.name} — ${author.role}`, description, url: `${SITE_URL}/en/auteurs/${slug}`, siteName: niche.siteName, type: 'profile', locale: 'en' },
  }
}

export default async function AuthorPageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = getAuthors()[slug]
  if (!author) notFound()

  const initial = author.name.charAt(0).toUpperCase()
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: author.name, url: author.url, jobTitle: author.role, description: author.bio,
    worksFor: { '@type': 'Organization', name: niche.siteName, url: `${SITE_URL}/en` },
  }

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
        <div className="wrap">
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 28, fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 18vw, 220px)', fontWeight: 800, color: 'var(--ink)', opacity: 0.05, lineHeight: 0.85, pointerEvents: 'none', userSelect: 'none' }}>
            {initial}
          </span>
          <span className="eyebrow" style={{ marginBottom: 16 }}>The team</span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 8, position: 'relative' }}>{author.name}</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 40, position: 'relative' }}>{author.role}</p>

          <AuthorCard authorSlug={author.slug} authorName={author.name} bio={author.bio} variant="full" locale="en" />
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 24 }}>Why this site?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {author.longBio.map((p, i) => (
              <p key={i} style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.75 }}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
