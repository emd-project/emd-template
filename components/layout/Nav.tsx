'use client'

/**
 * Nav — navigation Voltéo (sticky, ombre au scroll, menu mobile).
 * Îlot client minimal : seulement l'état scroll + ouverture du menu.
 * Liens et identité issus de niche.config. Aucun contenu caché sans JS.
 *
 * i18n : Nav partagée FR/EN ; la locale est déduite du path (usePathname) et les
 * libellés passent par `tl(locale, …)`. Hrefs préfixés par `localePath` (no-op FR).
 *
 * NOTE : le lien `/deals` n'apparaît QUE si `niche.deals.enabled` — la page est
 * désactivée par défaut (modèle MENTION, aucune affiliation). Un lien vers une page
 * supprimée/vide serait un 404 ou une coquille.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { niche, isMultilingual, localePath, dealsEnabled } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { CLASSEMENT_SLUGS } from '@/lib/classement'
import { LangSwitch } from '@/components/layout/LangSwitch'

/** Locale active déduite du chemin (préfixe /en → 'en', sinon defaultLocale). */
function localeFromPath(pathname: string): string {
  const seg = (pathname || '/').split('/').filter(Boolean)
  if (seg.length && seg[0] !== niche.defaultLocale && niche.locales.includes(seg[0])) {
    return seg[0]
  }
  return niche.defaultLocale
}

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const locale = localeFromPath(pathname || '/')
  const targetLocale: 'fr' | 'en' = locale === 'en' ? 'fr' : 'en'
  const lp = (href: string) => localePath(locale, href)
  const homeHref = lp('/')

  const dealLabel = niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)
  const LINKS = [
    { href: '/comparer', label: tl(locale, 'nav.compare') },
    ...(CLASSEMENT_SLUGS.length > 0 ? [{ href: '/classement', label: tl(locale, 'nav.rankings') }] : []),
    { href: '/blog', label: tl(locale, 'nav.blog') },
    ...(dealsEnabled() ? [{ href: '/deals', label: dealLabel }] : []),
    ...(niche.simulator.enabled ? [{ href: '/simulateur', label: tl(locale, 'nav.simulator') }] : []),
  ]

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
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} aria-label={tl(locale, 'nav.mainNav')}>
        <div className="wrap">
          <Link href={homeHref} className="logo" aria-label={`${niche.siteName} — accueil`}>
            <span className="mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" /></svg>
            </span>
            <span className="word">{niche.siteName}</span>
          </Link>

          <div className="nav-links">
            {LINKS.map(({ href, label }) => {
              const localized = lp(href)
              return (
                <Link key={href} href={localized} className={isActive(localized) ? 'active' : undefined}>{label}</Link>
              )
            })}
          </div>

          <div className="nav-cta">
            {isMultilingual() && (
              <LangSwitch to={targetLocale} className="nav-lang" />
            )}
            <Link href={lp('/comparer')} className="btn btn-accent" style={{ padding: '11px 22px', fontSize: '15px' }}>
              {tl(locale, 'nav.compare')}<span className="arr">→</span>
            </Link>
          </div>

          <button
            className="nav-burger"
            aria-label={open ? tl(locale, 'nav.closeMenu') : tl(locale, 'nav.openMenu')}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${open ? ' open' : ''}`} role="dialog" aria-label={tl(locale, 'nav.mobileMenu')}>
        {LINKS.map(({ href, label }) => (
          <Link key={href} href={lp(href)}>{label}</Link>
        ))}
        <Link href={lp('/comparer')} className="btn btn-accent btn-lg">{tl(locale, 'nav.compare')} →</Link>
        {isMultilingual() && (
          <LangSwitch to={targetLocale} className="mobile-lang" />
        )}
      </div>
    </>
  )
}
