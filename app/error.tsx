'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: 'clamp(22px, 3vw, 32px)',
          fontWeight: 700,
          marginBottom: 'var(--space-4)',
        }}
      >
        Oups, quelque chose a planté
      </h1>
      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-8)',
        }}
      >
        Une erreur inattendue s&apos;est produite — réessaie.
      </p>
      <button
        onClick={reset}
        style={{
          padding: 'var(--space-3) var(--space-6)',
          backgroundColor: 'var(--accent-1)',
          color: 'var(--bg-primary)',
          fontWeight: 700,
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '15px',
        }}
      >
        Réessaie
      </button>
    </main>
  )
}
