'use client'

/**
 * LangSwitcher — sélecteur de langue (header). Rendu UNIQUEMENT si locales.length >= 2.
 *
 * GARANTIE : ne produit JAMAIS un lien vers une 404, et ne te « bounce » jamais vers l'accueil
 * en silence. Comportement par type de page :
 *  - Pages statiques (mêmes routes dans toutes les locales, miroir strict) → swap de préfixe.
 *  - Article traduit (slug présent dans lib/i18n/article-slugs.ts) → va sur la version traduite.
 *  - Article SANS traduction connue → la langue cible est rendue DÉSACTIVÉE (grisée + titre
 *    explicite), au lieu de rediriger vers l'accueil. C'est « parfait au niveau article ».
 *
 * La table lib/i18n/article-slugs.ts est tenue à jour par la tâche de rédaction quotidienne
 * (un couple de slugs ajouté par article publié). Voir skills/seo-geo-redaction/references/mirror-i18n.md.
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

type Resolved = { href: string; available: boolean }

/**
 * Résout l'équivalent de `pathname` dans `target`.
 * `available: false` = la page courante (un article) n'a pas de version dans `target` →
 * le bouton sera désactivé (jamais de 404, jamais de redirection-surprise vers l'accueil).
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

  // Pages statiques (mêmes routes partout) → swap du préfixe locale, toujours disponible.
  return { href: localePath(target, rest), available: true }
}

export function LangSwitcher() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  if (niche.locales.length < 2) return null
  const { locale: active } = stripLocale(pathname)

  const go = (loc: string, href: string, available: boolean) => {
    if (loc === active || !available) return
    document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=31536000; samesite=lax`
    router.push(href)
  }

  return (
    <div role="group" aria-label="Choix de la langue" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {niche.locales.map((loc) => {
        const isActive = loc === active
        const { href, available } = resolve(pathname, loc)
        const disabled = !isActive && !available
        return (
          <button
            key={loc}
            type="button"
            onClick={() => go(loc, href, available)}
            disabled={disabled}
            aria-current={isActive ? 'true' : undefined}
            aria-disabled={disabled ? 'true' : undefined}
            title={disabled ? 'Pas encore de traduction pour cet article' : undefined}
            lang={loc}
            style={{
              background: 'none',
              border: 'none',
              cursor: disabled ? 'not-allowed' : isActive ? 'default' : 'pointer',
              fontSize: '13px',
              fontWeight: isActive ? 700 : 500,
              color: isActive
                ? 'var(--text-primary)'
                : disabled
                  ? 'var(--text-muted)'
                  : 'var(--text-secondary)',
              opacity: disabled ? 0.5 : 1,
              textTransform: 'uppercase',
              padding: '4px 6px',
              letterSpacing: '0.02em',
            }}
          >
            {loc}
          </button>
        )
      })}
    </div>
  )
}
