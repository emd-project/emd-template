'use client'

import { useState, useEffect } from 'react'

type User = { email: string; name: string; displayName?: string; role: 'admin' | 'editor' }

export function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Create form
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'editor'>('editor')

  useEffect(() => { loadUsers() }, [])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t) } }, [toast])

  async function loadUsers() {
    const res = await fetch('/api/cms/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/cms/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', email, name, password, role, ...(displayName ? { displayName } : {}) }),
    })
    const data = await res.json()
    if (!res.ok) { setToast({ message: data.error, type: 'error' }); return }

    setToast({ message: `${name} ajouté`, type: 'success' })
    setShowCreate(false)
    setEmail(''); setName(''); setDisplayName(''); setPassword(''); setRole('editor')
    loadUsers()
  }

  async function handleDelete(user: User) {
    if (!confirm(`Supprimer ${user.name} (${user.email}) ?`)) return
    await fetch('/api/cms/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', email: user.email }),
    })
    setToast({ message: `${user.name} supprimé`, type: 'success' })
    loadUsers()
  }

  async function handleToggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'editor' : 'admin'
    await fetch('/api/cms/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateRole', email: user.email, role: newRole }),
    })
    setToast({ message: `${user.name} → ${newRole}`, type: 'success' })
    loadUsers()
  }

  async function handleResetPassword(user: User) {
    const newPassword = prompt(`Nouveau mot de passe pour ${user.name} (min 12 caractères) :`)
    if (!newPassword) return
    const res = await fetch('/api/cms/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetPassword', email: user.email, password: newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setToast({ message: data.error, type: 'error' }); return }
    setToast({ message: 'Mot de passe réinitialisé', type: 'success' })
  }

  const inputStyle = {
    width: '100%', padding: '8px 12px', background: '#161616',
    border: '1px solid #333', borderRadius: 6, color: '#e5e5e5',
    fontSize: 14, boxSizing: 'border-box' as const,
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Utilisateurs</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ padding: '8px 16px', background: '#fff', color: '#000', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          {showCreate ? 'Annuler' : '+ Nouveau'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} style={{ padding: 20, background: '#161616', border: '1px solid #222', borderRadius: 8, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>Nom</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} placeholder="Julie Martin" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="julie@site.com" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>Nom affiché (optionnel)</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} placeholder="Ex : Julie M." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>Mot de passe (min 12 car.)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>Rôle</label>
              <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'editor')} style={inputStyle}>
                <option value="editor">Rédacteur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' }}>
            Créer l&apos;utilisateur
          </button>
        </form>
      )}

      {/* Users list */}
      {loading ? (
        <div style={{ color: '#666', fontSize: 14 }}>Chargement…</div>
      ) : (
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #222' }}>
          {users.length === 0 && (
            <div style={{ padding: 20, background: '#161616', color: '#666', textAlign: 'center', fontSize: 14 }}>
              Aucun utilisateur. Les admins GitHub se connectent via OAuth.
            </div>
          )}
          {users.map((user) => (
            <div key={user.email} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#161616', borderBottom: '1px solid #1a1a1a', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5' }}>{user.displayName || user.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{user.displayName ? `${user.name} · ${user.email}` : user.email}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: user.role === 'admin' ? '#1a1a3e' : '#1a2e1a',
                color: user.role === 'admin' ? '#88f' : '#6f6',
              }}>
                {user.role === 'admin' ? 'Admin' : 'Rédacteur'}
              </span>
              <button onClick={() => handleToggleRole(user)} title="Changer le rôle" style={{ background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>
                Rôle
              </button>
              <button onClick={() => handleResetPassword(user)} title="Reset mot de passe" style={{ background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>
                MDP
              </button>
              <button onClick={() => handleDelete(user)} title="Supprimer" style={{ background: 'transparent', border: '1px solid #333', color: '#f44', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: '#555' }}>
        Les administrateurs GitHub (OAuth) ne sont pas listés ici — ils ont automatiquement le rôle admin.
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8,
          background: toast.type === 'success' ? '#0f2918' : '#2a1215',
          border: `1px solid ${toast.type === 'success' ? '#1a5c2e' : '#5c2328'}`,
          color: toast.type === 'success' ? '#6f6' : '#f88',
          fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
