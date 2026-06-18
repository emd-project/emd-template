/**
 * /mentions-legales — Mentions légales (style Voltéo).
 * Infos éditeur en dur : même entité (MentionBox SRL) pour tous les sites EMD.
 * noindex : page légale.
 * Note : EMD n'a aucune affiliation — pas de section « liens affiliés ».
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { niche } from '@/niche.config'

export const metadata: Metadata = {
  title: `Mentions légales | ${niche.siteName}`,
  description: `Mentions légales du site ${niche.siteName}.`,
  robots: { index: false, follow: false },
}

const h2 = { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 14px' } as const
const block = { fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.75 } as const

export default function MentionsLegalesPage() {
  return (
    <main id="main-content" className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 40 }}>
          Mentions légales
        </h1>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Éditeur du site</h2>
          <div style={block}>
            <p>Site : {niche.siteName} — https://{niche.domain}</p>
            <p>Société : MentionBox SRL — société à responsabilité limitée (SRL) de droit belge</p>
            <p>Numéro d&rsquo;entreprise : BE 0784.700.405</p>
            <p>Siège social : Rue Blanche-Eau 15, 6950 Nassogne, Belgique</p>
            <p>Email : emd@mentionbox.be</p>
            <p>Directeur de la publication : MentionBox SRL</p>
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Hébergeur</h2>
          <div style={block}>
            <p>Vercel Inc.</p>
            <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
            <p>https://vercel.com</p>
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Propriété intellectuelle</h2>
          <p style={block}>
            L&rsquo;ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, etc.)
            est la propriété exclusive de {niche.siteName}, sauf mention contraire. Toute reproduction,
            représentation, modification, publication ou adaptation de tout ou partie des éléments du
            site est interdite sans autorisation écrite préalable.
          </p>
        </section>

        <section>
          <h2 style={h2}>Données personnelles</h2>
          <p style={block}>
            Les informations relatives à la collecte et au traitement des données personnelles sont
            détaillées dans notre{' '}
            <Link href="/confidentialite" style={{ color: 'var(--primary-d)', textDecoration: 'underline' }}>
              politique de confidentialité
            </Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
