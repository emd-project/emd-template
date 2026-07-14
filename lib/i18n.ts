/**
 * lib/i18n.ts — système de traduction centralisé.
 *
 * Usage :
 *   import { t } from '@/lib/i18n'
 *   t('nav.blog')           → "Blog"
 *   t('article.readingTime', { min: 5 })  → "5 min de lecture"
 *   t('ui.viewOfficial')    → "Voir la fiche officielle"
 *
 * `t()` lit la locale depuis niche.defaultLocale (FR) — comportement HISTORIQUE,
 * inchangé. Pour localiser le « chrome » (Nav/Footer) sur les routes /en, utiliser
 * `tl(locale, key, vars)` qui prend la locale EXPLICITEMENT (détectée via le path
 * côté composant). `tl('fr', …)` ≡ `t(…)`.
 *
 * Fichiers de traduction dans content/translations/[locale].json.
 */

import { niche } from '@/niche.config'
import fr from '@/content/translations/fr.json'
import en from '@/content/translations/en.json'

type Messages = typeof fr

const ALL_MESSAGES: Record<string, Messages> = { fr, en }

/** Accède à une clé imbriquée : 'nav.blog' → messages.nav.blog */
function get(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}

/** Interpole `{var}` dans une chaîne. */
function interpolate(value: string, vars?: Record<string, string | number>): string {
  if (!vars) return value
  let out = value
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v))
  }
  return out
}

/**
 * Traduit une clé dans une locale EXPLICITE (additif, non couplé à defaultLocale).
 * Fallback : locale demandée → defaultLocale → fr. Sûr pour le chrome locale-aware.
 *
 * @param locale Locale cible ('fr' | 'en' | …)
 * @param key    Clé en dot-notation (ex: 'nav.blog')
 * @param vars   Variables à interpoler (ex: { label: 'Vélos' })
 */
export function tl(locale: string, key: string, vars?: Record<string, string | number>): string {
  const messages = ALL_MESSAGES[locale] ?? ALL_MESSAGES[niche.defaultLocale] ?? ALL_MESSAGES.fr
  const value = get(messages as unknown as Record<string, unknown>, key)
  // Si la clé manque dans la locale cible, fallback au FR plutôt que d'afficher la clé brute.
  if (value === key && messages !== ALL_MESSAGES.fr) {
    return interpolate(get(ALL_MESSAGES.fr as unknown as Record<string, unknown>, key), vars)
  }
  return interpolate(value, vars)
}

/**
 * Traduit une clé avec interpolation optionnelle.
 *
 * @param key   Clé en dot-notation (ex: 'nav.blog', 'article.readingTime')
 * @param vars  Variables à interpoler (ex: { min: 5 })
 * @returns     Le texte traduit ou la clé si non trouvée
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = niche.defaultLocale
  const messages = ALL_MESSAGES[locale] ?? ALL_MESSAGES.fr
  const value = get(messages as unknown as Record<string, unknown>, key)
  return interpolate(value, vars)
}

/** Retourne la locale courante. */
export function currentLocale(): string {
  return niche.defaultLocale
}
