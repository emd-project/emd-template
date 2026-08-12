/**
 * Route preview RETIRÉE : la variante article `presse` a été supprimée le
 * 2026-08-02. Il ne reste qu'un rendu d'article, `classic` (/art-v1) — cf.
 * ARTICLE_PREVIEW dans lib/variants.ts.
 * Conservée en 404 explicite — le dossier est supprimé à l'init du site.
 */
import { notFound } from 'next/navigation'

export default function PreviewArtV2() {
  return notFound()
}
