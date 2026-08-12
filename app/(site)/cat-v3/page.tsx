/**
 * Route preview RETIRÉE : la variante catégorie `presse` a été supprimée le
 * 2026-08-02. Il reste `classic` (/cat-v1) et `editorial` (/cat-v2) — cf.
 * CATEGORY_PREVIEW dans lib/variants.ts.
 * Conservée en 404 explicite — le dossier est supprimé à l'init du site.
 */
import { notFound } from 'next/navigation'

export default function PreviewCatV3() {
  return notFound()
}
