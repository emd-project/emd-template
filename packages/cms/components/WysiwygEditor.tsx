'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { useCallback, useEffect, useRef, useState } from 'react'

type MediaItem = { name: string; url: string; sha: string }

type Props = {
  value: string
  onChange: (html: string) => void
}

export function WysiwygEditor({ value, onChange }: Props) {
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { style: 'color: #6af; text-decoration: underline;' } }),
      Image.configure({ HTMLAttributes: { style: 'max-width: 100%; height: auto; border-radius: 6px; margin: 12px 0;' } }),
      Placeholder.configure({ placeholder: 'Commencez à écrire…' }),
      Table.configure({ resizable: false, HTMLAttributes: { style: 'border-collapse: collapse; width: 100%; margin: 12px 0;' } }),
      TableRow,
      TableCell.configure({ HTMLAttributes: { style: 'border: 1px solid rgba(255,255,255,0.15); padding: 8px 12px;' } }),
      TableHeader.configure({ HTMLAttributes: { style: 'border: 1px solid rgba(255,255,255,0.15); padding: 8px 12px; background: rgba(255,255,255,0.05); font-weight: 600;' } }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 500px; padding: 16px; color: #e5e5e5; font-size: 15px; font-family: system-ui, sans-serif; line-height: 1.8;',
      },
    },
  })

  const lastExternalValue = useRef(value)
  useEffect(() => {
    if (editor && value !== lastExternalValue.current) {
      lastExternalValue.current = value
      editor.commands.setContent(value)
    }
  }, [editor, value])

  // Load media library
  async function loadMedia() {
    setMediaLoading(true)
    try {
      const res = await fetch('/api/cms/media/list')
      if (res.ok) {
        const data = await res.json()
        setMediaItems(data.items ?? [])
      }
    } finally {
      setMediaLoading(false)
    }
  }

  function openMediaPicker() {
    setShowMediaPicker(true)
    loadMedia()
  }

  function insertImage(url: string) {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
    setShowMediaPicker(false)
  }

  async function handleUploadInPicker(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/cms/media/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        insertImage(data.url)
      } else {
        const err = await res.json()
        alert(err.error ?? 'Upload failed')
      }
    } finally {
      setUploading(false)
      if (uploadRef.current) uploadRef.current.value = ''
    }
  }

  const addLink = useCallback(() => {
    if (!editor) return
    const url = prompt('URL du lien :')
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  const btn = (active: boolean) => ({
    padding: '4px 8px', background: active ? '#333' : 'transparent',
    border: '1px solid #333', borderRadius: 4, color: active ? '#fff' : '#ccc',
    cursor: 'pointer', fontSize: 12, fontWeight: 600 as const, minWidth: 28, lineHeight: '18px',
  })

  const sep = { width: 1, height: 20, background: '#333', margin: '0 4px', flexShrink: 0 }

  return (
    <div style={{ marginTop: 24, position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8 }}>
        Contenu
      </label>

      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px',
        background: '#111', border: '1px solid #333', borderBottom: 'none',
        borderRadius: '6px 6px 0 0', alignItems: 'center',
      }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} style={btn(editor.isActive('bold'))} title="Gras"><b>B</b></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} style={btn(editor.isActive('italic'))} title="Italique"><i>I</i></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={btn(editor.isActive('underline'))} title="Souligné"><u>U</u></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} style={btn(editor.isActive('strike'))} title="Barré"><s>S</s></button>

        <div style={sep} />

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btn(editor.isActive('heading', { level: 2 }))} title="Titre 2">H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btn(editor.isActive('heading', { level: 3 }))} title="Titre 3">H3</button>
        <button onClick={() => editor.chain().focus().setParagraph().run()} style={btn(editor.isActive('paragraph'))} title="Paragraphe">P</button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btn(editor.isActive('blockquote'))} title="Citation">❝</button>

        <div style={sep} />

        <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={btn(editor.isActive('bulletList'))} title="Liste à puces">•</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btn(editor.isActive('orderedList'))} title="Liste numérotée">1.</button>

        <div style={sep} />

        <button onClick={addLink} style={btn(editor.isActive('link'))} title="Lien">🔗</button>
        <button onClick={() => editor.chain().focus().unsetLink().run()} style={btn(false)} title="Retirer lien">✂</button>
        <button onClick={openMediaPicker} style={btn(false)} title="Insérer une image">🖼</button>

        <div style={sep} />

        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={btn(editor.isActive('codeBlock'))} title="Bloc code">{'<>'}</button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} style={btn(false)} title="Séparateur">—</button>

        <div style={sep} />

        <button onClick={() => editor.chain().focus().undo().run()} style={btn(false)} title="Annuler">↩</button>
        <button onClick={() => editor.chain().focus().redo().run()} style={btn(false)} title="Rétablir">↪</button>

        <div style={sep} />

        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} style={btn(false)} title="Insérer un tableau">⊞</button>
        <button onClick={() => editor.chain().focus().addRowAfter().run()} style={btn(false)} title="Ajouter une ligne">+↓</button>
        <button onClick={() => editor.chain().focus().addColumnAfter().run()} style={btn(false)} title="Ajouter une colonne">+→</button>
        <button onClick={() => editor.chain().focus().deleteRow().run()} style={btn(false)} title="Supprimer la ligne">−↓</button>
        <button onClick={() => editor.chain().focus().deleteColumn().run()} style={btn(false)} title="Supprimer la colonne">−→</button>
        <button onClick={() => editor.chain().focus().deleteTable().run()} style={btn(false)} title="Supprimer le tableau">⊟</button>
      </div>

      {/* Editor */}
      <div style={{ background: '#161616', border: '1px solid #333', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden' }}>
        <EditorContent editor={editor} />
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowMediaPicker(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: 700, maxHeight: '80vh', background: '#111', border: '1px solid #222', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Insérer une image</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #ff3d57, #ff6b3d)', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: uploading ? 0.5 : 1 }}>
                  {uploading ? 'Upload…' : '+ Uploader'}
                  <input ref={uploadRef} type="file" accept="image/*" onChange={handleUploadInPicker} style={{ display: 'none' }} disabled={uploading} />
                </label>
                <button onClick={() => setShowMediaPicker(false)} style={{ background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
                  Fermer
                </button>
              </div>
            </div>

            {/* Grid */}
            <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
              {mediaLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Chargement…</div>
              ) : mediaItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Aucune image. Uploadez votre premier fichier.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {mediaItems.map((item) => (
                    <button
                      key={item.sha}
                      onClick={() => insertImage(item.url)}
                      style={{ background: '#1a1a1a', border: '2px solid transparent', borderRadius: 8, padding: 0, cursor: 'pointer', overflow: 'hidden', textAlign: 'left', transition: 'border-color 150ms' }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ff3d57' }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.name} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '6px 8px', fontSize: 10, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor styles */}
      <style>{`
        .tiptap { outline: none; min-height: 500px; padding: 16px; }
        .tiptap h2 { font-size: 22px; font-weight: 700; margin: 24px 0 8px; color: #fff; }
        .tiptap h3 { font-size: 18px; font-weight: 600; margin: 20px 0 6px; color: #f0f0f0; }
        .tiptap h4 { font-size: 16px; font-weight: 600; margin: 16px 0 4px; color: #e0e0e0; }
        .tiptap p { margin: 0 0 12px; color: #e5e5e5; }
        .tiptap blockquote { border-left: 3px solid #444; padding-left: 16px; color: #aaa; margin: 12px 0; }
        .tiptap ul, .tiptap ol { padding-left: 24px; margin: 8px 0; color: #e5e5e5; }
        .tiptap li { margin: 4px 0; }
        .tiptap a { color: #6af; text-decoration: underline; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 6px; margin: 12px 0; display: block; }
        .tiptap strong { color: #fff; }
        .tiptap code { background: #222; padding: 2px 6px; border-radius: 3px; font-size: 13px; color: #f8f8f2; }
        .tiptap pre { background: #111; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 12px 0; }
        .tiptap pre code { background: none; padding: 0; }
        .tiptap hr { border: none; border-top: 1px solid #333; margin: 24px 0; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #555; pointer-events: none; float: left; height: 0; }
        .tiptap table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        .tiptap th, .tiptap td { border: 1px solid rgba(255,255,255,0.15); padding: 8px 12px; min-width: 80px; vertical-align: top; }
        .tiptap th { background: rgba(255,255,255,0.05); font-weight: 600; color: #fff; }
        .tiptap td { color: #e5e5e5; }
        .tiptap .selectedCell { background: rgba(102,170,255,0.12); }
      `}</style>
    </div>
  )
}
