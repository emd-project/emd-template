/**
 * lib/variants.ts — Résolution des variantes de design (système de variantes).
 *
 * Doctrine : RUNTIME BÊTE. Une seule source de vérité (niche.config), des
 * fallbacks gracieux, jamais de crash si un champ est absent. La SÉLECTION se fait
 * à l'INIT (suggestVariants écrit le choix dans niche.config), pas au runtime.
 *
 * 4 DESIGNS DISTINCTS (cf. components/home/HomeRouter) :
 *  - `marche`      → MarcheHome  ⭐ (orbites/chips, ticker, tableau du marché, spotlight n°1)
 *  - `comparateur` → ComparateurHome (hero split + carte + steps + stats)
 *  - `magazine`    → MagazineHome
 *  - `fil`         → FilHome
 *
 * ┌─ CHOIX DU DESIGN : le SECTEUR d'abord, le hasard ensuite ─────────────────┐
 * │ Le design n'est PAS un tirage aveugle : il dépend de l'intention de       │
 * │ l'utilisateur dans la niche.                                              │
 * │  • Assurance / Banque / Énergie / Télécom / Crédit / Casino → l'internaute│
 * │    vient COMPARER une offre à souscrire → famille **comparateur**         │
 * │    (⅔ `marche`, ⅓ `comparateur`).                                         │
 * │  • Voiture / Beauté / Retail & Tech / Hospitality / autres → thématique   │
 * │    éditoriale, on vient LIRE et se documenter → famille **éditoriale**    │
 * │    (⅔ `magazine`, ⅓ `fil`).                                               │
 * │ Dans chaque famille, le seed (domaine) tranche → deux sites du même       │
 * │ secteur ne tombent pas forcément sur le même design (anti-empreinte).     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import { niche } from '@/niche.config'

// ─── Home ────────────────────────────────────────────────────────────────
export type HomeVariant = 'magazine' | 'comparateur' | 'marche' | 'fil'
export const HOME_VARIANTS: readonly HomeVariant[] = ['magazine', 'comparateur', 'marche', 'fil']

export function resolveHomeVariant(): HomeVariant {
  const explicit = niche.layouts?.home
  if (explicit && HOME_VARIANTS.includes(explicit)) return explicit
  return niche.style.hero === 'split' ? 'comparateur' : 'magazine'
}

export const HOME_PREVIEW: Record<string, HomeVariant> = {
  'home-v1': 'magazine',
  'home-v2': 'comparateur',
  'home-v3': 'marche',
  'home-v4': 'fil',
}

// ─── Catégorie ──────────────────────────────────────────────────────
export type CategoryVariant = 'classic' | 'editorial'
export const CATEGORY_VARIANTS: readonly CategoryVariant[] = ['classic', 'editorial']

export function resolveCategoryVariant(): CategoryVariant {
  const explicit = niche.layouts?.category
  if (explicit && CATEGORY_VARIANTS.includes(explicit)) return explicit
  return 'classic'
}

export const CATEGORY_PREVIEW: Record<string, CategoryVariant> = {
  'cat-v1': 'classic',
  'cat-v2': 'editorial',
}

// ─── Article ───────────────────────────────────────────────────────
export type ArticleVariant = 'classic'
export const ARTICLE_VARIANTS: readonly ArticleVariant[] = ['classic']

export function resolveArticleVariant(): ArticleVariant {
  const explicit = niche.layouts?.article
  if (explicit && ARTICLE_VARIANTS.includes(explicit)) return explicit
  return 'classic'
}

export const ARTICLE_PREVIEW: Record<string, ArticleVariant> = {
  'art-v1': 'classic',
}

// ─── Permutations structurelles (anti-empreinte) ────────────────────────────
export type Shape = 'rounded' | 'soft' | 'sharp'
export type Border = 'hairline' | 'standard' | 'bold'
export type Shadow = 'flat' | 'standard' | 'deep'

export function resolveShape(): Shape {
  return niche.permutations?.shape ?? 'rounded'
}
export function resolveBorder(): Border {
  return niche.permutations?.border ?? 'standard'
}
export function resolveShadow(): Shadow {
  return niche.permutations?.shadow ?? 'standard'
}

// ─── Famille de home, déduite du SECTEUR ────────────────────────────────────
export type HomeFamily = 'comparateur' | 'editorial'

/**
 * Secteurs « offre à souscrire » : l'internaute vient comparer des prix/conditions.
 * (Colonne CATÉGORIE de pipeline/sites.csv, ou secteur de la spec.)
 */
const COMPARATEUR_KEYWORDS = [
  'assurance', 'banque', 'energie', 'énergie', 'telecom', 'télécom',
  'fournisseur', 'credit', 'crédit', 'pret', 'prêt', 'casino', 'paris',
  'mutuelle', 'abonnement',
]

/**
 * Famille de design à partir du secteur/catégorie de la niche.
 *  - « Assurance », « Banque », « Énergie », « Télécom », « Casino & Paris » → 'comparateur'
 *  - « Voiture », « Beauty », « Retailer & Tech », « Hospitality », … → 'editorial'
 * Défaut prudent : 'editorial' (une home magazine ne choque jamais ; un comparateur
 * plaqué sur une thématique éditoriale, si).
 */
export function homeFamily(sector: string | undefined | null): HomeFamily {
  const s = (sector ?? '').toLowerCase()
  return COMPARATEUR_KEYWORDS.some((k) => s.includes(k)) ? 'comparateur' : 'editorial'
}

/** Pools pondérés par famille — ⅔ / ⅓ (le 1er design est tiré 2× plus souvent). */
const POOL_COMPARATEUR = ['marche', 'marche', 'comparateur'] as const
const POOL_EDITORIAL = ['magazine', 'magazine', 'fil'] as const

// ─── Sélection AUTO déterministe (anti-empreinte) — à utiliser À L'INIT ──────
// Hash FNV-1a du seed (domaine) → combinaison stable & distincte par site.
// L'init ÉCRIT le résultat dans niche.config (layouts + permutations) ; le runtime lit.
function seedHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function at<T>(arr: readonly T[], n: number): T {
  return arr[n % arr.length]
}

/**
 * Suggestion déterministe d'une combinaison complète.
 *
 * @param seed    domaine du site (fait diverger deux forks automatiquement)
 * @param family  famille de home. Passer `homeFamily(secteur)` — secteur = colonne
 *                CATÉGORIE de sites.csv. Le SECTEUR décide de la famille, le SEED
 *                décide du design DANS la famille.
 *
 * `marche` est éligible d'office : depuis l'init, un classement seed est toujours
 * écrit (`content/data/classements.json`), donc son tableau du marché a des données.
 */
export function suggestVariants(
  seed: string = niche.domain || niche.siteName,
  family: HomeFamily = 'editorial'
): {
  home: HomeVariant
  category: CategoryVariant
  shape: Shape
  border: Border
  shadow: Shadow
} {
  const h = seedHash(seed)
  const pool = family === 'comparateur' ? POOL_COMPARATEUR : POOL_EDITORIAL
  return {
    home: at(pool, h),
    category: at(CATEGORY_VARIANTS, h >>> 2),
    shape: at(['rounded', 'soft', 'sharp'] as const, h >>> 4),
    border: at(['hairline', 'standard', 'bold'] as const, h >>> 6),
    shadow: at(['flat', 'standard', 'deep'] as const, h >>> 8),
  }
}
