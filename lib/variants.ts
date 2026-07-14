/**
 * lib/variants.ts — Résolution des variantes de design (système de variantes).
 *
 * Doctrine : RUNTIME BÊTE. Une seule source de vérité (niche.config), des
 * fallbacks gracieux, jamais de crash si un champ est absent. La SÉLECTION se fait
 * à l'INIT (suggestVariants écrit le choix dans niche.config), pas au runtime.
 * Ici on LIT le choix figé + on EXPOSE le helper de suggestion déterministe.
 *
 * 4 DESIGNS RÉELLEMENT DISTINCTS (cf. components/home/HomeRouter) — la variété
 * inter-sites prime (anti-empreinte) : on ne sert PAS le même design partout,
 * même si l'un est plus joli.
 *  - `magazine`    → MagazineHome
 *  - `marche`      → MarcheHome  ⭐ (design « Marché » : orbites/chips, ticker,
 *                    tableau du marché, spotlight du n°1 — data-driven `lib/classement`)
 *  - `comparateur` → ComparateurHome (hero split + carte + steps + stats)
 *  - `fil`         → FilHome
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
// Surchargent UNIQUEMENT des tokens (radius/border/shadow) via PermutationStyle.
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

// ─── Sélection AUTO déterministe (anti-empreinte) — à utiliser À L'INIT ──────────────
// Hash FNV-1a du seed (domaine) → combinaison stable & distincte par site. Deux
// forks de domaines différents divergent automatiquement. L'init ÉCRIT ensuite le
// résultat dans niche.config (layouts + permutations) ; le runtime ne fait que lire.
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
 * POOL HOME PONDÉRÉ — `marche` (le design le plus abouti) est tiré **2× plus souvent**
 * que `comparateur` : entre ces deux-là, ~2/3 marché / ~1/3 comparateur. `magazine` et
 * `fil` gardent leur part. Répartition visée sur un grand nombre de domaines :
 *   magazine 20 % · marche 40 % · comparateur 20 % · fil 20 %
 * On NE sert pas le même design partout, même le plus joli : la variété inter-sites
 * est un objectif (anti-empreinte). Pour changer la pondération, joue sur les
 * répétitions dans ce tableau.
 */
const HOME_POOL = ['magazine', 'marche', 'marche', 'comparateur', 'fil'] as const

/**
 * Suggestion déterministe d'une combinaison complète à partir d'un seed (domaine).
 * `marche` est éligible d'office : depuis l'init, un classement seed est toujours
 * écrit (`content/data/classements.json`), donc son tableau du marché a des données.
 */
export function suggestVariants(seed: string = niche.domain || niche.siteName): {
  home: HomeVariant
  category: CategoryVariant
  shape: Shape
  border: Border
  shadow: Shadow
} {
  const h = seedHash(seed)
  return {
    home: at(HOME_POOL, h),
    category: at(CATEGORY_VARIANTS, h >>> 2),
    shape: at(['rounded', 'soft', 'sharp'] as const, h >>> 4),
    border: at(['hairline', 'standard', 'bold'] as const, h >>> 6),
    shadow: at(['flat', 'standard', 'deep'] as const, h >>> 8),
  }
}
