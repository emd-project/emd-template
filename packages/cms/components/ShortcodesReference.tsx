'use client'

import { useState } from 'react'
import type { ShortcodeDoc } from '@/lib/content/shortcodes'

const TYPE_LABELS: Record<ShortcodeDoc['type'], string> = {
  shorthand: 'Raccourci',
  inline: 'Inline',
  block: 'Bloc',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      style={{
        padding: '6px 12px',
        background: copied ? 'rgba(107,143,113,.1)' : 'var(--bg-surface2, #f0f0f5)',
        border: `1px solid ${copied ? 'rgba(107,143,113,.3)' : 'var(--border)'}`,
        borderRadius: 7,
        color: copied ? '#6B8F71' : 'var(--text-muted)',
        fontSize: '12px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        fontFamily: 'inherit',
      }}
    >
      {copied ? 'Copié ✓' : 'Copier'}
    </button>
  )
}

export function ShortcodesReference({ docs }: { docs: ShortcodeDoc[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        padding: '14px 16px',
        background: 'rgba(var(--accent-1-rgb, 255,61,87), 0.06)',
        border: '1px solid rgba(var(--accent-1-rgb, 255,61,87), 0.15)',
        borderRadius: 10,
        color: 'var(--text-primary)',
        fontSize: '13px',
        lineHeight: 1.6,
      }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600 }}>
          Syntaxe [[…]] — plus simple, compatible WYSIWYG
        </p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Les shortcodes <code style={{ background: 'var(--bg-surface)', padding: '1px 5px', borderRadius: 4, fontSize: '11px' }}>[[…]]</code> se collent
          directement dans le corps de l&apos;article. Ils traversent l&apos;éditeur WYSIWYG sans être cassés.
          L&apos;ancienne syntaxe JSX <code style={{ background: 'var(--bg-surface)', padding: '1px 5px', borderRadius: 4, fontSize: '11px' }}>&lt;Component /&gt;</code> reste
          compatible.
        </p>
      </div>

      {docs.map((doc) => (
        <article
          key={doc.alias}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 16px',
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>
                <code style={{ fontFamily: 'var(--next-font-mono, monospace)', fontSize: '14px', color: 'var(--accent-1)', fontWeight: 600 }}>
                  [[{doc.alias}]]
                </code>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px', marginLeft: '8px' }}>
                  → &lt;{doc.component}&gt;
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {doc.description}
              </p>
            </div>
            <span style={{
              padding: '2px 8px',
              borderRadius: 12,
              background: 'var(--bg-surface2, #f0f0f5)',
              border: '1px solid var(--border)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {TYPE_LABELS[doc.type]}
            </span>
          </header>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px', marginTop: '10px' }}>
            <pre style={{
              flex: 1,
              margin: 0,
              padding: '10px 12px',
              background: 'var(--bg-surface2, #f0f0f5)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: 'var(--next-font-mono, monospace)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
            }}>
              {doc.example}
            </pre>
            <CopyButton text={doc.example} />
          </div>
        </article>
      ))}
    </div>
  )
}
