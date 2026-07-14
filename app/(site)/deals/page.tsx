/**
 * /deals — page « bons plans » (style Voltéo).
 * DÉSACTIVÉE PAR DÉFAUT : `niche.deals.enabled === false` → `notFound()` immédiat.
 *
 * Modèle EMD = MENTION : aucune monétisation des liens sortants. Cette page ne rend
 * donc AUCUN CTA d'achat, aucun prix barré, aucun lien monétisé. Si une niche a de
 * vraies offres factuelles (prix sourcés et datés, liens NEUTRES vers la source
 * officielle), on active `deals.enabled` et on rend le contenu ici.
 * Hero + MarqueeStrip + FAQ. ISR 900s. Server Component.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { MarqueeStrip } from '@/components/effects/MarqueeStrip'
import { FaqAccordion } from '@/components/blog/FaqAccordion'
import { niche, dealsEnabled } from '@/niche.config'
import { best } from '@/lib/utils/grammar'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

const gd = niche.dealWordGender ?? niche.entityGender

export const revalidate = 900

export function generateMetadata(): Metadata {
  const year = currentYear()
  const dealWord = niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)
  return {
    title: `${dealWord} ${year} — meilleures offres du moment | ${niche.siteName}`,
    description: `Les meilleures offres ${niche.entities} du moment. Sélection éditoriale — pas de spam.`,
    alternates: { canonical: `${SITE_URL}/deals` },
    openGraph: {
      title: `${dealWord} ${year}`,
      description: `Meilleures offres ${niche.entities} sélectionnées manuellement.`,
      url: `${SITE_URL}/deals`,
      siteName: niche.siteName,
      type: 'website',
    },
  }
}

const MARQUEE_ITEMS = ['Sélection mise à jour chaque semaine', `Les ${best(gd, true)} ${niche.dealWord} du moment`]

const FAQ_ITEMS = [
  { q: `Où trouver les ${best(gd, true)} ${niche.dealWord} en ce moment ?`, a: `Sur ${niche.domain}/deals, on sélectionne manuellement les meilleures offres chaque semaine. Pas de fausses promos ni de prix gonflés avant réduction.` },
  { q: `Quand acheter au meilleur prix ?`, a: `Les meilleurs moments : le Black Friday, les soldes, et juste après la sortie d'un nouveau modèle — l'ancien baisse immédiatement.` },
  { q: `Comment vérifiez-vous les offres ?`, a: `On compare le prix affiché au prix officiel et à l'historique. Si l'annonce est trompeuse, on ne publie pas. Sélection éditoriale indépendante, sans offre sponsorisée.` },
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
  if (!dealsEnabled()) notFound()

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
              Sélection éditoriale. Pas d'offre sponsorisée, pas de prix gonflé avant réduction. Que des offres vérifiées.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 16, padding: '64px 24px', lineHeight: 1.6 }}>
              Aucune offre disponible pour le moment. Revenez bientôt !
            </p>

            <section aria-labelledby="faq-deals" style={{ marginTop: 48 }}>
              <h2 id="faq-deals" style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--ink)', marginBottom: 24 }}>Questions fréquentes — {niche.dealWord}</h2>
              <FaqAccordion items={FAQ_ITEMS} />
            </section>

            <div style={{ marginTop: 40, padding: '20px 24px', background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--ink-3)' }}>
              <strong style={{ color: 'var(--ink-2)' }}>Indépendance :</strong> sélection éditoriale, sans lien monétisé ni offre sponsorisée.{' '}
              <Link href="/mentions-legales" style={{ color: 'var(--primary-d)', textDecoration: 'underline' }}>Mentions légales →</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
