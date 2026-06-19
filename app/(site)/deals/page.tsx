/**
 * /deals — Page Deals (style Voltéo).
 * Hero + watermark % · MarqueeStrip · DealsGrid · FAQ. ISR 900s. Server Component.
 * Modèle EMD = MENTION, pas d'affiliation : promos/prix factuels, aucun lien affilié.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { MarqueeStrip } from '@/components/effects/MarqueeStrip'
import { DealsGrid } from '@/components/deals/DealsGrid'
import { FaqAccordion } from '@/components/blog/FaqAccordion'
import { niche } from '@/niche.config'
import type { Deal } from '@/components/deals/DealsGrid'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 900

export function generateMetadata(): Metadata {
  const year = currentYear()
  const dealWord = niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)
  return {
    title: `${dealWord} ${year} — meilleures promos du moment | ${niche.siteName}`,
    description: `Les meilleures promos ${niche.entities} du moment. Sélection manuelle — pas de spam.`,
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

const DEALS: Deal[] = []
const MARQUEE_ITEMS = ['Sélection mise à jour chaque semaine', `Les meilleurs ${niche.dealWord} du moment`]

const FAQ_ITEMS = [
  { q: `Où trouver les meilleurs ${niche.dealWord} en ce moment ?`, a: `Sur ${niche.domain}/deals, on sélectionne manuellement les meilleures réductions chaque semaine. Pas de faux deals ni de prix gonflés avant promo.` },
  { q: `Quand acheter au meilleur prix ?`, a: `Les meilleurs moments : le Black Friday, les soldes, et juste après la sortie d'un nouveau modèle — l'ancien baisse immédiatement.` },
  { q: `Comment vérifiez-vous les deals ?`, a: `On compare le prix affiché au prix officiel et à l'historique. Si le prix barré est gonflé, on ne publie pas. Sélection éditoriale indépendante, sans deal sponsorisé.` },
  { q: 'Comment savoir si une réduction est une vraie promo ?', a: `On compare le prix affiché avec le prix officiel et l'historique. Si le prix barré est gonflé, on ne publie pas.` },
]

const jsonLdBreadcrumb = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Deals', item: `${SITE_URL}/deals` },
  ],
}
const jsonLdFaq = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
}

export default function DealsPage() {
  const dealWord = niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <main id="main-content">
        <MarqueeStrip direction="left" speed="slow">
          {MARQUEE_ITEMS.map((item) => (
            <span key={item} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✦</span>{item}
            </span>
          ))}
        </MarqueeStrip>

        <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
          <div className="wrap">
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 28, fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 18vw, 240px)', fontWeight: 800, color: 'var(--primary)', opacity: 0.06, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>%</span>
            <nav className="crumb" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link><span className="sep">/</span><span className="cur">Deals</span>
            </nav>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 16 }}>{dealWord}</h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-2)', maxWidth: 520, lineHeight: 1.6 }}>
              Sélection manuelle. Pas de deals sponsorisés, pas de prix gonflés avant promo. Que des vraies réductions vérifiées.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            {DEALS.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 16, padding: '64px 24px', lineHeight: 1.6 }}>
                Aucune promotion disponible pour le moment. Revenez bientôt !
              </p>
            ) : (
              <DealsGrid deals={DEALS} />
            )}

            <section aria-labelledby="faq-deals" style={{ marginTop: 48 }}>
              <h2 id="faq-deals" style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--ink)', marginBottom: 24 }}>Questions fréquentes — {niche.dealWord}</h2>
              <FaqAccordion items={FAQ_ITEMS} />
            </section>

            <div style={{ marginTop: 40, padding: '20px 24px', background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--ink-3)' }}>
              <strong style={{ color: 'var(--ink-2)' }}>Indépendance :</strong> sélection éditoriale, sans lien affilié ni deal sponsorisé.{' '}
              <Link href="/mentions-legales" style={{ color: 'var(--primary-d)', textDecoration: 'underline' }}>Mentions légales →</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
