'use client'

/**
 * LangSwitch — bascule FR ⇄ EN vers la PAGE ÉQUIVALENTE (jamais une 404, jamais un
 * « bounce » silencieux vers l'accueil).
 *
 * BLOC 1 (fondation additive) : ce composant existe et compile, mais n'est monté
 * NULLE PART (le montage dans la Nav = bloc 4, après création de l'arbre `app/en/`).
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

type Props = { to: 'fr' | 'en'; className?: string }

/**
 * Bouton de bascule vers la locale `to`, pointant sur la page équivalente.
 * Si la page courante est un article non traduit, le lien est désactivé (jamais 404).
 */
export function LangSwitch({ to, className }: Props) {
  const pathname = usePathname() || '/'
  const { href, available } = resolve(pathname, to)

  const baseStyle = {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    border: '1px solid var(--line, var(--text-muted))',
    borderRadius: '100px',
    padding: '7px 13px',
    textTransform: 'uppercase' as const,
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
