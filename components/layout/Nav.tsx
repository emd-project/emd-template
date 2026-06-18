'use client'

/**
 * Nav — navigation Voltéo (sticky, ombre au scroll, menu mobile).
 * Îlot client minimal : seulement l'état scroll + ouverture du menu.
 * Liens et identité issus de niche.config. Aucun contenu caché sans JS.
 *
 * i18n (bloc 4) :
 *  - Nav partagée FR/EN (montée par app/(site)/layout.tsx ET app/en/layout.tsx).
 *  - `LangSwitch` monté (additif), conditionné à `isMultilingual()` : affiche
 *    UNIQUEMENT la langue cible (sur FR → bouton EN ; sur EN → bouton FR), qui
 *    pointe vers la page équivalente (cf. LangSwitch.tsx ; grisé si l'article
 *    n'a pas encore de traduction).
 *  - Hrefs locale-aware : sur une page EN (pathname sous /en) les liens internes
 *    sont préfixés `/en` via `localePath()` → pas de « bounce » vers le FR.
 *  - LIBELLÉS locale-aware (additif) : la locale est déduite du path et les
 *    libellés passent par `tl(locale, …)` (≡ `t()` en FR, EN sur /en). Le FR reste
 *    identique (defaultLocale inchangé) ; seul l'EN gagne ses libellés.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { niche, isMultilingual, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'
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
  /** Langue CIBLE du switch = l'autre langue que la courante. */
  const targetLocale: 'fr' | 'en' = locale === 'en' ? 'fr' : 'en'
  /** Préfixe les hrefs internes par la locale active (no-op en FR). */
  const lp = (href: string) => localePath(locale, href)
  const homeHref = lp('/')

  // Libellés locale-aware : construits au rendu (dépendent de `locale`).
  // `dealWord` = vocabulaire de niche (locale-agnostique) → inchangé.
  const dealLabel = niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)
  const LINKS = [
    { href: '/comparer', label: tl(locale, 'nav.compare') },
    { href: '/blog', label: tl(locale, 'nav.blog') },
    { href: '/deals', label: dealLabel },
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

          <div className="nav-cta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
