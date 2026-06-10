/**
 * /mentions-legales — Mentions légales (style Voltéo).
 * Valeurs remplacées à l'init. noindex : page légale.
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
            <p>Nom / Raison sociale : [À compléter]</p>
            <p>Adresse : [À compléter]</p>
            <p>Email : [À compléter]</p>
            <p>Directeur de la publication : [À compléter]</p>
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

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Données personnelles</h2>
          <p style={block}>
            Les informations relatives à la collecte et au traitement des données personnelles sont
            détaillées dans notre{' '}
            <Link href="/confidentialite" style={{ color: 'var(--primary-d)', textDecoration: 'underline' }}>
              politique de confidentialité
            </Link>.
          </p>
        </section>

        <section>
          <h2 style={h2}>Liens affiliés</h2>
          <p style={block}>
            Certains liens présents sur {niche.siteName} sont des liens affiliés vers {niche.defaultStore}.
            Si vous effectuez un achat après avoir cliqué sur l&rsquo;un de ces liens, {niche.siteName}
            peut percevoir une commission, sans aucun surcoût pour vous. Le contenu éditorial n&rsquo;est
            jamais influencé par les partenariats commerciaux.
          </p>
        </section>
      </div>
    </main>
  )
}
