import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { generateImage, detectProvider, type GenerationProvider } from '@/lib/image-generation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.CMS_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    prompt: string
    path?: string
    provider?: GenerationProvider
  }

  if (!body.prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  try {
    const provider = body.provider ?? detectProvider()
    const result = await generateImage(body.prompt, provider)

    const ext = result.contentType.includes('png')
      ? 'png'
      : result.contentType.includes('webp')
        ? 'webp'
        : 'jpg'
    const blobPath = body.path
      ? body.path.replace(/^\//, '').replace(/\.\w+$/, `.${ext}`)
      : `images/generated-${Date.now()}.${ext}`

    const blob = await put(blobPath, result.imageBuffer, {
      access: 'public',
      contentType: result.contentType,
      addRandomSuffix: false,
    })

    return NextResponse.json({ url: blob.url, path: blobPath, provider })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
