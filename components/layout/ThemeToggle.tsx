'use client'

/**
 * ThemeToggle — bascule dark / light avec persistance localStorage.
 * Icône Sun = mode clair actif (cliquer passe en dark).
 * Icône Moon = mode sombre actif (cliquer passe en light).
 * prefers-color-scheme respecté quand aucun choix en localStorage.
 */

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme(getInitialTheme())
    setMounted(true)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  if (!mounted) {
    // Placeholder de même taille pour éviter le layout shift
    return <span style={{ width: '32px', height: '32px', display: 'flex' }} aria-hidden="true" />
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        flexShrink: 0,
        transition: 'color 200ms ease, border-color 200ms ease, background 200ms ease',
      }}
    >
      {theme === 'dark'
        ? <Sun size={15} aria-hidden="true" />
        : <Moon size={15} aria-hidden="true" />
      }
    </button>
  )
}
