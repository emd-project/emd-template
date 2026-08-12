/**
 * Route preview RETIRÉE : la home « Le fil » (`fil`) a été supprimée le 2026-08-02
 * (deux squelettes restants — `magazine` et `marche`, cf. lib/variants.ts).
 * Conservée en 404 explicite — le dossier est supprimé à l'init du site.
 */
import { notFound } from 'next/navigation'

export default function PreviewHomeV4() {
  return notFound()
}
