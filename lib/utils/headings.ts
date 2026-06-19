/**
 * headings.ts — sommaire (table of contents) depuis le markdown brut.
 * Server-safe, AUCUNE dépendance. Le MÊME `slugify` sert à générer les `id` des
 * H2/H3 rendus (composants MDX `h2`/`h3` de la page article) → les ancres du
 * sommaire correspondent toujours aux titres affichés.
 */

export type TocItem = { id: string; text: string; level: 2 | 3 }

/** Slug déterministe (minuscules, sans accents ni ponctuation, tirets). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[^a-z0-9\s-]/g, '') // ponctuation
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Extrait les titres H2/H3 du markdown brut (en ignorant les blocs de code).
 * Le texte est nettoyé du markdown inline (gras/italique/code, liens → libellé).
 */
export function extractHeadings(md: string): TocItem[] {
  const items: TocItem[] = []
  let inFence = false
  for (const line of md.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    const level = m[1].length as 2 | 3
    const text = m[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // liens markdown → libellé
      .replace(/[*_`~]/g, '')
      .trim()
    if (text) items.push({ id: slugify(text), text, level })
  }
  return items
}
