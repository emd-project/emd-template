/**
 * User management — reads/writes content/users.yaml via GitHub API.
 */

import type { CmsUser, CmsRole } from '../types'
import { getFile, putFile } from './github'
import { hashPassword, generateSalt, verifyPassword, validatePassword } from './password'

const USERS_PATH = 'content/users.yaml'

/** Parse simple YAML array of users */
function parseUsersYaml(raw: string): CmsUser[] {
  const users: CmsUser[] = []
  const blocks = raw.split(/^- /m).filter(Boolean)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const user: Record<string, string> = {}
    for (const line of lines) {
      const match = line.trim().match(/^(\w+)\s*:\s*(.+)$/)
      if (match) {
        user[match[1]] = match[2].replace(/^["']|["']$/g, '')
      }
    }
    if (user.email && user.hash && user.salt) {
      users.push({
        email: user.email,
        name: user.name || user.email,
        ...(user.displayName ? { displayName: user.displayName } : {}),
        role: (user.role as CmsRole) || 'editor',
        hash: user.hash,
        salt: user.salt,
      })
    }
  }

  return users
}

/** Serialize users to YAML */
function serializeUsersYaml(users: CmsUser[]): string {
  return users.map((u) => {
    const lines = [
      `- email: "${u.email}"`,
      `  name: "${u.name}"`,
      ...(u.displayName ? [`  displayName: "${u.displayName}"`] : []),
      `  role: "${u.role}"`,
      `  hash: "${u.hash}"`,
      `  salt: "${u.salt}"`,
    ]
    return lines.join('\n')
  }).join('\n')
}

/** Get the GitHub token for server-side operations */
function getServerToken(): string {
  const token = process.env.CMS_GITHUB_TOKEN
  if (!token) throw new Error('CMS_GITHUB_TOKEN is not set')
  return token
}

/** Load all users */
export async function getUsers(repo: string, branch: string): Promise<{ users: CmsUser[]; sha: string }> {
  const token = getServerToken()
  const file = await getFile(token, repo, USERS_PATH, branch)
  if (!file) return { users: [], sha: '' }
  return { users: parseUsersYaml(file.content), sha: file.sha }
}

/** Find a user by email */
export async function findUser(repo: string, branch: string, email: string): Promise<CmsUser | null> {
  const { users } = await getUsers(repo, branch)
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

/** Verify email + password, return user if valid */
export async function authenticateUser(repo: string, branch: string, email: string, password: string): Promise<CmsUser | null> {
  const user = await findUser(repo, branch, email)
  if (!user) return null
  const valid = await verifyPassword(password, user.salt, user.hash)
  return valid ? user : null
}

/** Create a new user */
export async function createUser(
  repo: string,
  branch: string,
  email: string,
  name: string,
  password: string,
  role: CmsRole,
  displayName?: string
): Promise<{ error?: string }> {
  const pwError = validatePassword(password)
  if (pwError) return { error: pwError }

  const { users, sha } = await getUsers(repo, branch)

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Cet email existe déjà' }
  }

  const salt = generateSalt()
  const hash = await hashPassword(password, salt)

  users.push({ email, name, ...(displayName ? { displayName } : {}), role, hash, salt })

  const token = getServerToken()
  const content = serializeUsersYaml(users)
  await putFile(token, repo, USERS_PATH, content, `users: add ${email}`, branch, sha || undefined)

  return {}
}

/** Delete a user */
export async function deleteUser(
  repo: string,
  branch: string,
  email: string
): Promise<void> {
  const { users, sha } = await getUsers(repo, branch)
  const filtered = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase())
  if (filtered.length === users.length) return // user not found

  const token = getServerToken()
  const content = serializeUsersYaml(filtered)
  await putFile(token, repo, USERS_PATH, content, `users: remove ${email}`, branch, sha)
}

/** Update a user's role */
export async function updateUserRole(
  repo: string,
  branch: string,
  email: string,
  role: CmsRole
): Promise<void> {
  const { users, sha } = await getUsers(repo, branch)
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return

  user.role = role

  const token = getServerToken()
  const content = serializeUsersYaml(users)
  await putFile(token, repo, USERS_PATH, content, `users: update role ${email}`, branch, sha)
}

/** Reset a user's password */
export async function resetUserPassword(
  repo: string,
  branch: string,
  email: string,
  newPassword: string
): Promise<{ error?: string }> {
  const pwError = validatePassword(newPassword)
  if (pwError) return { error: pwError }

  const { users, sha } = await getUsers(repo, branch)
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return { error: 'Utilisateur non trouvé' }

  user.salt = generateSalt()
  user.hash = await hashPassword(newPassword, user.salt)

  const token = getServerToken()
  const content = serializeUsersYaml(users)
  await putFile(token, repo, USERS_PATH, content, `users: reset password ${email}`, branch, sha)

  return {}
}
