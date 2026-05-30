import { encryptSession, sessionCookie } from './session'
import type { CmsSession } from '../types'

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token'
const GITHUB_USER = 'https://api.github.com/user'

function getOAuthConfig() {
  const clientId = process.env.GITHUB_CMS_CLIENT_ID
  const clientSecret = process.env.GITHUB_CMS_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}

function getAllowedUsers(): string[] {
  const raw = process.env.CMS_ALLOWED_USERS ?? ''
  return raw.split(',').map((u) => u.trim().toLowerCase()).filter(Boolean)
}

/** Check if GitHub OAuth is configured */
export function isGitHubOAuthEnabled(): boolean {
  return !!getOAuthConfig()
}

/** Redirect to GitHub OAuth authorize */
export function loginRedirectUrl(origin: string): string {
  const config = getOAuthConfig()
  if (!config) throw new Error('GitHub OAuth not configured')
  const callbackUrl = `${origin}/api/cms/auth/callback`
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    scope: 'repo',
  })
  return `${GITHUB_AUTHORIZE}?${params}`
}

/** Exchange OAuth code for session */
export async function handleCallback(code: string): Promise<{
  cookie: string
  user: string
} | { error: string }> {
  const config = getOAuthConfig()
  if (!config) return { error: 'GitHub OAuth not configured' }

  const tokenRes = await fetch(GITHUB_TOKEN, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
    }),
    cache: 'no-store',
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    return { error: tokenData.error_description ?? tokenData.error ?? 'Token exchange failed' }
  }

  const userRes = await fetch(GITHUB_USER, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    cache: 'no-store',
  })
  const userData = await userRes.json()
  const username = (userData.login as string)?.toLowerCase()

  if (!username) return { error: 'Could not get GitHub username' }

  const allowed = getAllowedUsers()
  if (allowed.length > 0 && !allowed.includes(username)) {
    return { error: `User "${username}" is not authorized` }
  }

  const session: CmsSession = {
    githubToken: tokenData.access_token,
    user: username,
    role: 'admin', // GitHub OAuth users are always admin
    authMethod: 'github',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }

  const encrypted = await encryptSession(session)
  const cookie = sessionCookie(encrypted, 30 * 24 * 60 * 60)

  return { cookie, user: username }
}

/** Clear session cookie */
export function logoutCookie(): string {
  return sessionCookie('', 0)
}
