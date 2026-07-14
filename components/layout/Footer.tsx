/**
 * Footer — Voltéo : footer-top (marque + 3 colonnes) + footer-bottom.
 * Server Component — zéro JS. Données issues de niche.config.
 *
 * i18n (additif) : accepte une prop optionnelle `locale` (défaut = defaultLocale).
 * Les libellés passent par `tl(locale, …)` (≡ `t()` en FR). Footer reste un Server
 * Component (pas de `usePathname`) : la locale est fournie EXPLICITEMENT par le
 * layout qui le monte (app/en/layout.tsx → `<Footer locale="en" />`). Le FR est
 * inchangé : `<Footer />` sans prop retombe sur defaultLocale.
 * Les hrefs internes sont préfixés par la locale active via `localePath` (no-op FR).
 *
 * MODÈLE MENTION : aucun disclaimer de monétisation (il n'y en a aucune). Le lien
 * /deals n'apparaît QUE si `niche.deals.enabled` (la page renvoie 404 sinon). La
 * mention d'éditeur reste sur les pages légales (noindex), pas ici (empreinte SEO).
 */
import Link from 'next/link'
import { niche, localePath, dealsEnabled } from '@/niche.config'
import { tl } from '@/lib/i18n'

function currentYear() {
  return new Date().getFullYear()
}

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

export function Footer({ locale = niche.defaultLocale }: { locale?: string }) {
  const lp = (href: string) => localePath(locale, href)

  const colOutils = [
    { href: lp('/comparer'), label: tl(locale, 'nav.compare') },
    ...(niche.quiz.enabled ? [{ href: lp('/quiz'), label: tl(locale, 'tools.quiz.eyebrow') }] : []),
    ...(niche.simulator.enabled ? [{ href: lp('/simulateur'), label: tl(locale, 'nav.simulator') }] : []),
    ...(dealsEnabled() ? [{ href: lp('/deals'), label: niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1) }] : []),
  ]

  const colBlog = niche.categories.slice(0, 5).map((cat) => ({
    href: lp(`/blog/${cat.slug}`),
    label: cat.label,
  }))

  const colApropos = [
    ...(niche.author.slug ? [{ href: lp(`/auteurs/${niche.author.slug}`), label: tl(locale, 'footer.author') }] : []),
    { href: lp('/mentions-legales'), label: tl(locale, 'footer.legalNotice') },
    { href: lp('/confidentialite'), label: tl(locale, 'footer.privacy') },
  ]

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href={lp('/')} className="logo" aria-label={`${niche.siteName} — accueil`}>
              <span className="mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" fill="#fff" /></svg>
              </span>
              <span className="word">{niche.siteName}</span>
            </Link>
            <p className="footer-blurb">{niche.tagline}</p>
          </div>

          <FooterCol title={tl(locale, 'footer.tools')} links={colOutils} />
          {colBlog.length > 0 && <FooterCol title={tl(locale, 'nav.blog')} links={colBlog} />}
          <FooterCol title={tl(locale, 'footer.about')} links={colApropos} />
        </div>

        <div className="footer-bottom">
          <span>© {currentYear()} {niche.siteName} — {tl(locale, 'footer.independent')}</span>
        </div>
      </div>
    </footer>
  )
}
