import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/packages/cms/lib/get-session'
import { isGitHubOAuthEnabled } from '@/packages/cms/lib/auth'
import { cmsConfig } from '@/cms.config'
import { LoginForm } from '@/packages/cms/components/LoginForm'
import { PublishBar } from '@/packages/cms/components/PublishBar'

export const metadata: Metadata = {
  title: `Admin — ${cmsConfig.siteName}`,
  robots: { index: false, follow: false },
}

const ICONS: Record<string, string> = {
  articles: '📝', blog: '📰', authors: '👤', categories: '🏷',
  pages: '📄', settings: '⚙', media: '🖼', users: '👥',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const githubEnabled = isGitHubOAuthEnabled()

  if (!session) {
    return (
      <html lang="fr">
        <head>
          <link rel="icon" href="/icons/brand/favicon.svg" />
        </head>
        <body style={{ margin: 0, background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Space Grotesk', system-ui, sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #FF3D57 0%, #7B61FF 100%)', marginBottom: 16, fontSize: 24, boxShadow: '0 0 24px rgba(255,61,87,0.25)' }}>
                ⚡
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{cmsConfig.siteName}</h1>
              <p style={{ color: '#55556A', fontSize: 14, margin: 0 }}>Administration du contenu</p>
            </div>
            <div style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}>
              <LoginForm githubEnabled={githubEnabled} />
            </div>
          </div>
          <CmsStyles />
        </body>
      </html>
    )
  }

  const collections = Object.entries(cmsConfig.collections)
  const isAdmin = session.role === 'admin'

  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/icons/brand/favicon.svg" />
      </head>
      <body style={{ margin: 0, background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>

          {/* Sidebar */}
          <nav className="cms-sidebar" style={{ width: 240, background: '#0D0D14', borderRight: '1px solid rgba(255,255,255,0.07)', padding: 0, flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

            {/* Aurora line */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, #FF3D57, #7B61FF, #3DFFC0, #FF3D57)', backgroundSize: '300% 100%', animation: 'cms-aurora 8s linear infinite', opacity: 0.6 }} />

            {/* Brand */}
            <Link href="/admin" className="cms-nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px 22px', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #FF3D57, #7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, boxShadow: '0 0 12px rgba(255,61,87,0.2)' }}>
                ⚡
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#F0F0F5', letterSpacing: '-0.02em' }}>{cmsConfig.siteName}</span>
            </Link>

            {/* Content section */}
            <div style={{ padding: '16px 10px 4px' }}>
              <div className="cms-section-label">Contenu</div>
              {collections.filter(([, c]) => !c.singleton).map(([key, col]) => (
                <Link key={key} href={`/admin/${key}`} className="cms-nav-link">
                  <span className="cms-nav-icon">{ICONS[key] ?? '📋'}</span>
                  <span>{col.label}</span>
                </Link>
              ))}
              <Link href="/admin/media" className="cms-nav-link">
                <span className="cms-nav-icon">🖼</span>
                <span>Médias</span>
              </Link>
              <Link href="/admin/images" className="cms-nav-link">
                <span className="cms-nav-icon">📷</span>
                <span>Images du site</span>
              </Link>
              <Link href="/admin/shortcodes" className="cms-nav-link">
                <span className="cms-nav-icon">⚡</span>
                <span>Shortcodes</span>
              </Link>
            </div>

            {isAdmin && (
              <div style={{ padding: '12px 10px 4px' }}>
                <div className="cms-section-label">Administration</div>
                {collections.filter(([, c]) => c.singleton).map(([key, col]) => (
                  <Link key={key} href={`/admin/${key}`} className="cms-nav-link">
                    <span className="cms-nav-icon">{ICONS[key] ?? '📋'}</span>
                    <span>{col.label}</span>
                  </Link>
                ))}
                <Link href="/admin/users" className="cms-nav-link">
                  <span className="cms-nav-icon">👥</span>
                  <span>Utilisateurs</span>
                </Link>
              </div>
            )}

            {/* Publish bar */}
            <div style={{ marginTop: 'auto' }}>
              <PublishBar />
            </div>

            {/* User */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1C1C26, #13131A)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#9090A8', fontWeight: 700 }}>
                  {(session.displayName ?? session.user).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F0F5' }}>{session.displayName ?? session.user}</div>
                  <div style={{ fontSize: 10, color: '#55556A' }}>
                    {session.role === 'admin' ? 'Administrateur' : 'Rédacteur'}
                    {session.authMethod === 'github' ? ' · GitHub' : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/" className="cms-meta-link">← Voir le site</Link>
                <a href="/api/cms/auth/logout" className="cms-meta-link">Déconnexion</a>
              </div>
            </div>
          </nav>

          {/* Main */}
          <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1000, minWidth: 0 }}>
            {children}
          </main>
        </div>

        <CmsStyles />
      </body>
    </html>
  )
}

function CmsStyles() {
  return (
    <style>{`
      @keyframes cms-aurora {
        0% { background-position: 0% 50%; }
        100% { background-position: 300% 50%; }
      }

      .cms-section-label {
        font-size: 10px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.12em; color: #55556A; padding: 0 10px; margin-bottom: 6px;
      }

      .cms-nav-link {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 12px; color: #9090A8; text-decoration: none;
        font-size: 13px; font-weight: 500; border-radius: 8px;
        transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cms-nav-link:hover {
        background: rgba(255, 255, 255, 0.04); color: #F0F0F5;
      }
      .cms-nav-icon { font-size: 15px; width: 20px; text-align: center; }

      .cms-meta-link {
        font-size: 11px; color: #55556A; text-decoration: none;
        transition: color 150ms ease;
      }
      .cms-meta-link:hover { color: #9090A8; }

      /* Inputs */
      .cms-input {
        width: 100%; padding: 10px 14px; background: #13131A;
        border: 1px solid rgba(255,255,255,0.07); border-radius: 8px;
        color: #F0F0F5; font-size: 14px; font-family: inherit;
        box-sizing: border-box; transition: border-color 200ms ease;
        outline: none;
      }
      .cms-input:focus { border-color: #FF3D57; }
      .cms-input::placeholder { color: #55556A; }

      /* Buttons */
      .cms-btn-primary {
        padding: 10px 20px; background: linear-gradient(135deg, #FF3D57, #FF6B3D);
        color: #fff; border: none; border-radius: 8px; font-weight: 600;
        font-size: 13px; cursor: pointer; font-family: inherit;
        transition: opacity 200ms ease, transform 100ms ease;
      }
      .cms-btn-primary:hover { opacity: 0.9; }
      .cms-btn-primary:active { transform: scale(0.98); }

      .cms-btn-secondary {
        padding: 10px 20px; background: transparent;
        border: 1px solid rgba(255,255,255,0.07); border-radius: 8px;
        color: #9090A8; font-size: 13px; cursor: pointer; font-family: inherit;
        transition: all 150ms ease;
      }
      .cms-btn-secondary:hover { background: rgba(255,255,255,0.04); color: #F0F0F5; }

      /* Cards */
      .cms-card {
        background: #13131A; border: 1px solid rgba(255,255,255,0.07);
        border-radius: 12px; padding: 20px; transition: all 200ms ease;
      }
      .cms-card:hover {
        border-color: rgba(255,255,255,0.12);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }

      /* Badge */
      .cms-badge-live {
        font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
        background: rgba(61,255,192,0.1); color: #3DFFC0;
      }
      .cms-badge-draft {
        font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
        background: rgba(255,210,63,0.1); color: #FFD23F;
      }

      /* Toast */
      .cms-toast {
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        animation: cms-toast-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes cms-toast-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Table rows */
      .cms-row {
        display: grid; align-items: center; padding: 0;
        background: #13131A; text-decoration: none; color: #F0F0F5;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        transition: background 150ms ease;
      }
      .cms-row:hover { background: #1C1C26; }

      /* Responsive */
      @media (max-width: 768px) {
        .cms-sidebar { width: 60px !important; }
        .cms-sidebar span:not(.cms-nav-icon) { display: none !important; }
        .cms-nav-icon { margin: 0 auto; }
        .cms-nav-brand span { display: none !important; }
        main { padding: 20px !important; }
      }
    `}</style>
  )
}
