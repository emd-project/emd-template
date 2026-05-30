import { notFound } from 'next/navigation'
import { getSession, getGitHubToken } from '@/packages/cms/lib/get-session'
import { listFiles, getFile } from '@/packages/cms/lib/github'
import { parseContent, parseYaml } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'
import { CollectionList } from '@/packages/cms/components/CollectionList'

type Params = Promise<{ collection: string }>

export type EntryMeta = {
  slug: string
  title: string
  publishedAt: string
  categorie: string
  draft: boolean
}

export default async function CollectionListPage({ params }: { params: Params }) {
  const { collection } = await params
  const collDef = cmsConfig.collections[collection]
  if (!collDef) notFound()

  const session = await getSession()
  if (!session) notFound()
  const token = await getGitHubToken()
  if (!token) notFound()

  const files = await listFiles(token, cmsConfig.repo, collDef.path, cmsConfig.branch)
  const contentFiles = files.filter((f) => f.type === 'file' && (f.name.endsWith('.mdx') || f.name.endsWith('.yaml')))

  // Fetch metadata for each entry (parallel, max 30 concurrent)
  const entries: EntryMeta[] = await Promise.all(
    contentFiles.map(async (f) => {
      const slug = f.name.replace(/\.(mdx|yaml)$/, '')
      try {
        const file = await getFile(token, cmsConfig.repo, f.path, cmsConfig.branch)
        if (!file) return { slug, title: slug, publishedAt: '', categorie: '', draft: false }

        const data = collDef.format === 'mdx'
          ? parseContent(file.content).data
          : parseYaml(file.content)

        return {
          slug,
          title: (data.title as string) || slug,
          publishedAt: (data.publishedAt as string) || '',
          categorie: (data.categorie as string) || '',
          draft: !!data.draft,
        }
      } catch {
        return { slug, title: slug, publishedAt: '', categorie: '', draft: false }
      }
    })
  )

  return (
    <CollectionList
      collection={collection}
      label={collDef.label}
      entries={entries}
    />
  )
}
