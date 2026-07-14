'use client'

/**
 * PresseFooter — pied de page de l'identité ÉDITORIALE (variante `presse`).
 * Wordmark sérif, liens de service, mention de copyright. Token-driven.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'
import { currentYear } from '@/lib/utils/year'

function localeFromPath(pathname: string): string {
  const seg = (pathname || '/').split('/').filter(Boolean)
  if (seg.length && seg[0] !== niche.defaultLocale && niche.locales.includes(seg[0])) return seg[0]
  return niche.defaultLocale
}

export function PresseFooter() {
  const pathname = usePathname() || '/'
  const locale = localeFromPath(pathname)
  const lp = (href: string) => localePath(locale, href)

  const link = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: 12,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  } as const

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '44px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <Link
          href={lp('/')}
          style={{
            fontFamily: 'var(--next-font-display), Georgia, serif',
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: '0.14em',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          {niche.siteName}
        </Link>

        <span style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
          <Link href={lp('/blog')} style={link}>
            {tl(locale, 'presse.magazine')}
          </Link>
          {niche.author?.slug && (
            <Link href={lp(`/auteurs/${niche.author.slug}`)} style={link}>
              {tl(locale, 'presse.about')}
            </Link>
          )}
          <Link href={lp('/mentions-legales')} style={link}>
            {tl(locale, 'footer.legal')}
          </Link>
          <Link href={lp('/confidentialite')} style={link}>
            {tl(locale, 'footer.privacy')}
          </Link>
        </span>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          © {currentYear()} {niche.siteName}
        </span>
      </div>
    </footer>
  )
}
