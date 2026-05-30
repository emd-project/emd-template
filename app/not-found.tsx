import Link from 'next/link'
import type { Metadata } from 'next'
import { niche } from '@/niche.config'

export const metadata: Metadata = {
  title: `Page introuvable | ${niche.siteName}`,
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main
      id="main-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100svh',
        padding: 'var(--space-12)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: 'clamp(160px, 25vw, 300px)',
          fontWeight: 800,
          color: 'var(--accent-1)',
          opacity: 0.08,
          lineHeight: 1,
          userSelect: 'none',
          position: 'absolute',
          pointerEvents: 'none',
        }}
      >
        404
      </span>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            marginBottom: 'var(--space-4)',
          }}
        >
          Cette page n&apos;existe pas
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
            fontSize: '17px',
          }}
        >
          La page que tu cherches a déménagé ou n&apos;existe plus.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: 'var(--space-3) var(--space-6)',
            backgroundColor: 'var(--accent-1)',
            color: 'var(--bg-primary)',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontSize: '15px',
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
