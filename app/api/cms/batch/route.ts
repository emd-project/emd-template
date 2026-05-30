import { NextResponse } from 'next/server'
import { getSession } from '@/packages/cms/lib/get-session'
import { batchPutFiles, type BatchFileChange } from '@/packages/cms/lib/github'
import { serializeContent } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'

export const dynamic = 'force-dynamic'

interface PendingChange {
  collection: string
  filePath: string
  frontmatter: Record<string, unknown>
  body: string
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { changes } = (await request.json()) as { changes: PendingChange[] }
  if (!Array.isArray(changes) || changes.length === 0) {
    return NextResponse.json({ error: 'Aucune modification à publier' }, { status: 400 })
  }

  const token = process.env.CMS_GITHUB_TOKEN
  if (!token) return NextResponse.json({ error: 'CMS_GITHUB_TOKEN not configured' }, { status: 500 })

  const files: BatchFileChange[] = []

  for (const change of changes) {
    const collectionDef = cmsConfig.collections[change.collection]
    if (!collectionDef) continue

    const content = collectionDef.format === 'mdx'
      ? serializeContent(change.frontmatter, change.body)
      : serializeContent(change.frontmatter)

    files.push({ path: change.filePath, content })
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'Aucun fichier valide' }, { status: 400 })
  }

  try {
    const slugs = files.map((f) => f.path.split('/').pop()?.replace(/\.\w+$/, '')).join(', ')
    const message = files.length === 1
      ? `cms: update ${slugs}`
      : `cms: batch update ${files.length} files (${slugs})`

    const result = await batchPutFiles(token, cmsConfig.repo, cmsConfig.branch, files, message)

    return NextResponse.json({ ok: true, commitSha: result.commitSha, filesCount: files.length })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Batch publish failed' },
      { status: 500 }
    )
  }
}
