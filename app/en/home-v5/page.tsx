/**
 * Preview route REMOVED: the `presse` identity (editorial masthead + footer + home)
 * was dropped on 2026-08-02 — `isPresse()` now always returns `false` and beauty
 * sites use `magazine` like everyone else (see lib/variants.ts).
 * Kept as an explicit 404 — the folder is deleted when the site is init'd.
 */
import { notFound } from 'next/navigation'

export default function PreviewHomeV5En() {
  return notFound()
}
