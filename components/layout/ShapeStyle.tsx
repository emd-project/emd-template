/**
 * ShapeStyle — permutation de FORME (anti-empreinte).
 * Surcharge les radius globaux (--radius-*) selon `niche.permutations.shape`.
 * Monté dans <head> du root layout. Server Component, zéro JS.
 *
 * - 'rounded' (défaut) : aucune surcharge → garde les radius de globals.css.
 * - 'soft'   : coins légèrement arrondis.
 * - 'sharp'  : coins droits (esthétique éditoriale/tech).
 */
import { resolveShape, type Shape } from '@/lib/variants'

const OVERRIDES: Record<Exclude<Shape, 'rounded'>, string> = {
  soft: ':root{--radius-sm:5px;--radius-md:9px;--radius-lg:13px;--radius-xl:18px}',
  sharp: ':root{--radius-sm:0px;--radius-md:0px;--radius-lg:0px;--radius-xl:2px}',
}

export function ShapeStyle({ shape }: { shape?: Shape }) {
  const s = shape ?? resolveShape()
  if (s === 'rounded') return null
  return <style dangerouslySetInnerHTML={{ __html: OVERRIDES[s] }} />
}
