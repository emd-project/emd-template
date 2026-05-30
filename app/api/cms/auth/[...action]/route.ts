import { NextResponse } from 'next/server'
import { loginRedirectUrl, handleCallback, logoutCookie } from '@/packages/cms/lib/auth'
import { authenticateUser } from '@/packages/cms/lib/users'
import { encryptSession, sessionCookie } from '@/packages/cms/lib/session'
import { checkRateLimit, resetRateLimit } from '@/packages/cms/lib/rate-limit'
import { cmsConfig } from '@/cms.config'
import type { CmsSession } from '@/packages/cms/types'

export const dynamic = 'force-dynamic'

type Params = Promise<{ action: string[] }>

export async function GET(request: Request, { params }: { params: Params }) {
  const { action } = await params
  const joined = action.join('/')
  const origin = new URL(request.url).origin

  if (joined === 'login') {
    return NextResponse.redirect(loginRedirectUrl(origin))
  }

  if (joined === 'callback') {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error_description') ?? searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      return NextResponse.redirect(`${origin}/admin?error=no_code`)
    }

    const result = await handleCallback(code)

    if ('error' in result) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(result.error)}`)
    }

    const response = NextResponse.redirect(`${origin}/admin`)
    response.headers.set('Set-Cookie', result.cookie)
    return response
  }

  if (joined === 'logout') {
    const response = NextResponse.redirect(`${origin}/admin`)
    response.headers.set('Set-Cookie', logoutCookie())
    return response
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/** POST /api/cms/auth/password — email/password login */
export async function POST(request: Request, { params }: { params: Params }) {
  const { action } = await params
  const joined = action.join('/')

  if (joined !== 'password') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${rateCheck.retryAfterSec}s.` },
      { status: 429 }
    )
  }

  const { email, password } = (await request.json()) as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  }

  const user = await authenticateUser(cmsConfig.repo, cmsConfig.branch, email, password)

  if (!user) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
  }

  // Success — reset rate limit and create session
  resetRateLimit(ip)

  const session: CmsSession = {
    user: user.name || user.email,
    ...(user.displayName ? { displayName: user.displayName } : {}),
    role: user.role,
    authMethod: 'password',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const encrypted = await encryptSession(session)
  const cookie = sessionCookie(encrypted, 30 * 24 * 60 * 60)

  return NextResponse.json({ ok: true }, {
    headers: { 'Set-Cookie': cookie },
  })
}
