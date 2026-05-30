/**
 * /mentions-legales — Mentions légales.
 * Template placeholder — le prompt d'init remplace les valeurs.
 * noindex : page légale, pas de SEO.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { niche } from '@/niche.config'

export const metadata: Metadata = {
  title: `Mentions légales | ${niche.siteName}`,
  description: `Mentions légales du site ${niche.siteName}.`,
  robots: { index: false, follow: false },
}

export default function MentionsLegalesPage() {
  return (
    <main
      id="main-content"
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'var(--space-16) var(--space-6) var(--space-24)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: 'var(--space-10)',
        }}
      >
        <Balancer>Mentions légales</Balancer>
      </h1>

      {/* Éditeur du site */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Balancer>Éditeur du site</Balancer>
        </h2>
        <div style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          <p>Site : {niche.siteName} — https://{niche.domain}</p>
          <p>Nom / Raison sociale : [À compléter]</p>
          <p>Adresse : [À compléter]</p>
          <p>Email : [À compléter]</p>
          <p>Directeur de la publication : [À compléter]</p>
        </div>
      </section>

      {/* Hébergeur */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Balancer>Hébergeur</Balancer>
        </h2>
        <div style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          <p>Vercel Inc.</p>
          <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
          <p>https://vercel.com</p>
        </div>
      </section>

      {/* Propriété intellectuelle */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Balancer>Propriété intellectuelle</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          L&rsquo;ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, etc.)
          est la propriété exclusive de {niche.siteName}, sauf mention contraire. Toute reproduction,
          représentation, modification, publication ou adaptation de tout ou partie des éléments du
          site est interdite sans autorisation écrite préalable.
        </p>
      </section>

      {/* Données personnelles */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Balancer>Données personnelles</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Les informations relatives à la collecte et au traitement des données personnelles sont
          détaillées dans notre{' '}
          <Link
            href="/confidentialite"
            style={{ color: 'var(--accent-1)', textDecoration: 'none' }}
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </section>

      {/* Liens affiliés */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Balancer>Liens affiliés</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Certains liens présents sur {niche.siteName} sont des liens affiliés vers{' '}
          {niche.defaultStore}. Cela signifie que si vous effectuez un achat après avoir cliqué sur
          l&rsquo;un de ces liens, {niche.siteName} peut percevoir une commission, sans aucun
          surcoût pour vous. Ces revenus contribuent au fonctionnement et à l&rsquo;indépendance
          éditoriale du site. Le contenu éditorial n&rsquo;est jamais influencé par les partenariats
          commerciaux.
        </p>
      </section>
    </main>
  )
}
