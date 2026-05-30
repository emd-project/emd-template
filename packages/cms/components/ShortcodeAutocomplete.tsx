'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SHORTCODE_DOCS, type ShortcodeDoc } from '@/lib/content/shortcodes'

type Props = {
  value: string
  onChange: (value: string) => void
  style?: React.CSSProperties
}

export function ShortcodeAutocomplete({ value, onChange, style }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [suggestions, setSuggestions] = useState<ShortcodeDoc[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [triggerPos, setTriggerPos] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  const closeSuggestions = useCallback(() => {
    setSuggestions([])
    setTriggerPos(null)
    setSelectedIdx(0)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newVal = e.target.value
    const cursor = e.target.selectionStart
    onChange(newVal)

    const before = newVal.slice(0, cursor)
    const match = before.match(/\[\[([a-z]*)$/)

    if (match) {
      const query = match[1]
      const filtered = SHORTCODE_DOCS.filter((d) =>
        d.alias.startsWith(query)
      )
      if (filtered.length > 0) {
        setSuggestions(filtered)
        setTriggerPos(cursor - match[0].length)
        setSelectedIdx(0)
        updateMenuPosition(e.target, cursor)
      } else {
        closeSuggestions()
      }
    } else {
      closeSuggestions()
    }
  }

  function updateMenuPosition(textarea: HTMLTextAreaElement, cursor: number) {
    const textBefore = textarea.value.slice(0, cursor)
    const lines = textBefore.split('\n')
    const lineNumber = lines.length
    const lineHeight = 21

    const top = Math.min(lineNumber * lineHeight, textarea.clientHeight - 200)
    const left = 16

    setMenuPos({ top, left })
  }

  function insertSuggestion(doc: ShortcodeDoc) {
    if (triggerPos === null) return
    const textarea = textareaRef.current
    if (!textarea) return

    const cursor = textarea.selectionStart
    const before = value.slice(0, triggerPos)
    const after = value.slice(cursor)

    const insert = doc.example
    const newValue = before + insert + after
    onChange(newValue)
    closeSuggestions()

    requestAnimationFrame(() => {
      const newCursor = triggerPos + insert.length
      textarea.focus()
      textarea.setSelectionRange(newCursor, newCursor)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      insertSuggestion(suggestions[selectedIdx])
    } else if (e.key === 'Escape') {
      closeSuggestions()
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        closeSuggestions()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [closeSuggestions])

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        style={{
          width: '100%', minHeight: 500, padding: 16,
          background: '#0D0D14', color: '#D4D4D8',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
          fontFamily: 'var(--next-font-mono, monospace)', fontSize: 13,
          lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box',
          ...style,
        }}
      />

      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: menuPos.top,
          left: menuPos.left,
          width: 340,
          maxHeight: 260,
          overflowY: 'auto',
          background: '#13131A',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 100,
          padding: 4,
        }}>
          {suggestions.map((doc, i) => (
            <button
              key={doc.alias}
              type="button"
              onClick={() => insertSuggestion(doc)}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: '8px 10px',
                background: i === selectedIdx ? 'rgba(255,61,87,0.1)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-1, #FF3D57)', fontFamily: 'var(--next-font-mono, monospace)' }}>
                  [[{doc.alias}]]
                </code>
                <span style={{ fontSize: 10, color: '#55556A', textTransform: 'uppercase', fontWeight: 600 }}>
                  {doc.type}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#9090A8', lineHeight: 1.4 }}>
                {doc.description.slice(0, 80)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
