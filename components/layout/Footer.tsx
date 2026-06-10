/**
 * Footer — Voltéo : footer-top (marque + 3 colonnes) + footer-bottom.
 * Server Component — zéro JS. Données issues de niche.config.
 */
import Link from 'next/link'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'

function currentYear() {
  return new Date().getFullYear()
}

const COL_OUTILS = [
  { href: '/comparer', label: t('nav.compare') },
  ...(niche.quiz.enabled ? [{ href: '/quiz', label: t('tools.quiz.eyebrow') }] : []),
  ...(niche.simulator.enabled ? [{ href: '/simulateur', label: t('nav.simulator') }] : []),
  { href: '/deals', label: niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1) },
]

const COL_BLOG = niche.categories.slice(0, 5).map((cat) => ({
  href: `/blog/${cat.slug}`,
  label: cat.label,
}))

const COL_APROPOS = [
  ...(niche.author.slug ? [{ href: `/auteurs/${niche.author.slug}`, label: t('footer.author') }] : []),
  { href: '/mentions-legales', label: t('footer.legalNotice') },
  { href: '/confidentialite', label: t('footer.privacy') },
]

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  if (links.length === 0) return null
  return (
    <div className="footer-col">
      <h4>{title}</h4>
      <ul role="list">
        {links.map(({ href, label }) => (
          <li key={href}><Link href={href}>{label}</Link></li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="logo" aria-label={`${niche.siteName} — accueil`}>
              <span className="mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" fill="#fff" /></svg>
              </span>
              <span className="word">{niche.siteName}</span>
            </Link>
            <p className="footer-blurb">{niche.tagline}</p>
          </div>

          <FooterCol title={t('footer.tools')} links={COL_OUTILS} />
          {COL_BLOG.length > 0 && <FooterCol title={t('nav.blog')} links={COL_BLOG} />}
          <FooterCol title={t('footer.about')} links={COL_APROPOS} />
        </div>

        <div className="footer-bottom">
          <span>© {currentYear()} {niche.siteName} — {t('footer.independent')}</span>
          <span style={{ textAlign: 'right' }}>
            {t('footer.affiliateDisclaimer', { store: niche.defaultStore })}
          </span>
        </div>
      </div>
    </footer>
  )
}
