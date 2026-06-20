/**
 * lib/variants.ts — Résolution des variantes de design (système de variantes).
 *
 * Doctrine : RUNTIME BÊTE. Une seule source de vérité (niche.config), des
 * fallbacks gracieux, jamais de crash si un champ est absent. La sélection se
 * fait à l'init du site, pas au runtime. Ici on LIT le choix figé dans la config.
 */
import { niche } from '@/niche.config'

// ─── Home ────────────────────────────────────────────────────────────────
// magazine · comparateur · marche (« Marché en direct ») · fil (« Le fil »)
export type HomeVariant = 'magazine' | 'comparateur' | 'marche' | 'fil'
export const HOME_VARIANTS: readonly HomeVariant[] = ['magazine', 'comparateur', 'marche', 'fil']

/**
 * Variante home effective.
 * 1. `niche.layouts.home` si défini et valide.
 * 2. Sinon, rétro-compat : `style.hero === 'split'` → comparateur, sinon magazine.
 */
export function resolveHomeVariant(): HomeVariant {
  const explicit = niche.layouts?.home
  if (explicit && HOME_VARIANTS.includes(explicit)) return explicit
  return niche.style.hero === 'split' ? 'comparateur' : 'magazine'
}

/** Mapping URL de preview → variante (/home-vN, dev/preview, noindex). */
export const HOME_PREVIEW: Record<string, HomeVariant> = {
  'home-v1': 'magazine',
  'home-v2': 'comparateur',
  'home-v3': 'marche',
  'home-v4': 'fil',
}

// ─── Catégorie ──────────────────────────────────────────────────────
export type CategoryVariant = 'classic' | 'editorial'
export const CATEGORY_VARIANTS: readonly CategoryVariant[] = ['classic', 'editorial']

/** Variante catégorie effective (défaut : 'classic' = hub-hero + grille). */
export function resolveCategoryVariant(): CategoryVariant {
  const explicit = niche.layouts?.category
  if (explicit && CATEGORY_VARIANTS.includes(explicit)) return explicit
  return 'classic'
}

export const CATEGORY_PREVIEW: Record<string, CategoryVariant> = {
  'cat-v1': 'classic',
  'cat-v2': 'editorial',
}

// ─── Permutation : forme (radius) ─────────────────────────────────────────
export type Shape = 'rounded' | 'soft' | 'sharp'

/** Forme effective (défaut : 'rounded' = look V1 historique). */
export function resolveShape(): Shape {
  return niche.permutations?.shape ?? 'rounded'
}
