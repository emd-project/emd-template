'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { FieldDef } from '../types'
import { WysiwygEditor } from './WysiwygEditor'
import { markdownToHtml, htmlToMarkdown, extractMdxBlocks, reinsertMdxBlocks } from '../lib/html-md'
import { addPendingChange } from '../lib/pending'
import { SeoScore } from './SeoScore'
import { ShortcodeAutocomplete } from './ShortcodeAutocomplete'

// --- Slugify ---
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// --- Toast ---
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '12px 20px', borderRadius: 8,
      background: type === 'success' ? '#0f2918' : '#2a1215',
      border: `1px solid ${type === 'success' ? '#1a5c2e' : '#5c2328'}`,
      color: type === 'success' ? '#6f6' : '#f88',
      fontSize: 13, fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'cms-toast-in 200ms ease-out',
    }}>
      {message}
      <style>{`@keyframes cms-toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

// --- FAQ Preview ---
function FaqPreview({ faq }: { faq: Record<string, unknown>[] }) {
  if (!faq.length) return null
  return (
    <div style={{ marginTop: 24 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 12 }}>FAQ Preview</label>
      <div style={{ border: '1px solid #222', borderRadius: 8, overflow: 'hidden' }}>
        {faq.map((item, i) => {
          const q = (item.question as string) || ''
          const a = (item.answer as string) || (item.reponse as string) || ''
          if (!q && !a) return null
          return (
            <div key={i} style={{ borderBottom: i < faq.length - 1 ? '1px solid #222' : 'none', padding: '14px 16px', background: i % 2 === 0 ? '#111' : '#0d0d0d' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e5e5', marginBottom: a ? 8 : 0 }}>{q || '(question vide)'}</div>
              {a && <div style={{ fontSize: 13, color: '#999', lineHeight: 1.6 }}>{a}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Sidebar field keys ---
const SIDEBAR_FIELDS = new Set([
  'description', 'featureImage', 'publishedAt', 'updatedAt',
  'readingTimeMin', 'categorie', 'tags', 'stickyCta',
  'stickyCtaMessage', 'draft', 'aiSummary', 'faq',
])

// --- Props ---
type Props = {
  collection: string
  slug: string
  fields: Record<string, FieldDef>
  format: 'mdx' | 'yaml'
  initialData: Record<string, unknown>
  initialBody: string
  sha: string
  isNew: boolean
}

export function ContentEditor({ collection, slug, fields, format, initialData, initialBody, sha, isNew }: Props) {
  const router = useRouter()
  const [data, setData] = useState<Record<string, unknown>>(initialData)
  const [mdxBlocks, setMdxBlocks] = useState<Record<string, string>>(() => {
    const { blocks } = extractMdxBlocks(initialBody)
    return blocks
  })
  const [bodyMd, setBodyMd] = useState(() => {
    const { cleaned } = extractMdxBlocks(initialBody)
    return cleaned
  })
  const [bodyHtml, setBodyHtml] = useState(() => {
    const { cleaned } = extractMdxBlocks(initialBody)
    return markdownToHtml(cleaned)
  })
  const [bodyMode, setBodyMode] = useState<'wysiwyg' | 'source'>('wysiwyg')
  const [entrySlug, setEntrySlug] = useState(slug)
  const [slugManual, setSlugManual] = useState(!isNew) // user manually edited slug?
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pasteContent, setPasteContent] = useState('')

  const isDraft = !!data.draft

  function renderField(key: string, field: FieldDef) {
    return field.type === 'image'
      ? <ImageField key={key} label={field.label} value={(data[key] as string) ?? ''} onChange={(v) => updateField(key, v)} articleTitle={(data.title as string) ?? ''} articleSlug={entrySlug} />
      : <FieldInput key={key} fieldKey={key} field={field} value={data[key]} onChange={(v) => updateField(key, v)} />
  }

  function updateField(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }))
    // Auto-slugify from title
    if (key === 'title' && isNew && !slugManual && typeof value === 'string') {
      setEntrySlug(slugify(value))
    }
  }

  function toggleDraft() {
    setData((prev) => ({ ...prev, draft: !prev.draft }))
  }

  function handleImportMd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target?.result as string
      if (!raw) return

      // Check for YAML frontmatter
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)

      if (fmMatch) {
        // Parse frontmatter fields
        const yamlStr = fmMatch[1]
        const body = fmMatch[2].trim()
        const parsed: Record<string, unknown> = {}

        for (const line of yamlStr.split('\n')) {
          const m = line.match(/^(\w[\w-]*)\s*:\s*(.+)$/)
          if (m) {
            let val: unknown = m[2].trim()
            // Remove quotes
            if (typeof val === 'string' && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
              val = (val as string).slice(1, -1)
            }
            // Inline array [a, b]
            if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
              val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
            }
            // Number
            if (typeof val === 'string' && /^\d+$/.test(val)) val = parseInt(val, 10)
            parsed[m[1]] = val
          }
        }

        // Fill fields from frontmatter
        setData((prev) => ({ ...prev, ...parsed }))

        // Use slug from frontmatter, or auto-generate from title
        if (isNew) {
          if (parsed.slug) {
            setEntrySlug(parsed.slug as string)
            setSlugManual(true)
          } else if (parsed.title) {
            setEntrySlug(slugify(parsed.title as string))
          }
        }

        // Fill body
        setBodyMd(body)
        setBodyHtml(markdownToHtml(body))

        setToast({ message: 'Fichier importé (avec frontmatter)', type: 'success' })
      } else {
        // No frontmatter — extract title from H1, description from first paragraph
        const lines = raw.trim().split('\n')
        const h1Match = lines[0]?.match(/^#\s+(.+)$/)
        const newData: Record<string, unknown> = {}

        let bodyStart = 0
        if (h1Match) {
          newData.title = h1Match[1]
          bodyStart = 1
          if (isNew) setEntrySlug(slugify(h1Match[1]))
        }

        // Find first non-empty line after H1 as description
        for (let i = bodyStart; i < lines.length; i++) {
          const l = lines[i].trim()
          if (l && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('>') && !l.startsWith('```')) {
            newData.description = l
            bodyStart = i + 1
            break
          }
          if (l) break // non-paragraph line, stop looking
        }

        setData((prev) => ({ ...prev, ...newData }))

        const body = lines.slice(bodyStart).join('\n').trim()
        setBodyMd(body)
        setBodyHtml(markdownToHtml(body))

        setToast({ message: 'Fichier importé (sans frontmatter — titre et description extraits)', type: 'success' })
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be imported again
    if (importRef.current) importRef.current.value = ''
  }

  function handlePasteImport() {
    const raw = pasteContent.trim()
    if (!raw) return

    const lines = raw.split('\n')
    const newData: Record<string, unknown> = {}
    const bodyLines: string[] = []
    const faqItems: { question: string; answer: string }[] = []

    let titleFound = false
    let descriptionFound = false
    let i = 0

    // First line that looks like a title: short, no period at end, not a heading marker
    while (i < lines.length) {
      const line = lines[i].trim()
      if (!line) { i++; continue }

      // Strip markdown heading prefix if present
      const cleanLine = line.replace(/^#{1,3}\s+/, '')

      if (!titleFound && cleanLine.length > 0 && cleanLine.length < 120 && !cleanLine.endsWith('.') && !cleanLine.startsWith('Q:') && !cleanLine.startsWith('**Q:**')) {
        newData.title = cleanLine
        titleFound = true
        if (isNew) setEntrySlug(slugify(cleanLine))
        i++
        continue
      }
      break
    }

    // First real paragraph → description
    while (i < lines.length) {
      const line = lines[i].trim()
      if (!line) { i++; continue }
      if (!descriptionFound && !line.startsWith('##') && !line.startsWith('Q:') && !line.startsWith('**Q:**') && !line.endsWith('?')) {
        newData.description = line
        descriptionFound = true
        i++
        continue
      }
      break
    }

    // Process remaining lines: FAQ detection + body
    while (i < lines.length) {
      const line = lines[i].trim()

      // FAQ: "Q: ..." or "**Q:** ..." pattern
      const qMatch = line.match(/^(?:\*\*Q:\*\*|Q:)\s*(.+)/)
      if (qMatch) {
        const question = qMatch[1].trim()
        // Next non-empty line(s) are the answer
        i++
        const answerParts: string[] = []
        while (i < lines.length) {
          const aLine = lines[i].trim()
          // Check for A: prefix
          const aMatch = aLine.match(/^(?:\*\*(?:A|R):\*\*|(?:A|R):)\s*(.+)/)
          if (aMatch) {
            answerParts.push(aMatch[1].trim())
            i++
            break
          } else if (aLine && !aLine.match(/^(?:\*\*Q:\*\*|Q:)/) && !aLine.startsWith('##')) {
            answerParts.push(aLine)
            i++
          } else {
            break
          }
        }
        faqItems.push({ question, answer: answerParts.join(' ') })
        continue
      }

      // FAQ: line ending with "?" followed by an answer
      if (line.endsWith('?') && !line.startsWith('##')) {
        const question = line
        i++
        const answerParts: string[] = []
        while (i < lines.length) {
          const aLine = lines[i].trim()
          if (aLine && !aLine.endsWith('?') && !aLine.startsWith('##') && !aLine.match(/^(?:\*\*Q:\*\*|Q:)/)) {
            answerParts.push(aLine)
            i++
          } else {
            break
          }
        }
        if (answerParts.length > 0) {
          faqItems.push({ question, answer: answerParts.join(' ') })
        } else {
          // No answer found, treat as body
          bodyLines.push(line)
        }
        continue
      }

      // Section breaks (## headings) → keep in body
      bodyLines.push(lines[i])
      i++
    }

    // Apply parsed data
    setData((prev) => {
      const updated = { ...prev, ...newData }
      if (faqItems.length > 0) {
        updated.faq = faqItems
      }
      return updated
    })

    const body = bodyLines.join('\n').trim()
    if (body) {
      setBodyMd(body)
      setBodyHtml(markdownToHtml(body))
    }

    // Build summary for toast
    const detected: string[] = []
    if (newData.title) detected.push('titre')
    if (newData.description) detected.push('description')
    if (faqItems.length > 0) detected.push(`${faqItems.length} FAQ`)
    if (body) detected.push('contenu')

    setToast({ message: `Import collé — ${detected.join(', ')} détecté${detected.length > 1 ? 's' : ''}`, type: 'success' })
    setShowPasteModal(false)
    setPasteContent('')
  }

  async function handleSave() {
    const finalSlug = entrySlug || slug
    if (!finalSlug) { setToast({ message: 'Le slug est requis', type: 'error' }); return }

    setSaving(true)
    try {
      const ext = format === 'mdx' ? '.mdx' : '.yaml'
      const catSlug = (data.categorie as string) ?? (data.categorySlug as string) ?? ''
      const filePath = catSlug
        ? `content/articles/${catSlug}/${finalSlug}${ext}`
        : `content/${collection === 'articles' ? 'articles/' : collection === 'produits' ? 'produits/' : collection + '/'}${finalSlug}${ext}`

      const finalBody = format === 'mdx' ? reinsertMdxBlocks(bodyMd, mdxBlocks) : ''
      addPendingChange({
        collection,
        filePath,
        frontmatter: data,
        body: finalBody,
        savedAt: Date.now(),
      })

      setToast({ message: 'Sauvegardé (en attente de publication)', type: 'success' })
      if (isNew) router.push(`/admin/${collection}/${finalSlug}`)
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : 'Erreur', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette entrée ?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cms/content/${collection}/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha }),
      })
      if (!res.ok) throw new Error('Delete failed')
      router.push(`/admin/${collection}`)
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : 'Erreur', type: 'error' })
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            {isNew ? 'Nouvelle entrée' : slug}
          </h1>
          {isDraft && (
            <span style={{ fontSize: 11, fontWeight: 600, background: '#332800', color: '#fa0', padding: '2px 8px', borderRadius: 4 }}>
              Brouillon
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Import .md */}
          {isNew && format === 'mdx' && (
            <>
              <label style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                Importer .md
                <input ref={importRef} type="file" accept=".md,.mdx,.markdown" onChange={handleImportMd} style={{ display: 'none' }} />
              </label>
              <button
                onClick={() => setShowPasteModal(true)}
                style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
              >
                {'\uD83D\uDCCB'} Coller du contenu
              </button>
            </>
          )}
          {/* Draft toggle */}
          <button onClick={toggleDraft} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #333', color: isDraft ? '#fa0' : '#888', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            {isDraft ? 'Passer en publié' : 'Brouillon'}
          </button>
          {!isNew && (
            <button onClick={handleDelete} disabled={saving} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #333', color: '#f44', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
              Supprimer
            </button>
          )}
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 14px', background: '#fff', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Enregistrement…' : isDraft ? 'Sauvegarder le brouillon' : 'Publier'}
          </button>
        </div>
      </div>

      {/* Slug field for new entries */}
      {isNew && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>Slug (nom du fichier)</label>
          <input
            type="text"
            value={entrySlug}
            onChange={(e) => { setEntrySlug(e.target.value); setSlugManual(true) }}
            placeholder="mon-article"
            style={{ width: '100%', padding: '8px 12px', background: '#161616', border: '1px solid #333', borderRadius: 6, color: '#e5e5e5', fontSize: 14, boxSizing: 'border-box' }}
          />
          {!slugManual && entrySlug && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Auto-généré depuis le titre</div>
          )}
        </div>
      )}

      {/* Two-column layout: main + sidebar */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }} className="cms-editor-layout">
        {/* Main column */}
        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
          {/* Title field */}
          {fields.title && <div style={{ marginBottom: 16 }}>{renderField('title', fields.title)}</div>}

          {/* Body editor for MDX — dual mode WYSIWYG / Source */}
          {format === 'mdx' && (
            <div>
              <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (bodyMode === 'source') {
                      const { cleaned, blocks } = extractMdxBlocks(bodyMd)
                      setMdxBlocks(blocks)
                      setBodyHtml(markdownToHtml(cleaned))
                      setBodyMode('wysiwyg')
                    }
                  }}
                  style={{
                    padding: '6px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    background: bodyMode === 'wysiwyg' ? '#1C1C26' : 'transparent',
                    color: bodyMode === 'wysiwyg' ? '#F0F0F5' : '#55556A',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px 0 0 6px', cursor: 'pointer',
                  }}
                >
                  Éditeur
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (bodyMode === 'wysiwyg') {
                      const md = htmlToMarkdown(bodyHtml)
                      const full = reinsertMdxBlocks(md, mdxBlocks)
                      setBodyMd(full)
                      setBodyMode('source')
                    }
                  }}
                  style={{
                    padding: '6px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    background: bodyMode === 'source' ? '#1C1C26' : 'transparent',
                    color: bodyMode === 'source' ? '#F0F0F5' : '#55556A',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: 'none',
                    borderRadius: '0 6px 6px 0', cursor: 'pointer',
                  }}
                >
                  Source MDX
                </button>
              </div>

              {bodyMode === 'wysiwyg' ? (
                <WysiwygEditor
                  value={bodyHtml}
                  onChange={(html) => {
                    setBodyHtml(html)
                    setBodyMd(htmlToMarkdown(html))
                  }}
                />
              ) : (
                <ShortcodeAutocomplete
                  value={bodyMd}
                  onChange={setBodyMd}
                />
              )}
            </div>
          )}

          {/* FAQ preview (read-only) */}
          {Array.isArray(data.faq) && (data.faq as Record<string, unknown>[]).length > 0 && (
            <FaqPreview faq={data.faq as Record<string, unknown>[]} />
          )}
        </div>

        {/* SEO sidebar */}
        <div style={{ width: 320, flexShrink: 0 }} className="cms-editor-sidebar">
          <div style={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 14, padding: 16, background: '#111', border: '1px solid #222', borderRadius: 10 }}>
            {format === 'mdx' && (
              <SeoScore
                title={(data.title as string) ?? ''}
                description={(data.description as string) ?? (data.excerpt as string) ?? ''}
                body={bodyMd}
                faq={Array.isArray(data.faq) ? data.faq : []}
              />
            )}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa', marginBottom: 2 }}>SEO &amp; Meta</div>
            {Object.entries(fields).filter(([key]) => key !== 'title' && SIDEBAR_FIELDS.has(key)).map(([key, field]) => renderField(key, field))}
            {/* Remaining fields not in sidebar set and not title */}
            {Object.entries(fields).some(([key]) => key !== 'title' && !SIDEBAR_FIELDS.has(key)) && (
              <>
                <div style={{ borderTop: '1px solid #222', paddingTop: 10, marginTop: 2, fontSize: 13, fontWeight: 700, color: '#aaa' }}>Autres champs</div>
                {Object.entries(fields).filter(([key]) => key !== 'title' && !SIDEBAR_FIELDS.has(key)).map(([key, field]) => renderField(key, field))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive: sidebar below main on narrow screens */}
      <style>{`@media (max-width: 900px) { .cms-editor-layout { flex-direction: column !important; } .cms-editor-sidebar { width: 100% !important; } }`}</style>

      {/* Paste import modal */}
      {showPasteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: 620, background: '#13131A', border: '1px solid #333', borderRadius: 12, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#e5e5e5' }}>
              {'\uD83D\uDCCB'} Coller du contenu
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888', lineHeight: 1.5 }}>
              Collez du texte brut (Google Docs, Word, notes). Le titre, la description, les FAQ et le contenu seront d{'é'}tect{'é'}s automatiquement.
            </p>
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              rows={14}
              placeholder={'Mon titre d\'article\n\nUne description courte du contenu.\n\n## Première section\n\nContenu de la section...\n\nQ: Une question ?\nR: Une réponse.'}
              style={{ width: '100%', padding: 12, background: '#161616', border: '1px solid #333', borderRadius: 8, color: '#e5e5e5', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, fontFamily: 'monospace' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowPasteModal(false); setPasteContent('') }}
                style={{ padding: '8px 16px', background: 'transparent', color: '#888', borderRadius: 6, border: '1px solid #333', cursor: 'pointer', fontSize: 12 }}
              >
                Annuler
              </button>
              <button
                onClick={handlePasteImport}
                disabled={!pasteContent.trim()}
                style={{ padding: '8px 16px', background: '#fff', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: pasteContent.trim() ? 1 : 0.5 }}
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// --- Field Inputs ---
function FieldInput({ fieldKey, field, value, onChange }: { fieldKey: string; field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const inputStyle = { width: '100%', padding: '8px 12px', background: '#161616', border: '1px solid #333', borderRadius: 6, color: '#e5e5e5', fontSize: 14, boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }

  switch (field.type) {
    case 'text':
    case 'slug':
    case 'date':
      return (
        <div>
          <label style={labelStyle}>{field.label}{field.required && ' *'}</label>
          <input type={field.type === 'date' ? 'date' : 'text'} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        </div>
      )
    case 'textarea':
    case 'richtext':
      return (
        <div>
          <label style={labelStyle}>{field.label}{field.required && ' *'}</label>
          <textarea value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      )
    case 'number':
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <input type="number" value={(value as number) ?? field.default ?? ''} onChange={(e) => onChange(Number(e.target.value))} style={inputStyle} />
        </div>
      )
    case 'select':
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
            <option value="">—</option>
            {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      )
    case 'tags':
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <input
            type="text"
            value={Array.isArray(value) ? (value as string[]).join(', ') : ''}
            onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            placeholder="tag1, tag2, tag3"
            style={inputStyle}
          />
        </div>
      )
    case 'image':
      return <ImageField label={field.label} value={(value as string) ?? ''} onChange={onChange} />
    case 'list':
      return <ListField label={field.label} value={Array.isArray(value) ? value as string[] : []} onChange={onChange} />
    case 'repeater':
      return <RepeaterField label={field.label} fields={field.fields ?? {}} value={Array.isArray(value) ? value as Record<string, unknown>[] : []} onChange={onChange} />
    default:
      return (
        <div>
          <label style={labelStyle}>{field.label} ({field.type})</label>
          <input type="text" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        </div>
      )
  }
}

function ImageField({ label, value, onChange, articleTitle, articleSlug }: { label: string; value: string; onChange: (v: unknown) => void; articleTitle?: string; articleSlug?: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/cms/media/upload', { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json(); alert(err.error ?? 'Upload failed'); return }
      const data = await res.json()
      onChange(data.url)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function openAiPrompt() {
    setAiPrompt(articleTitle || '')
    setShowAiPrompt(true)
  }

  async function handleGenerate() {
    if (!aiPrompt.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/cms/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, slug: articleSlug }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Generation failed'); return }
      onChange(data.url)
      setShowAiPrompt(false)
    } finally {
      setGenerating(false)
    }
  }

  const busy = uploading || generating

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8 }}>{label}</label>
      {value && (
        <div style={{ marginBottom: 10, position: 'relative', display: 'inline-block' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Feature" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, border: '1px solid #222', display: 'block' }} />
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#f44', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ padding: '8px 14px', background: '#1a1a1a', color: '#ccc', borderRadius: 8, cursor: 'pointer', fontSize: 12, border: '1px solid #222', opacity: busy ? 0.5 : 1 }}>
          {uploading ? 'Upload…' : '📁 Choisir'}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={busy} />
        </label>
        <button
          onClick={openAiPrompt}
          disabled={busy}
          style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #4285f4, #a855f7)', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: busy ? 0.5 : 1 }}
        >
          ✨ Générer avec IA
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/mon-image.webp"
          style={{ flex: '1 1 200px', padding: '8px 12px', background: '#161616', border: '1px solid #333', borderRadius: 6, color: '#e5e5e5', fontSize: 13, boxSizing: 'border-box' }}
        />
      </div>

      {/* AI Prompt panel */}
      {showAiPrompt && (
        <div style={{ marginTop: 10, padding: 16, background: '#111', border: '1px solid #222', borderRadius: 10 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>
            Décrivez l&apos;image souhaitée
          </label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
            placeholder="Ex: Un iPhone 17 Pro Max sur fond sombre avec des reflets néon bleus et rouges"
            style={{ width: '100%', padding: 10, background: '#161616', border: '1px solid #333', borderRadius: 6, color: '#e5e5e5', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={handleGenerate}
              disabled={generating || !aiPrompt.trim()}
              style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #4285f4, #a855f7)', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: generating || !aiPrompt.trim() ? 0.5 : 1 }}
            >
              {generating ? '✨ Génération en cours…' : '✨ Générer'}
            </button>
            <button
              onClick={() => setShowAiPrompt(false)}
              disabled={generating}
              style={{ padding: '8px 16px', background: 'transparent', color: '#888', borderRadius: 8, border: '1px solid #333', cursor: 'pointer', fontSize: 12 }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: unknown) => void }) {
  function add() { onChange([...value, '']) }
  function update(i: number, v: string) { const arr = [...value]; arr[i] = v; onChange(arr) }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)) }
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>{label}</label>
      {value.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <textarea value={item} onChange={(e) => update(i, e.target.value)} rows={2} style={{ flex: 1, padding: '8px 12px', background: '#161616', border: '1px solid #333', borderRadius: 6, color: '#e5e5e5', fontSize: 13, resize: 'vertical' }} />
          <button onClick={() => remove(i)} style={{ background: 'transparent', border: '1px solid #333', color: '#f44', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>
      ))}
      <button onClick={add} style={{ fontSize: 12, color: '#888', background: 'transparent', border: '1px dashed #333', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>+ Ajouter</button>
    </div>
  )
}

function RepeaterField({ label, fields, value, onChange }: { label: string; fields: Record<string, FieldDef>; value: Record<string, unknown>[]; onChange: (v: unknown) => void }) {
  function add() { onChange([...value, {}]) }
  function update(i: number, key: string, v: unknown) { const arr = [...value]; arr[i] = { ...arr[i], [key]: v }; onChange(arr) }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)) }
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8 }}>{label}</label>
      {value.map((item, i) => (
        <div key={i} style={{ padding: 12, background: '#111', border: '1px solid #222', borderRadius: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#666' }}>#{i + 1}</span>
            <button onClick={() => remove(i)} style={{ background: 'transparent', border: 'none', color: '#f44', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </div>
          {Object.entries(fields).map(([key, field]) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 2 }}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea value={(item[key] as string) ?? ''} onChange={(e) => update(i, key, e.target.value)} rows={2} style={{ width: '100%', padding: '6px 10px', background: '#161616', border: '1px solid #333', borderRadius: 4, color: '#e5e5e5', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              ) : (
                <input type="text" value={(item[key] as string) ?? ''} onChange={(e) => update(i, key, e.target.value)} style={{ width: '100%', padding: '6px 10px', background: '#161616', border: '1px solid #333', borderRadius: 4, color: '#e5e5e5', fontSize: 13, boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
        </div>
      ))}
      <button onClick={add} style={{ fontSize: 12, color: '#888', background: 'transparent', border: '1px dashed #333', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>+ Ajouter</button>
    </div>
  )
}
