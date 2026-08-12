/**
 * Route preview RETIRÉE : l'identité `presse` (masthead + footer + home éditoriaux)
 * a été supprimée le 2026-08-02 — `isPresse()` rend désormais toujours `false` et
 * les sites beauté prennent `magazine` comme les autres (cf. lib/variants.ts).
 * Conservée en 404 explicite — le dossier est supprimé à l'init du site.
 */
import { notFound } from 'next/navigation'

export default function PreviewHomeV5() {
  return notFound()
}
