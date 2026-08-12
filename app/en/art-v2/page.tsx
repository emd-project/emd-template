/**
 * Preview route REMOVED: the `presse` article variant was dropped on 2026-08-02.
 * Only one article rendering remains, `classic` (/en/art-v1) — see ARTICLE_PREVIEW
 * in lib/variants.ts.
 * Kept as an explicit 404 — the folder is deleted when the site is init'd.
 */
import { notFound } from 'next/navigation'

export default function PreviewArtV2En() {
  return notFound()
}
