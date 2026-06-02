'use client'

/**
 * LangSwitcher — sélecteur de langue (header). Rendu UNIQUEMENT si locales.length >= 2.
 *
 * GARANTIE : ne produit JAMAIS un lien vers une 404. Si la version traduite de la page
 * courante n'est pas connue (slug d'article non mappé), on retombe sur l'accueil de la langue
 * cible. Les pages statiques (mêmes routes dans toutes les locales via le miroir strict) font
 * un simple swap de préfixe. Voir skills/seo-geo-redaction/references/mirror-i18n.md.
 */

import { usePathname, useRouter } from 'next/navigation'
import { niche, localePath } from '@/niche.config'
import { articleSlugInOrNull } from '@/lib/i18n/article-slugs'

// Sections à routes fixes (existent dans toutes les locales) — PAS des slugs d'articles.
const STATIC_SECTIONS = [
  'blog', 'comparer', 'choisir', 'deals', 'quiz', 'simulateur',
  'auteurs', 'mentions-legales', 'confidentialite',
]

function stripLocale(path: string): { locale: string; rest: string } {
  const seg = path.split('/').filter(Boolean)
  if (seg.length && seg[0] !== niche.defaultLocale && niche.locales.includes(seg[0])) {
    return { locale: seg[0], rest: '/' + seg.slice(1).join('/') }
  }
  return { locale: niche.defaultLocale, rest: path || '/' }
}

/** URL équivalente de `pathname` dans `target`. Jamais une 404. */
function localizedHref(pathname: string, target: string): string {
  const { locale: from, rest } = stripLocale(pathname)
  if (from === target) return pathname
  const seg = rest.split('/').filter(Boolean)

  // Article blog : /blog/[categorie]/[slug] → slug traduit, sinon accueil langue cible
  if (seg[0] === 'blog' && seg.length === 3) {
    const translated = articleSlugInOrNull(seg[2], from, target)
    if (translated == null) return localePath(target, '/')
    return localePath(target, `/blog/${seg[1]}/${translated}`)
  }

  // Article standalone : /[slug] → slug traduit, sinon accueil
  if (seg.length === 1 && !STATIC_SECTIONS.includes(seg[0])) {
    const translated = articleSlugInOrNull(seg[0], from, target)
    if (translated == null) return localePath(target, '/')
    return localePath(target, `/${translated}`)
  }

  // Pages statiques (mêmes routes partout) → swap du préfixe locale
  return localePath(target, rest)
}

export function LangSwitcher() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  if (niche.locales.length < 2) return null
  const { locale: active } = stripLocale(pathname)

  const go = (loc: string) => {
    if (loc === active) return
    document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=31536000; samesite=lax`
    router.push(localizedHref(pathname, loc))
  }

  return (
    <div role="group" aria-label="Choix de la langue" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {niche.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => go(loc)}
          aria-current={loc === active ? 'true' : undefined}
          lang={loc}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: loc === active ? 700 : 500,
            color: loc === active ? 'var(--text-primary)' : 'var(--text-secondary)',
            textTransform: 'uppercase',
            padding: '4px 6px',
            letterSpacing: '0.02em',
          }}
        >
          {loc}
        </button>
      ))}
    </div>
  )
}
