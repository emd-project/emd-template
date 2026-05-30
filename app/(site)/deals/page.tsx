/**
 * /deals — Page Deals.
 * DA : watermark numéros --accent-2 oversize opacity 0.05 · MarqueeStrip intégré.
 * ISR 900s (deals mis à jour fréquemment). Server Component.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { currentYear } from '@/lib/utils/year'
import { MarqueeStrip } from '@/components/effects/MarqueeStrip'
import { DealsGrid } from '@/components/deals/DealsGrid'
import { FaqAccordion } from '@/components/blog/FaqAccordion'
import { niche } from '@/niche.config'
import type { Deal } from '@/components/deals/DealsGrid'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 900

export function generateMetadata(): Metadata {
  const year = currentYear()
  const dealWord = niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)
  return {
    title: `${dealWord} ${year} — meilleures promos du moment | ${niche.siteName}`,
    description:
      `Les meilleures promos ${niche.entities} du moment. Sélection manuelle — pas de spam.`,
    alternates: { canonical: `${SITE_URL}/deals` },
    openGraph: {
      title: `${dealWord} ${year}`,
      description: `Meilleures promos ${niche.entities} sélectionnées manuellement.`,
      url: `${SITE_URL}/deals`,
      siteName: niche.siteName,
      type: 'website',
    },
  }
}

// Placeholder deals — will be populated by the init prompt
const DEALS: Deal[] = []

const MARQUEE_ITEMS = [
  'Sélection mise à jour chaque semaine',
  `Les meilleurs ${niche.dealWord} du moment`,
]

const FAQ_ITEMS = [
  {
    q: `Où trouver les meilleurs ${niche.dealWord} en ce moment ?`,
    a: `Sur ${niche.domain}/deals, on sélectionne manuellement les meilleures réductions chaque semaine. Pas de faux deals ni de prix gonflés avant promo — que des vraies baisses vérifiées.`,
  },
  {
    q: `Quand acheter au meilleur prix ?`,
    a: `Les meilleurs moments sont : le Black Friday (fin novembre), les soldes d'été et d'hiver, et juste après la sortie d'un nouveau modèle — l'ancien baisse immédiatement. Notre simulateur te montre les cycles de prix.`,
  },
  {
    q: `Les deals sur ${niche.defaultStore} sont-ils fiables ?`,
    a: `Oui. Les produits sont neufs, sous garantie, avec retour gratuit 30 jours. On vérifie chaque deal manuellement avant de le publier ici.`,
  },
  {
    q: 'Comment savoir si une réduction est une vraie promo ?',
    a: `On compare le prix affiché avec le prix officiel et l'historique des prix. Si le prix barré est gonflé artificiellement, on ne publie pas le deal.`,
  },
  {
    q: `Comment être alerté des prochains ${niche.dealWord} ?`,
    a: `Reviens régulièrement sur cette page — on la met à jour chaque semaine. Les deals les plus chauds sont marqués avec le badge HOT. Tu peux aussi consulter notre simulateur de prix pour savoir si c'est le bon moment d'acheter.`,
  },
]

const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Deals', item: `${SITE_URL}/deals` },
  ],
}

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function DealsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <main id="main-content">
        {/* Marquee strip — animation CSS */}
        <MarqueeStrip direction="left" speed="slow">
          {MARQUEE_ITEMS.map((item) => (
            <span
              key={item}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-6)',
              }}
            >
              <span style={{ color: 'var(--accent-2)', fontWeight: 800 }}>✦</span>
              {item}
            </span>
          ))}
        </MarqueeStrip>

        {/* Hero */}
        <section
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'var(--space-12) var(--space-6) var(--space-10)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Watermark DA */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '0',
              right: 'var(--space-4)',
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: 'clamp(120px, 18vw, 240px)',
              fontWeight: 800,
              color: 'var(--accent-2)',
              opacity: 0.05,
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            %
          </span>

          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
            <ol
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                listStyle: 'none',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              <li>
                <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" style={{ color: 'var(--text-secondary)' }}>
                Deals
              </li>
            </ol>
          </nav>

          <h1
            style={{
              fontFamily: 'var(--next-font-display), system-ui, sans-serif',
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-4)',
            }}
          >
            <Balancer>{niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)}</Balancer>
          </h1>
          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--text-secondary)',
              maxWidth: '520px',
              lineHeight: 1.6,
            }}
          >
            Sélection manuelle. Pas de deals sponsorisés, pas de prix gonflés avant promo.
            Que des vraies réductions vérifiées.
          </p>
        </section>

        {/* Liste deals */}
        <section
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 var(--space-6) var(--space-24)',
          }}
        >
          {DEALS.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '16px',
                padding: 'var(--space-16) var(--space-6)',
                lineHeight: 1.6,
              }}
            >
              Aucune promotion disponible pour le moment. Revenez bientôt !
            </p>
          ) : (
            <DealsGrid deals={DEALS} />
          )}

          {/* FAQ */}
          <section aria-labelledby="faq-deals" style={{ marginTop: 'var(--space-12)' }}>
            <h2
              id="faq-deals"
              style={{
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <Balancer>Questions fréquentes — {niche.dealWord}</Balancer>
            </h2>
            <FaqAccordion items={FAQ_ITEMS} />
          </section>

          <div
            style={{
              marginTop: 'var(--space-10)',
              padding: 'var(--space-5) var(--space-6)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>Liens affiliés :</strong> certains
            liens vers {niche.defaultStore} intègrent un tag affilié. Le prix que tu paies reste
            identique.{' '}
            <Link href="/mentions-legales" style={{ color: 'var(--accent-1)', textDecoration: 'none' }}>
              Mentions légales →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
