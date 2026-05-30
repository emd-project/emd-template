'use client'

import { useState } from 'react'

export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '6px 12px',
        borderRadius: 6,
        background: copied ? 'rgba(61,255,192,0.15)' : 'rgba(123,97,255,0.15)',
        color: copied ? '#3DFFC0' : '#7B61FF',
        border: `1px solid ${copied ? 'rgba(61,255,192,0.3)' : 'rgba(123,97,255,0.3)'}`,
        cursor: 'pointer',
        transition: 'all 150ms ease',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ Copié' : '📋 Copier prompt'}
    </button>
  )
}
