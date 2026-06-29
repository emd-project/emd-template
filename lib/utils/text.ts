/**
 * lib/utils/text.ts — utilitaires texte (server-safe, sans dépendance).
 */

/**
 * Tronque un texte en un excerpt court (cartes, meta descriptions), au dernier
 * mot complet, avec « … ». Sert quand un champ long (ex. `intro` answer-first d'un
 * classement) est réutilisé là où il faut une phrase courte (carte de hub, <meta>).
 *
 * @param text  texte source (peut être undefined)
 * @param max   longueur cible max en caractères (défaut 160 — bon pour une meta description)
 */
export function excerpt(text: string | undefined | null, max = 160): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut
  return base.replace(/[\s.,;:–—-]+$/, '') + '…'
}
