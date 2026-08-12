/**
 * Route preview RETIRÉE. Elle prévisualisait la home `marche`, désormais servie
 * par /home-v2 (cf. HOME_PREVIEW dans lib/variants.ts). Conservée en 404 explicite
 * — le dossier est supprimé à l'init du site.
 */
import { notFound } from 'next/navigation'

export default function PreviewHomeV3() {
  return notFound()
}
