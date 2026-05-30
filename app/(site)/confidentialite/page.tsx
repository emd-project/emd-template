/**
 * /confidentialite — Politique de confidentialité.
 * Template placeholder — le prompt d'init remplace les valeurs.
 * noindex : page légale, pas de SEO.
 */

import type { Metadata } from 'next'
import Balancer from 'react-wrap-balancer'
import { niche } from '@/niche.config'

export const metadata: Metadata = {
  title: `Politique de confidentialité | ${niche.siteName}`,
  description: `Politique de confidentialité du site ${niche.siteName}.`,
  robots: { index: false, follow: false },
}

export default function ConfidentialitePage() {
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
        <Balancer>Politique de confidentialité</Balancer>
      </h1>

      {/* Responsable du traitement */}
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
          <Balancer>Responsable du traitement</Balancer>
        </h2>
        <div style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          <p>Nom : [À compléter]</p>
          <p>Email : [À compléter]</p>
          <p>Site : {niche.siteName} — https://{niche.domain}</p>
        </div>
      </section>

      {/* Données collectées */}
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
          <Balancer>Données collectées</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {niche.siteName} collecte un minimum de données, strictement nécessaires au fonctionnement
          du site :
        </p>
        <ul
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            paddingLeft: 'var(--space-6)',
            marginTop: 'var(--space-3)',
          }}
        >
          <li>
            <strong style={{ color: 'var(--text-primary)' }}>Cookies analytics :</strong>{' '}
            données de navigation anonymisées (pages visitées, durée de session) via Vercel Analytics.
          </li>
          <li>
            <strong style={{ color: 'var(--text-primary)' }}>Formulaires CMS :</strong>{' '}
            si vous utilisez un formulaire de contact, les informations que vous fournissez
            (nom, email, message) sont collectées pour traiter votre demande.
          </li>
        </ul>
      </section>

      {/* Cookies */}
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
          <Balancer>Cookies</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Ce site utilise des cookies strictement nécessaires et des cookies analytiques :
        </p>
        <ul
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            paddingLeft: 'var(--space-6)',
            marginTop: 'var(--space-3)',
          }}
        >
          <li>
            <strong style={{ color: 'var(--text-primary)' }}>Vercel Analytics :</strong>{' '}
            mesure d&rsquo;audience anonymisée, sans tracking publicitaire.
          </li>
          <li>
            <strong style={{ color: 'var(--text-primary)' }}>Session CMS :</strong>{' '}
            cookie de session pour l&rsquo;interface d&rsquo;administration, le cas échéant.
          </li>
        </ul>
      </section>

      {/* Durée de conservation */}
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
          <Balancer>Durée de conservation</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Les données analytiques sont conservées pendant 24 mois maximum. Les données issues des
          formulaires de contact sont conservées le temps nécessaire au traitement de votre demande,
          puis supprimées.
        </p>
      </section>

      {/* Droits des utilisateurs */}
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
          <Balancer>Vos droits</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            paddingLeft: 'var(--space-6)',
            marginTop: 'var(--space-3)',
          }}
        >
          <li>Droit d&rsquo;accès à vos données personnelles</li>
          <li>Droit de rectification des données inexactes</li>
          <li>Droit de suppression de vos données</li>
          <li>Droit d&rsquo;opposition au traitement</li>
          <li>Droit à la portabilité de vos données</li>
        </ul>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            marginTop: 'var(--space-3)',
          }}
        >
          Pour exercer ces droits, contactez-nous à l&rsquo;adresse indiquée ci-dessus.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Balancer>Contact</Balancer>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Pour toute question relative à cette politique de confidentialité, vous pouvez nous
          contacter par email à [À compléter].
        </p>
      </section>
    </main>
  )
}
