'use client'

/**
 * LangSwitch — bascule FR ⇄ EN vers la PAGE ÉQUIVALENTE (jamais une 404).
 *
 * Routing emd-template = `localePrefix: 'as-needed'` :
 *  - locale par défaut (FR) → routes SANS préfixe   : /comparer, /blog/[cat]/[slug]
 *  - autres locales (EN)    → routes AVEC préfixe    : /en/comparer, /en/blog/...
 *
 * Sections mirrorées (même structure d'URL dans les deux locales) :
 *  accueil, blog (+ catégorie + article), comparer (+ produit), choisir/[produit],
 *  classement/[produit], deals, quiz, simulateur, auteurs/[slug] → swap du préfixe.
 * Pages légales : slugs DIFFÉRENTS (/mentions-legales ⇄ /en/legal-notice,
 *  /confidentialite ⇄ /en/privacy) → mapping explicite.
 * Articles : version traduite si le slug est connu (lib/i18n/article-slugs.ts),
 *  sinon lien DÉSACTIVÉ (grisé). Tout chemin sans équivalent → accueil cible.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { niche, localePath } from '@/niche.config'
import { articleSlugInOrNull } from '@/lib/i18n/article-slugs'

/** Pages légales : slugs différents par locale (mapping explicite bidirectionnel). */
const LEGAL_EQUIV: Record<string, string> = {
  'mentions-legales': 'legal-notice',
  'confidentialite': 'privacy',
  'legal-notice': 'mentions-legales',
  'privacy': 'confidentialite',
}

/** Sections dont la route EN existe avec la MÊME structure (swap de préfixe). */
const MIRRORED = new Set([
  'blog', 'comparer', 'choisir', 'classement', 'deals', 'quiz', 'simulateur', 'auteurs',
])

/** Décompose un chemin en { locale active, reste sans préfixe }. */
function stripLocale(path: string): { locale: string; rest: string } {
  const seg = path.split('/').filter(Boolean)
  if (seg.length && seg[0] !== niche.defaultLocale && niche.locales.includes(seg[0])) {
    return { locale: seg[0], rest: '/' + seg.slice(1).join('/') }
  }
  return { locale: niche.defaultLocale, rest: path || '/' }
}

type Resolved = { href: string; available: boolean }

/**
 * Résout l'équivalent de `pathname` dans la locale `target`.
 * `available: false` = article sans traduction connue → lien grisé.
 */
function resolve(pathname: string, target: string): Resolved {
  const { locale: from, rest } = stripLocale(pathname)
  if (from === target) return { href: pathname, available: true }
  const seg = rest.split('/').filter(Boolean)

  // Accueil
  if (seg.length === 0) return { href: localePath(target, '/'), available: true }

  // Article blog : /blog/[categorie]/[slug] → traduction si connue, sinon grisé
  if (seg[0] === 'blog' && seg.length === 3) {
    const translated = articleSlugInOrNull(seg[2], from, target)
    if (translated == null) return { href: localePath(target, '/'), available: false }
    return { href: localePath(target, `/blog/${seg[1]}/${translated}`), available: true }
  }

  // Pages légales (slugs différents par locale)
  if (seg.length === 1 && LEGAL_EQUIV[seg[0]]) {
    return { href: localePath(target, `/${LEGAL_EQUIV[seg[0]]}`), available: true }
  }

  // Sections mirrorées (même structure d'URL) → swap du préfixe de locale
  if (MIRRORED.has(seg[0])) {
    return { href: localePath(target, rest), available: true }
  }

  // Article standalone /[slug] ou chemin sans équivalent EN → accueil cible (jamais une 404)
  return { href: localePath(target, '/'), available: true }
}

const ITEM_BASE = {
  fontSize: '13px',
  fontWeight: 700,
  borderRadius: '100px',
  padding: '7px 13px',
  textTransform: 'uppercase' as const,
}

/** Locale active déduite du chemin courant. */
function currentLocale(pathname: string): string {
  return stripLocale(pathname).locale
}

type ItemProps = { to: 'fr' | 'en'; current: boolean }

/** Un seul libellé de langue (courant = évidence non-cliquable ; sinon lien/grisé). */
function LangItem({ to, current }: ItemProps) {
  const pathname = usePathname() || '/'

  if (current) {
    return (
      <span
        aria-current="true"
        className="lang-item lang-current"
        style={{
          ...ITEM_BASE,
          color: 'var(--text-primary, var(--text-secondary))',
          background: 'var(--bg-surface-2, var(--bg-surface))',
          border: '1px solid var(--accent-1, var(--line, var(--text-muted)))',
        }}
      >
        {to.toUpperCase()}
      </span>
    )
  }

  const { href, available } = resolve(pathname, to)

  if (!available) {
    return (
      <span
        aria-disabled="true"
        title={to === 'en' ? 'No translation yet for this article' : 'Pas encore de traduction pour cet article'}
        className="lang-item lang-disabled"
        style={{
          ...ITEM_BASE,
          color: 'var(--text-muted)',
          border: '1px solid var(--line, var(--text-muted))',
          opacity: 0.5,
          cursor: 'not-allowed',
        }}
      >
        {to.toUpperCase()}
      </span>
    )
  }

  return (
    <Link
      href={href}
      hrefLang={to}
      aria-label={to === 'en' ? 'Switch to English' : 'Passer au français'}
      className="lang-item"
      style={{
        ...ITEM_BASE,
        color: 'var(--text-secondary)',
        border: '1px solid var(--line, var(--text-muted))',
      }}
    >
      {to.toUpperCase()}
    </Link>
  )
}

/**
 * LangSwitchPair — affiche les DEUX langues côte à côte (FR | EN).
 */
export function LangSwitchPair({ className }: { className?: string }) {
  const pathname = usePathname() || '/'
  const active = currentLocale(pathname)

  return (
    <span
      className={className}
      aria-label="Language"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <LangItem to="fr" current={active === 'fr'} />
      <span aria-hidden="true" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>|</span>
      <LangItem to="en" current={active === 'en'} />
    </span>
  )
}

type Props = { to: 'fr' | 'en'; className?: string }

/**
 * LangSwitch — bouton de bascule simple vers la locale `to`.
 */
export function LangSwitch({ to, className }: Props) {
  const pathname = usePathname() || '/'
  const { href, available } = resolve(pathname, to)

  const baseStyle = {
    ...ITEM_BASE,
    color: 'var(--text-secondary)',
    border: '1px solid var(--line, var(--text-muted))',
  }

  if (!available) {
    return (
      <span
        aria-disabled="true"
        title={to === 'en' ? 'No translation yet for this article' : 'Pas encore de traduction pour cet article'}
        className={className}
        style={{ ...baseStyle, color: 'var(--text-muted)', opacity: 0.5, cursor: 'not-allowed' }}
      >
        {to.toUpperCase()}
      </span>
    )
  }

  return (
    <Link
      href={href}
      hrefLang={to}
      aria-label={to === 'en' ? 'Switch to English' : 'Passer au français'}
      className={className}
      style={baseStyle}
    >
      {to.toUpperCase()}
    </Link>
  )
}
