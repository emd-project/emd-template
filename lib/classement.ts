/**
 * lib/classement.ts — classements « Top N » de la niche (asset GEO).
 * DONNÉES : content/data/classements.json (FR) + classements.en.json (EN).
 * Ce module TYPE et expose ces données, locale-aware. Le runtime ne fait AUCUNE
 * recherche : le check SERP qui remplit ces JSON a lieu à l'init (cf. CLAUDE.md).
 *
 * PARITÉ FR⇄EN : si la locale EN est active, classements.en.json DOIT couvrir le FR
 * (test tests/i18n-parity.test.ts).
 */
import classementsData from '@/content/data/classements.json'
import classementsDataEn from '@/content/data/classements.en.json'

export type ClassementItem = {
  rank: number
  nom: string
  score?: string
  badge?: string
  bestFor?: string
  verdict?: string
  pros?: string[]
  cons?: string[]
  prix?: string
  /** Lien NEUTRE éventuel (source officielle / marque). Jamais affilié. */
  url?: string
}

/**
 * Section d'analyse long-form (asset GEO). `q` est un H2 **formulé en QUESTION**
 * (≥70% des H2 doivent être des questions) ; `body` est la réponse **answer-first**
 * (1re phrase = réponse directe, puis développement). Plusieurs paragraphes :
 * séparer par une ligne vide (`\n\n`). L'ensemble des sections + intro + FAQ doit
 * porter la page à **≥ 1000 mots** (doctrine classement = asset GEO #1).
 */
export type ClassementSection = {
  q: string
  body: string
}

export type Classement = {
  slug: string
  label: string
  /**
   * Genre grammatical du `label` (ex. « néobanques » → 'f'). Pilote l'accord du
   * titre « Top N meilleur·e·s … » (cf. lib/utils/grammar.ts). Repli : niche.entityGender.
   */
  genre?: 'm' | 'f'
  title?: string
  updated?: string
  /**
   * Résumé COURT (≤ ~160 caractères) — utilisé pour la CARTE du hub `/classement`
   * et la `<meta description>`. À NE PAS confondre avec `intro` (paragraphe long
   * answer-first du corps de page). Si absent, le rendu tronque `intro` (cf. lib/utils/text.ts).
   */
  excerpt?: string
  /** Paragraphe d'introduction LONG (answer-first) affiché en tête du corps de page. */
  intro?: string
  tldr?: string[]
  /** Sections d'analyse long-form (H2 en questions, answer-first). ≥1000 mots avec l'intro + FAQ. */
  sections?: ClassementSection[]
  criteria?: string[]
  methodology?: string
  sources?: { label: string; url?: string }[]
  faq?: { q: string; a: string }[]
  items: ClassementItem[]
}

export const CLASSEMENTS = classementsData as unknown as Record<string, Classement>
export const CLASSEMENTS_EN = classementsDataEn as unknown as Record<string, Classement>

/** Slugs canoniques (FR) pour la génération statique. */
export const CLASSEMENT_SLUGS = Object.keys(CLASSEMENTS)

/** Jeu de classements pour une locale (EN si dispo, sinon repli FR). */
export function getClassements(locale: string = 'fr'): Record<string, Classement> {
  if (locale === 'en' && Object.keys(CLASSEMENTS_EN).length > 0) return CLASSEMENTS_EN
  return CLASSEMENTS
}

/** Un classement par slug, locale-aware (repli FR si l'entrée EN manque). */
export function getClassement(slug: string, locale: string = 'fr'): Classement | undefined {
  if (locale === 'en') return CLASSEMENTS_EN[slug] ?? CLASSEMENTS[slug]
  return CLASSEMENTS[slug]
}
