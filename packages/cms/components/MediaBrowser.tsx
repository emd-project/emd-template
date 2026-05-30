'use client'

import { useState, useRef } from 'react'

type MediaItem = {
  name: string
  path: string
  type: 'file' | 'dir'
  size: number
  sha: string
  url: string | null
}

export function MediaBrowser({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/cms/media/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Upload failed')
        return
      }

      const data = await res.json()
      setItems((prev) => [...prev, {
        name: file.name,
        path: `public/images/${file.name}`,
        type: 'file',
        size: file.size,
        sha: data.sha,
        url: data.url,
      }])
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Supprimer ${item.name} ?`)) return

    const res = await fetch('/api/cms/media/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: item.path, sha: item.sha }),
    })

    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.sha !== item.sha))
    }
  }

  const imageFiles = items.filter((i) => i.type === 'file')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Médias</h1>
        <label style={{ padding: '8px 16px', background: '#fff', color: '#000', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}>
          {uploading ? 'Upload…' : '+ Upload'}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {imageFiles.map((item) => (
          <div key={item.sha} style={{ background: '#161616', border: '1px solid #222', borderRadius: 8, overflow: 'hidden' }}>
            {item.url && (
              <div style={{ height: 120, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
              <button onClick={() => handleDelete(item)} style={{ background: 'transparent', border: 'none', color: '#f44', cursor: 'pointer', fontSize: 11, flexShrink: 0, marginLeft: 4 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {imageFiles.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#666', fontSize: 14 }}>
          Aucune image. Uploadez votre premier fichier.
        </div>
      )}
    </div>
  )
}
