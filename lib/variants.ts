/**
 * lib/variants.ts — Résolution des variantes de design (système de variantes).
 *
 * Doctrine : RUNTIME BÊTE. Une seule source de vérité (niche.config), des
 * fallbacks gracieux, jamais de crash si un champ est absent. La sélection se
 * fait à l'init du site, pas au runtime. Ici on LIT le choix figé dans la config.
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
// classic = 2 colonnes (sommaire sticky + prose) · feature = colonne unique immersive
export type ArticleVariant = 'classic' | 'feature'
export const ARTICLE_VARIANTS: readonly ArticleVariant[] = ['classic', 'feature']

export function resolveArticleVariant(): ArticleVariant {
  const explicit = niche.layouts?.article
  if (explicit && ARTICLE_VARIANTS.includes(explicit)) return explicit
  return 'classic'
}

export const ARTICLE_PREVIEW: Record<string, ArticleVariant> = {
  'art-v1': 'classic',
  'art-v2': 'feature',
}

// ─── Permutation : forme (radius) ─────────────────────────────────────────
export type Shape = 'rounded' | 'soft' | 'sharp'

export function resolveShape(): Shape {
  return niche.permutations?.shape ?? 'rounded'
}
