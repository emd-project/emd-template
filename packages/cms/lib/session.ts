import type { CmsSession } from '../types'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function getSecret(): string {
  const secret = process.env.CMS_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('CMS_SECRET must be at least 32 characters')
  }
  return secret
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'HKDF',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'HKDF', salt: encoder.encode('cms-session'), hash: 'SHA-256', info: new Uint8Array(0) },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptSession(session: CmsSession): Promise<string> {
  const key = await deriveKey(getSecret())
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = encoder.encode(JSON.stringify(session))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

  const result = new Uint8Array(iv.length + encrypted.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...result))
}

export async function decryptSession(token: string): Promise<CmsSession | null> {
  try {
    const key = await deriveKey(getSecret())
    const raw = Uint8Array.from(atob(token), (c) => c.charCodeAt(0))
    const iv = raw.slice(0, 12)
    const data = raw.slice(12)

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    const session = JSON.parse(decoder.decode(decrypted)) as CmsSession

    if (session.expiresAt < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export function sessionCookie(value: string, maxAge: number): string {
  const parts = [
    `cms-session=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}
