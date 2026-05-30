import { notFound } from 'next/navigation'
import { getSession, getGitHubToken } from '@/packages/cms/lib/get-session'
import { getFile } from '@/packages/cms/lib/github'
import { parseContent, parseYaml } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'
import { ContentEditor } from '@/packages/cms/components/ContentEditor'

type Params = Promise<{ collection: string; slug: string }>

export default async function EntryEditorPage({ params }: { params: Params }) {
  const { collection, slug } = await params
  const collDef = cmsConfig.collections[collection]
  if (!collDef) notFound()

  const session = await getSession()
  if (!session) notFound()
  const token = await getGitHubToken()
  if (!token) notFound()

  const isNew = slug === 'new'
  let data: Record<string, unknown> = {}
  let body = ''
  let sha = ''

  if (!isNew) {
    const ext = collDef.format === 'mdx' ? 'mdx' : 'yaml'
    const filePath = `${collDef.path}/${slug}.${ext}`
    const file = await getFile(token, cmsConfig.repo, filePath, cmsConfig.branch)
    if (!file) notFound()

    if (collDef.format === 'mdx') {
      const parsed = parseContent(file.content)
      data = parsed.data
      body = parsed.body
    } else {
      data = parseYaml(file.content)
    }
    sha = file.sha
  }

  return (
    <ContentEditor
      collection={collection}
      slug={isNew ? '' : slug}
      fields={collDef.fields}
      format={collDef.format}
      initialData={data}
      initialBody={body}
      sha={sha}
      isNew={isNew}
    />
  )
}
