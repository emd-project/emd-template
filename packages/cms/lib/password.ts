/**
 * PBKDF2 password hashing — zero dependencies, Web Crypto API only.
 * 100,000 iterations = ~100ms per hash = brute force resistant.
 */

const ITERATIONS = 100_000
const KEY_LENGTH = 32 // 256 bits
const encoder = new TextEncoder()

/** Generate a random salt */
export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Hash a password with PBKDF2 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  )

  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Verify a password against a hash (timing-safe comparison) */
export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const hash = await hashPassword(password, salt)

  // Timing-safe comparison
  if (hash.length !== expectedHash.length) return false
  let diff = 0
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  }
  return diff === 0
}

/** Validate password strength */
export function validatePassword(password: string): string | null {
  if (password.length < 12) return 'Le mot de passe doit faire au moins 12 caractères'
  return null
}
