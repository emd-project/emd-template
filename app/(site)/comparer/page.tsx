/**
 * /comparer — Hub de sélection produit (style Voltéo).
 * Grille des familles → /comparer/[produit]. Server Component · ISR 86400s.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { currentYear } from '@/lib/utils/year'
import { COMPARATEURS } from '@/lib/comparateur'
import { niche } from '@/niche.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`

export const revalidate = 86400

export function generateMetadata(): Metadata {
  const year = currentYear()
  return {
    title: `Comparateur ${year} | ${niche.siteName}`,
    description: `Comparez tous les ${niche.entities} côte à côte. Données à jour, sourcées et neutres.`,
    alternates: { canonical: `${SITE_URL}/comparer` },
    openGraph: { title: `Comparateur ${year}`, description: `Tous les comparateurs ${niche.entities} en un endroit.`, url: `${SITE_URL}/comparer`, siteName: niche.siteName, type: 'website' },
  }
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Comparateur', item: `${SITE_URL}/comparer` },
  ],
}

export default function ComparateurHubPage() {
  const produits = Object.values(COMPARATEURS)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main-content">
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <nav className="crumb" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link><span className="sep">/</span><span className="cur">Comparateur</span>
            </nav>
            <div className="sec-head" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Comparer</span>
              <h2 style={{ margin: '16px 0 12px' }}>Une famille, des modèles côte à côte.</h2>
              <p>Choisis une famille de {niche.entities} pour comparer les modèles en un coup d&rsquo;œil.</p>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 32 }}>
          <div className="wrap">
            {produits.length === 0 ? (
              <p style={{ color: 'var(--ink-3)' }}>Aucune famille de comparateur configurée pour le moment.</p>
            ) : (
              <div className="cat-grid">
                {produits.map((p, i) => {
                  const n = (i % 5) + 1
                  return (
                    <Link key={p.id} href={`/comparer/${p.id}`} className="cat">
                      <span className="glow" style={{ background: `var(--cat-${n})` }} />
                      <span className="cat-ic" style={{ background: `var(--cat-${n}-soft)`, color: `var(--cat-${n})` }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="7" /><rect x="13" y="6" width="3" height="11" /></svg>
                      </span>
                      <h3>{p.label}</h3>
                      <p>{p.description}</p>
                      <span className="go" style={{ color: `var(--cat-${n})` }}>{p.modeles.length} modèles <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
