/**
 * Preview route REMOVED: the « Le fil » (`fil`) home was dropped on 2026-08-02
 * (two skeletons left — `magazine` and `marche`, see lib/variants.ts).
 * Kept as an explicit 404 — the folder is deleted when the site is init'd.
 */
import { notFound } from 'next/navigation'

export default function PreviewHomeV4En() {
  return notFound()
}
