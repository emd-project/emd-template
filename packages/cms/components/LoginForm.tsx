'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm({ githubEnabled }: { githubEnabled: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/cms/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur de connexion'); return }
      router.refresh()
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <div>
      {githubEnabled && (
        <>
          <a
            href="/api/cms/auth/login"
            style={{
              display: 'block', width: '100%', padding: '12px 24px',
              background: 'linear-gradient(135deg, #FF3D57, #7B61FF)',
              color: '#fff', borderRadius: 8, textDecoration: 'none',
              fontWeight: 600, fontSize: 14, textAlign: 'center',
              boxSizing: 'border-box', boxShadow: '0 0 24px rgba(255,61,87,0.15)',
              transition: 'opacity 200ms ease',
            }}
          >
            Se connecter avec GitHub
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: '#55556A', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span>ou</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className="cms-input"
        />
        <input
          type="password" placeholder="Mot de passe" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          className="cms-input"
        />
        {error && (
          <div style={{ padding: 10, background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', borderRadius: 8, color: '#FF3D57', fontSize: 13 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className={githubEnabled ? 'cms-btn-secondary' : 'cms-btn-primary'} style={{ opacity: loading ? 0.5 : 1 }}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
