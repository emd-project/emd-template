/**
 * /simulateur — Simulateur de cycles de prix (style Voltéo).
 * Données statiques. Server Component · ISR 86400s.
 * Modèle EMD = MENTION, pas d'affiliation : aucun CTA d'achat affilié.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${niche.domain}`

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: niche.simulator.title ? `${niche.simulator.title} ${year} | ${niche.siteName}` : `Simulateur de prix ${year} | ${niche.siteName}`,
    description: niche.simulator.description || `Analyse des cycles de prix. ${niche.entityVerb.charAt(0).toUpperCase() + niche.entityVerb.slice(1)} au bon moment et économisez.`,
    alternates: { canonical: `${SITE_URL}/simulateur` },
    openGraph: { title: niche.simulator.title || `Simulateur de prix ${year}`, description: niche.simulator.description || `Cycles de prix ${niche.entities}.`, url: `${SITE_URL}/simulateur`, siteName: niche.siteName, type: 'website' },
  }
}

type CyclePrix = {
  modele: string; lancement: string; prixLancement: number; prixActuel: number
  prochaineAnnonce: string; recommandation: 'acheter' | 'attendre' | 'deal'
  /** Lien NEUTRE éventuel (source officielle / fiche). '' ou absent = aucun lien. Jamais affilié. */
  sourceUrl?: string
}

const CYCLES: CyclePrix[] = []

const REC_CONFIG = {
  acheter: { label: 'Bon moment', color: 'var(--green)' },
  attendre: { label: 'Attendre', color: 'var(--gaz)' },
  deal: { label: 'Très bon deal', color: 'var(--primary)' },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Simulateur', item: `${SITE_URL}/simulateur` },
  ],
}

export default function SimulateurPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
          <div className="wrap">
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 28, fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 20vw, 280px)', fontWeight: 800, color: 'var(--primary)', opacity: 0.05, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>€</span>
            <nav className="crumb" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link><span className="sep">/</span><span className="cur">Simulateur</span>
            </nav>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 16 }}>Cycles de prix</h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-2)', maxWidth: 560, lineHeight: 1.6, marginBottom: 16 }}>
              Les prix des anciens modèles baissent à chaque nouvelle sortie. Ce tableau te dit si tu es avant ou après la fenêtre optimale.
            </p>
            <Link href="/blog" style={{ fontSize: 14, color: 'var(--primary-d)', fontWeight: 600, textDecoration: 'underline' }}>Voir tous les guides →</Link>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            {CYCLES.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 16, padding: '64px 24px' }}>
                Aucune donnée de cycle de prix pour le moment. Revenez bientôt !
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {CYCLES.map((c) => {
                  const rec = REC_CONFIG[c.recommandation]
                  const economie = c.prixLancement - c.prixActuel
                  return (
                    <article key={c.modele} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, alignItems: 'center' }}>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>{c.modele}</h2>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Lancé <time dateTime={c.lancement}>{new Date(c.lancement).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</time></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Prix lancement</div>
                        <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 16, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{c.prixLancement.toLocaleString('fr-FR')} €</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Prix actuel</div>
                        <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 20, fontWeight: 700, color: 'var(--primary-d)' }}>{c.prixActuel.toLocaleString('fr-FR')} €</div>
                        {economie > 0 && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>−{economie} € vs lancement</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Prochaine annonce</div>
                        <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{c.prochaineAnnonce}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: rec.color, padding: '6px 14px', borderRadius: 100 }}>{rec.label}</span>
                        {c.sourceUrl ? (
                          <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-d)', textDecoration: 'underline' }}>Voir la fiche officielle →</a>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>Prix indicatifs, sourcés et datés. Mise à jour régulière. Aucun lien affilié.</p>
          </div>
        </section>
      </main>
    </>
  )
}
