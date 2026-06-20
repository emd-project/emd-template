/**
 * lib/variants.ts — Résolution des variantes de design (système de variantes).
 *
 * Doctrine : RUNTIME BÊTE. Une seule source de vérité (niche.config), des
 * fallbacks gracieux, jamais de crash si un champ est absent. La sélection se
 * fait à l'init du site (Claude choisit la variante selon la thématique), pas
 * au runtime. Ici on ne fait que LIRE le choix figé dans la config.
 *
 * Rétro-compatibilité : si `niche.layouts.home` est absent, on retombe sur le
 * comportement historique piloté par `niche.style.hero`.
 */
import { niche } from '@/niche.config'

// ─── Home ────────────────────────────────────────────────────────────────
export type HomeVariant = 'magazine' | 'comparateur' | 'dual'
export const HOME_VARIANTS: readonly HomeVariant[] = ['magazine', 'comparateur', 'dual']

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

/** Mapping URL de preview → variante. Sert aux routes /home-vN (dev/preview). */
export const HOME_PREVIEW: Record<string, HomeVariant> = {
  'home-v1': 'magazine',
  'home-v2': 'comparateur',
  'home-v3': 'dual',
}

// ─── Permutation : forme (radius) ─────────────────────────────────────────
export type Shape = 'rounded' | 'soft' | 'sharp'

/** Forme effective (défaut : 'rounded' = look V1 historique). */
export function resolveShape(): Shape {
  return niche.permutations?.shape ?? 'rounded'
}
