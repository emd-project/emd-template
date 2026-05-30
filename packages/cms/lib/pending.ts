/**
 * Pending changes management — localStorage queue for batch publishing.
 * Shared between ContentEditor (writes) and PublishBar (reads + clears).
 */

const STORAGE_KEY = 'cms_pending_changes'

export interface PendingChange {
  collection: string
  filePath: string
  frontmatter: Record<string, unknown>
  body: string
  savedAt: number
}

export function getPendingChanges(): PendingChange[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as PendingChange[]
  } catch { return [] }
}

export function setPendingChanges(changes: PendingChange[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(changes))
  window.dispatchEvent(new Event('cms_pending_update'))
}

export function addPendingChange(change: PendingChange) {
  const current = getPendingChanges()
  const idx = current.findIndex((c) => c.filePath === change.filePath)
  if (idx >= 0) current[idx] = change
  else current.push(change)
  setPendingChanges(current)
}

export function clearPendingChanges() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('cms_pending_update'))
}
