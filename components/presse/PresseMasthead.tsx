'use client'

/**
 * PresseMasthead — en-tête de l'identité ÉDITORIALE (variante `presse`).
 * Porté de la maquette « Éditorial Beauté & Mode ».
 *
 * Structure : bandeau de service (marché · locale / recherche · newsletter · langue),
 * puis le WORDMARK sérif centré encadré de deux filets, la tagline en italique, et
 * enfin une NAV DE CATÉGORIES sticky (pastille de couleur par catégorie).
 *
 * 100 % TOKEN-DRIVEN : aucune couleur en dur. La maquette utilisait rose/mauve/or/
 * terre/sauge → ce sont exactement `--accent-1..5` (couleurs de catégorie du template),
 * donc la structure est figée mais la PALETTE reste celle du site (seedée au domaine).
 * Typo : `var(--next-font-display)` (sérif) pour le wordmark et les titres.
 *
 * Îlot client minimal (locale déduite du pathname), comme `Nav`.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { niche, isMultilingual, localePath, categoryAccent } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { LangSwitch } from '@/components/layout/LangSwitch'

function localeFromPath(pathname: string): string {
  const seg = (pathname || '/').split('/').filter(Boolean)
  if (seg.length && seg[0] !== niche.defaultLocale && niche.locales.includes(seg[0])) return seg[0]
  return niche.defaultLocale
}

export function PresseMasthead() {
  const pathname = usePathname() || '/'
  const locale = localeFromPath(pathname)
  const targetLocale: 'fr' | 'en' = locale === 'en' ? 'fr' : 'en'
  const lp = (href: string) => localePath(locale, href)

  const rule = { flex: 1, height: 1, background: 'var(--border)', maxWidth: 220 } as const
  const kicker = {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
  } as const

  return (
    <>
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
        {/* Bandeau de service */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '14px 24px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            ...kicker,
          }}
        >
          <span>
            {niche.market} · {tl(locale, 'presse.edition')}
          </span>
          <span style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Link href={lp('/blog')} style={{ color: 'var(--text-secondary)' }}>
              {tl(locale, 'presse.newsletter')}
            </Link>
            {isMultilingual() && <LangSwitch to={targetLocale} className="presse-lang" />}
          </span>
        </div>

        {/* Wordmark centré, encadré de filets */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 24px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
            <span aria-hidden="true" style={rule} />
            <Link
              href={lp('/')}
              aria-label={`${niche.siteName} — ${tl(locale, 'nav.home')}`}
              style={{
                fontFamily: 'var(--next-font-display), Georgia, serif',
                fontWeight: 700,
                fontSize: 'clamp(28px, 5vw, 58px)',
                letterSpacing: '0.14em',
                color: 'var(--text-primary)',
                lineHeight: 1,
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {niche.siteName}
            </Link>
            <span aria-hidden="true" style={rule} />
          </div>
          {niche.tagline && (
            <p
              style={{
                margin: '14px 0 0',
                fontStyle: 'italic',
                fontFamily: 'var(--next-font-display), Georgia, serif',
                fontSize: 15,
                color: 'var(--text-secondary)',
              }}
            >
              {niche.tagline}
            </p>
          )}
        </div>
      </header>

      {/* Nav catégories — sticky */}
      <nav
        aria-label={tl(locale, 'nav.mainNav')}
        style={{
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'color-mix(in srgb, var(--bg-primary) 92%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 30,
            flexWrap: 'wrap',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            minHeight: 52,
          }}
        >
          {niche.categories.map((c, i) => (
            <Link
              key={c.slug}
              href={lp(`/blog/${c.slug}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{ width: 7, height: 7, borderRadius: '50%', background: categoryAccent(i) }}
              />
              {c.label}
            </Link>
          ))}
          <Link href={lp('/blog')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            {tl(locale, 'presse.allArticles')} →
          </Link>
        </div>
      </nav>
    </>
  )
}
