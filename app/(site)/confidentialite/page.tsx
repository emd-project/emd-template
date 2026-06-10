/**
 * /confidentialite — Politique de confidentialité (style Voltéo).
 * Valeurs remplacées à l'init. noindex : page légale.
 */

import type { Metadata } from 'next'
import { niche } from '@/niche.config'

export const metadata: Metadata = {
  title: `Politique de confidentialité | ${niche.siteName}`,
  description: `Politique de confidentialité du site ${niche.siteName}.`,
  robots: { index: false, follow: false },
}

const h2 = { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 14px' } as const
const block = { fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.75 } as const
const list = { ...block, paddingLeft: 24, marginTop: 12 } as const
const strong = { color: 'var(--ink)' } as const

export default function ConfidentialitePage() {
  return (
    <main id="main-content" className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 40 }}>
          Politique de confidentialité
        </h1>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Responsable du traitement</h2>
          <div style={block}>
            <p>Nom : [À compléter]</p>
            <p>Email : [À compléter]</p>
            <p>Site : {niche.siteName} — https://{niche.domain}</p>
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Données collectées</h2>
          <p style={block}>{niche.siteName} collecte un minimum de données, strictement nécessaires au fonctionnement du site :</p>
          <ul style={list}>
            <li><strong style={strong}>Cookies analytics :</strong> données de navigation anonymisées (pages visitées, durée de session) via Vercel Analytics.</li>
            <li><strong style={strong}>Formulaires CMS :</strong> si vous utilisez un formulaire de contact, les informations fournies (nom, email, message) sont collectées pour traiter votre demande.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Cookies</h2>
          <p style={block}>Ce site utilise des cookies strictement nécessaires et des cookies analytiques :</p>
          <ul style={list}>
            <li><strong style={strong}>Vercel Analytics :</strong> mesure d&rsquo;audience anonymisée, sans tracking publicitaire.</li>
            <li><strong style={strong}>Session CMS :</strong> cookie de session pour l&rsquo;interface d&rsquo;administration, le cas échéant.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Durée de conservation</h2>
          <p style={block}>Les données analytiques sont conservées pendant 24 mois maximum. Les données issues des formulaires de contact sont conservées le temps nécessaire au traitement de votre demande, puis supprimées.</p>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={h2}>Vos droits</h2>
          <p style={block}>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul style={list}>
            <li>Droit d&rsquo;accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit de suppression de vos données</li>
            <li>Droit d&rsquo;opposition au traitement</li>
            <li>Droit à la portabilité de vos données</li>
          </ul>
          <p style={{ ...block, marginTop: 12 }}>Pour exercer ces droits, contactez-nous à l&rsquo;adresse indiquée ci-dessus.</p>
        </section>

        <section>
          <h2 style={h2}>Contact</h2>
          <p style={block}>Pour toute question relative à cette politique, contactez-nous par email à [À compléter].</p>
        </section>
      </div>
    </main>
  )
}
