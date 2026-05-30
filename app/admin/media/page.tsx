import { getSession } from '@/packages/cms/lib/get-session'
import { notFound } from 'next/navigation'
import { list } from '@vercel/blob'
import { MediaBrowser } from '@/packages/cms/components/MediaBrowser'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const session = await getSession()
  if (!session) notFound()

  let items: { name: string; path: string; type: 'file'; size: number; sha: string; url: string }[] = []

  try {
    const { blobs } = await list({ prefix: 'images/', limit: 500 })
    items = blobs.map((blob) => ({
      name: blob.pathname.split('/').pop() ?? blob.pathname,
      path: blob.pathname,
      type: 'file' as const,
      size: blob.size,
      sha: blob.url,
      url: blob.url,
    }))
  } catch (e) {
    console.error('Blob list error:', e)
    // Return empty — store might not be connected yet
  }

  return <MediaBrowser initialItems={items} />
}
