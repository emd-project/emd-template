/**
 * Preview route REMOVED. It previewed the `marche` home, now served by /en/home-v2
 * (see HOME_PREVIEW in lib/variants.ts). Kept as an explicit 404 — the folder is
 * deleted when the site is init'd.
 */
import { notFound } from 'next/navigation'

export default function PreviewHomeV3En() {
  return notFound()
}
