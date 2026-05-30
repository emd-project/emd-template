import { NextResponse } from 'next/server'
import { getSession } from '@/packages/cms/lib/get-session'
import { getUsers, createUser, deleteUser, updateUserRole, resetUserPassword } from '@/packages/cms/lib/users'
import { cmsConfig } from '@/cms.config'
import type { CmsRole } from '@/packages/cms/types'

export const dynamic = 'force-dynamic'

/** GET /api/cms/users — list users (admin only) */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { users } = await getUsers(cmsConfig.repo, cmsConfig.branch)
  // Return without hash/salt
  const safe = users.map(({ email, name, displayName, role }) => ({ email, name, displayName, role }))
  return NextResponse.json({ users: safe })
}

/** POST /api/cms/users — create / delete / update user */
export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const body = await request.json()
  const { action } = body as { action: string }

  if (action === 'create') {
    const { email, name, password, role, displayName } = body as {
      email: string; name: string; password: string; role: CmsRole; displayName?: string
    }
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }
    const result = await createUser(cmsConfig.repo, cmsConfig.branch, email, name, password, role || 'editor', displayName || undefined)
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    const { email } = body as { email: string }
    await deleteUser(cmsConfig.repo, cmsConfig.branch, email)
    return NextResponse.json({ ok: true })
  }

  if (action === 'updateRole') {
    const { email, role } = body as { email: string; role: CmsRole }
    await updateUserRole(cmsConfig.repo, cmsConfig.branch, email, role)
    return NextResponse.json({ ok: true })
  }

  if (action === 'resetPassword') {
    const { email, password } = body as { email: string; password: string }
    const result = await resetUserPassword(cmsConfig.repo, cmsConfig.branch, email, password)
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
