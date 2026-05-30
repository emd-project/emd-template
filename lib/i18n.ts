/**
 * lib/i18n.ts — système de traduction centralisé.
 *
 * Usage :
 *   import { t } from '@/lib/i18n'
 *   t('nav.blog')           → "Blog"
 *   t('article.readingTime', { min: 5 })  → "5 min de lecture"
 *   t('footer.affiliateDisclaimer', { store: 'Amazon' }) → "Liens affiliés Amazon..."
 *
 * La locale est lue depuis niche.defaultLocale.
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

/**
 * Traduit une clé avec interpolation optionnelle.
 *
 * @param key   Clé en dot-notation (ex: 'nav.blog', 'article.readingTime')
 * @param vars  Variables à interpoler (ex: { min: 5, store: 'Amazon' })
 * @returns     Le texte traduit ou la clé si non trouvée
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = niche.defaultLocale
  const messages = ALL_MESSAGES[locale] ?? ALL_MESSAGES.fr
  let value = get(messages as unknown as Record<string, unknown>, key)

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(`{${k}}`, String(v))
    }
  }

  return value
}

/** Retourne la locale courante. */
export function currentLocale(): string {
  return niche.defaultLocale
}
