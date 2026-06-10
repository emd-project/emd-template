'use client'

/**
 * Nav — navigation Voltéo (sticky, ombre au scroll, menu mobile).
 * Îlot client minimal : seulement l'état scroll + ouverture du menu.
 * Liens et identité issus de niche.config. Aucun contenu caché sans JS.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'

const LINKS = [
  { href: '/comparer', label: t('nav.compare') },
  { href: '/blog', label: t('nav.blog') },
  { href: '/deals', label: niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1) },
  ...(niche.simulator.enabled ? [{ href: '/simulateur', label: t('nav.simulator') }] : []),
]

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} aria-label={t('nav.mainNav')}>
        <div className="wrap">
          <Link href="/" className="logo" aria-label={`${niche.siteName} — accueil`}>
            <span className="mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" /></svg>
            </span>
            <span className="word">{niche.siteName}</span>
          </Link>

          <div className="nav-links">
            {LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={isActive(href) ? 'active' : undefined}>{label}</Link>
            ))}
          </div>

          <div className="nav-cta">
            <Link href="/comparer" className="btn btn-accent" style={{ padding: '11px 22px', fontSize: '15px' }}>
              {t('nav.compare')}<span className="arr">→</span>
            </Link>
          </div>

          <button
            className="nav-burger"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${open ? ' open' : ''}`} role="dialog" aria-label={t('nav.mobileMenu')}>
        {LINKS.map(({ href, label }) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
        <Link href="/comparer" className="btn btn-accent btn-lg">{t('nav.compare')} →</Link>
      </div>
    </>
  )
}
