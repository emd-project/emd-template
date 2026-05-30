/**
 * In-memory rate limiter for login attempts.
 * Max 5 attempts per IP per 15 minutes.
 * Resets on serverless cold start (acceptable for this use case).
 */

const attempts = new Map<string, { count: number; resetAt: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now()
  const record = attempts.get(ip)

  // Clean expired entries
  if (record && record.resetAt < now) {
    attempts.delete(ip)
    return { allowed: true }
  }

  if (!record) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000)
    return { allowed: false, retryAfterSec }
  }

  record.count++
  return { allowed: true }
}

/** Reset rate limit for an IP (on successful login) */
export function resetRateLimit(ip: string): void {
  attempts.delete(ip)
}
