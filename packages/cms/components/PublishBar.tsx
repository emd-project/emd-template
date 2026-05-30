'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPendingChanges, clearPendingChanges } from '../lib/pending'

const LAST_DEPLOY_KEY = 'cms_last_deploy'

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

export function PublishBar() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [lastDeploy, setLastDeploy] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const refreshPending = useCallback(() => {
    setPendingCount(getPendingChanges().length)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(LAST_DEPLOY_KEY)
    if (stored) setLastDeploy(Number(stored))
    refreshPending()
    window.addEventListener('cms_pending_update', refreshPending)
    return () => window.removeEventListener('cms_pending_update', refreshPending)
  }, [refreshPending])

  async function publish() {
    const pending = getPendingChanges()
    if (pending.length === 0) {
      setErrorMsg('Aucune modification en attente')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cms/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: pending }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }

      clearPendingChanges()
      const now = Date.now()
      localStorage.setItem(LAST_DEPLOY_KEY, String(now))
      setLastDeploy(now)
      setPendingCount(0)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const isLoading = status === 'loading'
  const isDone = status === 'done'
  const isError = status === 'error'

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      {pendingCount > 0 && status !== 'done' && (
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--accent-1, #FF3D57)', fontWeight: 600, textAlign: 'center' }}>
          {pendingCount} modification{pendingCount > 1 ? 's' : ''} en attente
        </p>
      )}

      <button
        type="button"
        onClick={publish}
        disabled={isLoading || (pendingCount === 0 && status === 'idle')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: 8,
          border: `1px solid ${isDone ? 'rgba(61,255,192,0.3)' : isError ? 'rgba(255,61,87,0.3)' : 'rgba(255,61,87,0.2)'}`,
          background: isDone ? 'rgba(61,255,192,0.1)' : isError ? 'rgba(255,61,87,0.08)' : 'rgba(255,61,87,0.08)',
          color: isDone ? '#3DFFC0' : isError ? '#FF3D57' : 'var(--accent-1, #FF3D57)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: isLoading || (pendingCount === 0 && status === 'idle') ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : pendingCount === 0 && status === 'idle' ? 0.4 : 1,
          fontFamily: 'inherit',
          letterSpacing: '-0.01em',
        }}
      >
        {isLoading && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="15" />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </svg>
        )}
        {isDone && '✓ '}
        {isLoading ? 'Publication…' : isDone ? 'Mis en ligne !' : isError ? 'Échec' : pendingCount === 0 ? 'Rien à publier' : 'Mettre en ligne'}
      </button>

      {isError && errorMsg && (
        <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#FF3D57', lineHeight: 1.4 }}>{errorMsg}</p>
      )}

      {lastDeploy && !isError && (
        <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#55556A', textAlign: 'center' }}>
          Dernière publication : {relativeTime(lastDeploy)}
        </p>
      )}
    </div>
  )
}
