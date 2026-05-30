import { NextResponse } from 'next/server'
import { getSession, getGitHubToken } from '@/packages/cms/lib/get-session'
import { listFiles, getFile, putFile, deleteFile } from '@/packages/cms/lib/github'
import { parseContent, serializeContent, parseYaml } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'

export const dynamic = 'force-dynamic'

type Params = Promise<{ path: string[] }>

async function requireAuth(): Promise<{ token: string; role: string } | NextResponse> {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = await getGitHubToken()
  if (!token) return NextResponse.json({ error: 'No GitHub token' }, { status: 401 })
  return { token, role: session.role }
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { path } = await params
  const [collection, ...rest] = path
  const slug = rest.join('/')

  const collDef = cmsConfig.collections[collection]
  if (!collDef) return NextResponse.json({ error: 'Unknown collection' }, { status: 404 })

  const { repo, branch } = cmsConfig

  if (!slug) {
    const files = await listFiles(auth.token, repo, collDef.path, branch)
    const entries = files
      .filter((f) => f.type === 'file' && (f.name.endsWith('.mdx') || f.name.endsWith('.yaml')))
      .map((f) => ({
        slug: f.name.replace(/\.(mdx|yaml)$/, ''),
        name: f.name,
        path: f.path,
        sha: f.sha,
      }))
    return NextResponse.json({ entries })
  }

  const ext = collDef.format === 'mdx' ? 'mdx' : 'yaml'
  const filePath = `${collDef.path}/${slug}.${ext}`
  const file = await getFile(auth.token, repo, filePath, branch)

  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (collDef.format === 'mdx') {
    const { data, body } = parseContent(file.content)
    return NextResponse.json({ slug, data, body, sha: file.sha })
  }

  const data = parseYaml(file.content)
  return NextResponse.json({ slug, data, sha: file.sha })
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { path } = await params
  const [collection, ...rest] = path
  const slug = rest.join('/')

  const collDef = cmsConfig.collections[collection]
  if (!collDef || !slug) return NextResponse.json({ error: 'Invalid path' }, { status: 400 })

  // Editors can't modify settings
  if (auth.role === 'editor' && collDef.singleton) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const { data, body, sha } = (await request.json()) as {
    data: Record<string, unknown>
    body?: string
    sha?: string
  }

  const ext = collDef.format === 'mdx' ? 'mdx' : 'yaml'
  const filePath = `${collDef.path}/${slug}.${ext}`
  const content = collDef.format === 'mdx'
    ? serializeContent(data, body ?? '')
    : serializeContent(data)

  const message = sha
    ? `content: update ${collection}/${slug}`
    : `content: create ${collection}/${slug}`

  const result = await putFile(auth.token, cmsConfig.repo, filePath, content, message, cmsConfig.branch, sha)

  return NextResponse.json({ sha: result.sha })
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  // Only admins can delete
  if (auth.role === 'editor') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const { path } = await params
  const [collection, ...rest] = path
  const slug = rest.join('/')

  const collDef = cmsConfig.collections[collection]
  if (!collDef || !slug) return NextResponse.json({ error: 'Invalid path' }, { status: 400 })

  const { sha } = (await request.json()) as { sha: string }
  const ext = collDef.format === 'mdx' ? 'mdx' : 'yaml'
  const filePath = `${collDef.path}/${slug}.${ext}`

  await deleteFile(auth.token, cmsConfig.repo, filePath, sha, `content: delete ${collection}/${slug}`, cmsConfig.branch)

  return NextResponse.json({ ok: true })
}
