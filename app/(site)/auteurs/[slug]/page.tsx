/**
 * Page auteur — ISR 86400s. JSON-LD Person. Style Voltéo. Server Component.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuthorCard } from '@/components/ui/AuthorCard'
import { niche } from '@/niche.config'

export const revalidate = 86400

type AuthorData = { slug: string; name: string; role: string; bio: string; longBio: string[]; url: string }

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

export function generateStaticParams() {
  return Object.keys(getAuthors()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const author = getAuthors()[slug]
  if (!author) return {}
  return {
    title: `${author.name} — ${author.role} | ${niche.siteName}`,
    description: author.bio,
    alternates: { canonical: author.url },
    openGraph: { title: `${author.name} — ${author.role}`, description: author.bio, url: author.url, siteName: niche.siteName, type: 'profile' },
  }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = getAuthors()[slug]
  if (!author) notFound()

  const initial = author.name.charAt(0).toUpperCase()
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: author.name, url: author.url, jobTitle: author.role, description: author.bio,
    worksFor: { '@type': 'Organization', name: niche.siteName, url: `https://${niche.domain}` },
  }

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
        <div className="wrap">
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 28, fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 18vw, 220px)', fontWeight: 800, color: 'var(--ink)', opacity: 0.05, lineHeight: 0.85, pointerEvents: 'none', userSelect: 'none' }}>
            {initial}
          </span>
          <span className="eyebrow" style={{ marginBottom: 16 }}>L&rsquo;équipe</span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 8, position: 'relative' }}>{author.name}</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 40, position: 'relative' }}>{author.role}</p>

          <AuthorCard authorSlug={author.slug} authorName={author.name} bio={author.bio} variant="full" />
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 24 }}>Pourquoi ce site ?</h2>
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
