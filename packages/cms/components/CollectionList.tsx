'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type EntryMeta = {
  slug: string
  title: string
  publishedAt: string
  categorie: string
  draft: boolean
}

type SortKey = 'title' | 'publishedAt' | 'categorie'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 20

export function CollectionList({ collection, label, entries }: { collection: string; label: string; entries: EntryMeta[] }) {
  const [search, setSearch] = useState('')
  const [filterDraft, setFilterDraft] = useState<'all' | 'published' | 'draft'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('publishedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let result = entries

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.categorie.toLowerCase().includes(q)
      )
    }

    // Filter draft
    if (filterDraft === 'published') result = result.filter((e) => !e.draft)
    if (filterDraft === 'draft') result = result.filter((e) => e.draft)

    // Sort
    result = [...result].sort((a, b) => {
      const av = a[sortKey] || ''
      const bv = b[sortKey] || ''
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [entries, search, filterDraft, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'publishedAt' ? 'desc' : 'asc')
    }
    setPage(0)
  }

  const sortArrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const draftCount = entries.filter((e) => e.draft).length

  const btnStyle = (active: boolean) => ({
    padding: '5px 12px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
    border: `1px solid ${active ? 'rgba(255,61,87,0.3)' : 'rgba(255,255,255,0.07)'}`,
    background: active ? 'rgba(255,61,87,0.1)' : 'transparent',
    color: active ? '#FF3D57' : '#9090A8',
    fontFamily: 'inherit', transition: 'all 150ms ease',
  })

  const thStyle = (key: SortKey) => ({
    padding: '10px 12px', textAlign: 'left' as const, fontSize: 10, fontWeight: 700,
    color: sortKey === key ? '#F0F0F5' : '#55556A', cursor: 'pointer', userSelect: 'none' as const,
    textTransform: 'uppercase' as const, letterSpacing: '0.1em',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{label}</h1>
        <Link
          href={`/admin/${collection}/new`}
          style={{ padding: '8px 16px', background: '#fff', color: '#000', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
        >
          + Nouveau
        </Link>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher par titre, slug, catégorie…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          style={{ flex: '1 1 200px', padding: '8px 12px', background: '#13131A', border: '1px solid #333', borderRadius: 6, color: '#F0F0F5', fontSize: 13, minWidth: 200 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => { setFilterDraft('all'); setPage(0) }} style={btnStyle(filterDraft === 'all')}>
            Tous ({entries.length})
          </button>
          <button onClick={() => { setFilterDraft('published'); setPage(0) }} style={btnStyle(filterDraft === 'published')}>
            Publiés ({entries.length - draftCount})
          </button>
          {draftCount > 0 && (
            <button onClick={() => { setFilterDraft('draft'); setPage(0) }} style={btnStyle(filterDraft === 'draft')}>
              Brouillons ({draftCount})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 70px', background: '#111', borderBottom: '1px solid #222' }}>
          <div style={thStyle('title')} onClick={() => toggleSort('title')}>Titre{sortArrow('title')}</div>
          <div style={thStyle('publishedAt')} onClick={() => toggleSort('publishedAt')}>Date{sortArrow('publishedAt')}</div>
          <div style={thStyle('categorie')} onClick={() => toggleSort('categorie')}>Cat.{sortArrow('categorie')}</div>
          <div style={{ padding: '8px 12px', fontSize: 11, color: '#55556A' }}>Statut</div>
        </div>

        {paged.length === 0 && (
          <div style={{ padding: 20, background: '#13131A', color: '#55556A', textAlign: 'center', fontSize: 14 }}>
            {search ? 'Aucun résultat' : 'Aucune entrée'}
          </div>
        )}

        {paged.map((entry) => (
          <Link
            key={entry.slug}
            href={`/admin/${collection}/${entry.slug}`}
            style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 70px', alignItems: 'center', padding: 0, background: '#13131A', textDecoration: 'none', color: '#F0F0F5', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div style={{ padding: '10px 12px', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.title}
            </div>
            <div style={{ padding: '10px 12px', fontSize: 12, color: '#9090A8' }}>
              {entry.publishedAt || '—'}
            </div>
            <div style={{ padding: '10px 12px', fontSize: 12, color: '#9090A8' }}>
              {entry.categorie || '—'}
            </div>
            <div style={{ padding: '10px 12px' }}>
              {entry.draft ? (
                <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(255,210,63,0.1)', color: '#FFD23F', padding: '2px 8px', borderRadius: 4 }}>Draft</span>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(61,255,192,0.1)', color: '#3DFFC0', padding: '2px 8px', borderRadius: 4 }}>Live</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer: count + pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ fontSize: 12, color: '#55556A' }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          {search && ` pour "${search}"`}
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 4, cursor: 'pointer', border: '1px solid #333', background: 'transparent', color: page === 0 ? '#444' : '#ccc' }}
            >
              ← Préc.
            </button>
            <span style={{ padding: '4px 8px', fontSize: 12, color: '#9090A8' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 4, cursor: 'pointer', border: '1px solid #333', background: 'transparent', color: page >= totalPages - 1 ? '#444' : '#ccc' }}
            >
              Suiv. →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
