'use client'

/**
 * LangSwitch — bascule FR ⇄ EN vers la PAGE ÉQUIVALENTE (jamais une 404, jamais un
 * « bounce » silencieux vers l'accueil).
 *
 * Routing emd-template = `localePrefix: 'as-needed'` :
 *  - locale par défaut (FR) → routes SANS préfixe   : /blog/[cat]/[slug]
 *  - autres locales (EN)    → routes AVEC préfixe    : /en/blog/[cat]/[slug]
 *
 * Comportement par type de page :
 *  - Pages statiques (mêmes routes dans toutes les locales) → swap du préfixe locale.
 *  - Article traduit (slug présent dans lib/i18n/article-slugs.ts) → version traduite.
 *  - Article SANS traduction connue → lien rendu DÉSACTIVÉ (grisé), jamais une 404.
 *
 * Affichage : `LangSwitchPair` montre les DEUX langues côte à côte (ex. FR | EN).
 * La langue courante est mise en évidence et non cliquable ; l'autre est un lien
 * vers la page équivalente (ou désactivée/grisée si l'article n'est pas traduit).
 *
 * La table lib/i18n/article-slugs.ts est tenue à jour par la tâche de rédaction
 * quotidienne. cf. emd-methodo/references/i18n-multilingue.md
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { niche, localePath } from '@/niche.config'
import { articleSlugInOrNull } from '@/lib/i18n/article-slugs'

// Sections à routes fixes (existent dans toutes les locales) — PAS des slugs d'articles.
const STATIC_SECTIONS = [
  'blog', 'comparer', 'choisir', 'deals', 'quiz', 'simulateur',
  'auteurs', 'mentions-legales', 'confidentialite',
]

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
 * `available: false` = la page courante (un article) n'a pas de version dans `target`.
 */
function resolve(pathname: string, target: string): Resolved {
  const { locale: from, rest } = stripLocale(pathname)
  if (from === target) return { href: pathname, available: true }
  const seg = rest.split('/').filter(Boolean)

  // Article blog : /blog/[categorie]/[slug]
  if (seg[0] === 'blog' && seg.length === 3) {
    const translated = articleSlugInOrNull(seg[2], from, target)
    if (translated == null) return { href: localePath(target, '/'), available: false }
    return { href: localePath(target, `/blog/${seg[1]}/${translated}`), available: true }
  }

  // Article standalone : /[slug]
  if (seg.length === 1 && !STATIC_SECTIONS.includes(seg[0])) {
    const translated = articleSlugInOrNull(seg[0], from, target)
    if (translated == null) return { href: localePath(target, '/'), available: false }
    return { href: localePath(target, `/${translated}`), available: true }
  }

  // Pages statiques (mêmes routes partout) → swap du préfixe locale.
  return { href: localePath(target, rest), available: true }
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
 * La langue courante est mise en évidence (non cliquable) ; l'autre est un lien
 * vers la page équivalente, ou désactivée si l'article n'est pas traduit.
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
 * LangSwitch — bouton de bascule simple vers la locale `to` (conservé pour
 * rétro-compatibilité). Préférer `LangSwitchPair` pour afficher les deux langues.
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
