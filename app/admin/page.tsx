import Link from 'next/link'
import { cmsConfig } from '@/cms.config'
import { getSession, getGitHubToken } from '@/packages/cms/lib/get-session'
import { listFiles } from '@/packages/cms/lib/github'

const ICONS: Record<string, string> = {
  articles: '📝', blog: '📰', authors: '👤', categories: '🏷', pages: '📄', settings: '⚙',
}

const ACCENTS = ['#FF3D57', '#3D9BFF', '#FFD23F', '#3DFFC0', '#7B61FF', '#FF6B3D']

export default async function AdminDashboard() {
  const session = await getSession()
  const token = await getGitHubToken()
  const collections = Object.entries(cmsConfig.collections).filter(([, c]) => !c.singleton)

  const counts: Record<string, number> = {}
  if (token) {
    await Promise.all(
      collections.map(async ([key, col]) => {
        try {
          const files = await listFiles(token, cmsConfig.repo, col.path, cmsConfig.branch)
          counts[key] = files.filter((f) => f.type === 'file').length
        } catch { counts[key] = 0 }
      })
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Bonjour{session ? `, ${session.user}` : ''}
        </h1>
        <p style={{ color: '#55556A', fontSize: 14, margin: 0 }}>Que souhaitez-vous faire aujourd&apos;hui ?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {collections.map(([key, col], i) => (
          <Link key={key} href={`/admin/${key}`} className="cms-card" style={{ display: 'block', textDecoration: 'none', color: '#F0F0F5', position: 'relative', overflow: 'hidden' }}>
            {/* Accent line top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: ACCENTS[i % ACCENTS.length], opacity: 0.5 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{ICONS[key] ?? '📋'}</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: ACCENTS[i % ACCENTS.length], fontVariantNumeric: 'tabular-nums' }}>
                {counts[key] ?? '—'}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{col.label}</div>
            <div style={{ fontSize: 11, color: '#55556A' }}>{col.path}</div>
          </Link>
        ))}

        <Link href="/admin/media" className="cms-card" style={{ display: 'block', textDecoration: 'none', color: '#F0F0F5', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#7B61FF', opacity: 0.5 }} />
          <div style={{ marginBottom: 14 }}><span style={{ fontSize: 22 }}>🖼</span></div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Médias</div>
          <div style={{ fontSize: 11, color: '#55556A' }}>Vercel Blob</div>
        </Link>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#55556A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actions rapides</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {collections.map(([key, col]) => (
            <Link key={key} href={`/admin/${key}/new`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#13131A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, textDecoration: 'none', color: '#9090A8', fontSize: 12, fontWeight: 500, transition: 'all 150ms ease' }}>
              <span style={{ color: '#FF3D57' }}>+</span> {col.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
