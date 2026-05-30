import { cookies } from 'next/headers'
import { decryptSession } from './session'
import type { CmsSession } from '../types'

/** Get the current CMS session from cookies. Returns null if not logged in. */
export async function getSession(): Promise<CmsSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('cms-session')?.value
  if (!token) return null
  return decryptSession(token)
}

/** Get the GitHub token for API calls.
 * GitHub OAuth users use their own token; password users use the server token. */
export async function getGitHubToken(): Promise<string | null> {
  const session = await getSession()
  if (!session) return null

  if (session.authMethod === 'github' && session.githubToken) {
    return session.githubToken
  }

  // Password-auth users use the server-side PAT
  return process.env.CMS_GITHUB_TOKEN ?? null
}
