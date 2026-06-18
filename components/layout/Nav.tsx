'use client'

/**
 * Nav — navigation Voltéo (sticky, ombre au scroll, menu mobile).
 * Îlot client minimal : seulement l'état scroll + ouverture du menu.
 * Liens et identité issus de niche.config. Aucun contenu caché sans JS.
 *
 * i18n (bloc 4) :
 *  - Nav partagée FR/EN (montée par app/(site)/layout.tsx ET app/en/layout.tsx).
 *  - `LangSwitch` monté (additif), conditionné à `isMultilingual()` : bascule
 *    page↔page FR⇄EN sans 404 (cf. components/layout/LangSwitch.tsx).
 *  - Hrefs locale-aware : sur une page EN (pathname sous /en) les liens internes
 *    sont préfixés `/en` via `localePath()` → pas de « bounce » vers le FR.
 *  - Les LIBELLÉS restent FR pour l'instant (t() est verrouillé sur
 *    niche.defaultLocale = fr et ne peut pas localiser l'EN — même convention
 *    que les pages app/en/*). Acceptable : seuls les liens deviennent locale-aware.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { niche, isMultilingual, localePath } from '@/niche.config'
import { t } from '@/lib/i18n'
import { LangSwitch } from '@/components/layout/LangSwitch'

const LINKS = [
  { href: '/comparer', label: t('nav.compare') },
  { href: '/blog', label: t('nav.blog') },
  { href: '/deals', label: niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1) },
  ...(niche.simulator.enabled ? [{ href: '/simulateur', label: t('nav.simulator') }] : []),
]

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
  /** Préfixe les hrefs internes par la locale active (no-op en FR). */
  const lp = (href: string) => localePath(locale, href)
  const homeHref = lp('/')

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
              <span className="nav-lang" aria-label="Language" style={{ display: 'inline-flex', gap: 6 }}>
                <LangSwitch to="fr" />
                <LangSwitch to="en" />
              </span>
            )}
            <Link href={lp('/comparer')} className="btn btn-accent" style={{ padding: '11px 22px', fontSize: '15px' }}>
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
          <Link key={href} href={lp(href)}>{label}</Link>
        ))}
        <Link href={lp('/comparer')} className="btn btn-accent btn-lg">{t('nav.compare')} →</Link>
        {isMultilingual() && (
          <span className="mobile-lang" style={{ display: 'inline-flex', gap: 8, marginTop: 8 }}>
            <LangSwitch to="fr" />
            <LangSwitch to="en" />
          </span>
        )}
      </div>
    </>
  )
}
