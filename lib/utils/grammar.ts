/**
 * lib/utils/grammar.ts — accords FR en genre/nombre, pilotés par les données.
 *
 * RAISON D'ÊTRE : les titres/labels du template étaient figés au masculin
 * (« Top 5 meilleurs … », « Quel … », « le … fait pour toi »). C'EST FAUX pour
 * une niche dont l'entité est féminine (ex. « néobanque » → « meilleures néobanques »,
 * « Quelle néobanque », « la néobanque faite pour toi »).
 *
 * Le genre vient de la donnée : `niche.config.entityGender` (entité du site) et,
 * par classement/produit, un champ optionnel `genre` (sinon repli sur l'entité).
 * Ne JAMAIS re-coder un accord en dur dans le JSX : passer par ces helpers.
 */

export type Genre = 'm' | 'f'

/** Voyelle ou h muet en tête → élision « l' », « d' ». (approx. suffisante FR) */
function elide(noun: string): boolean {
  return /^[aàâäeéèêëiîïoôöuùûüyhAÀÂÄEÉÈÊËIÎÏOÔÖUÙÛÜYH]/.test(noun.trim())
}

/** meilleur / meilleure / meilleurs / meilleures */
export function best(genre: Genre = 'm', plural = false): string {
  if (genre === 'f') return plural ? 'meilleures' : 'meilleure'
  return plural ? 'meilleurs' : 'meilleur'
}

/** Quel / Quelle / Quels / Quelles (capitalisé — usage en tête de titre). */
export function quel(genre: Genre = 'm', plural = false): string {
  if (genre === 'f') return plural ? 'Quelles' : 'Quelle'
  return plural ? 'Quels' : 'Quel'
}

/** Article défini : le / la / les (sans élision — préférer `leMot` près d'un nom). */
export function le(genre: Genre = 'm', plural = false): string {
  if (plural) return 'les'
  return genre === 'f' ? 'la' : 'le'
}

/** Article défini + nom, avec élision : « l'opérateur », « la néobanque », « le produit ». */
export function leMot(noun: string, genre: Genre = 'm', plural = false): string {
  if (plural) return `les ${noun}`
  if (elide(noun)) return `l'${noun}`
  return `${genre === 'f' ? 'la' : 'le'} ${noun}`
}

/** Possessif 3e pers. : son / sa / ses (« sa » → « son » devant voyelle si nom fourni). */
export function son(genre: Genre = 'm', plural = false, noun?: string): string {
  if (plural) return 'ses'
  if (genre === 'f') return noun && elide(noun) ? 'son' : 'sa'
  return 'son'
}

/** Possessif 2e pers. : ton / ta / tes (« ta » → « ton » devant voyelle si nom fourni). */
export function ton(genre: Genre = 'm', plural = false, noun?: string): string {
  if (plural) return 'tes'
  if (genre === 'f') return noun && elide(noun) ? 'ton' : 'ta'
  return 'ton'
}

/** tout le / toute la / tous les / toutes les */
export function tousLes(genre: Genre = 'm', plural = true): string {
  if (!plural) return genre === 'f' ? 'toute la' : 'tout le'
  return genre === 'f' ? 'toutes les' : 'tous les'
}

/**
 * Accorde un adjectif/participe régulier au féminin (+e) et au pluriel (+s).
 * Ex. accord('fait','f') → 'faite' · accord('classé','f',true) → 'classées'
 *     accord('idéal','f') → 'idéale' · accord('comparé',' f',true) → 'comparées'
 * Limité aux formes régulières (suffit pour le vocabulaire du template).
 */
export function accord(base: string, genre: Genre = 'm', plural = false): string {
  let w = base
  if (genre === 'f' && !w.endsWith('e')) w += 'e'
  if (plural) w += 's'
  return w
}
