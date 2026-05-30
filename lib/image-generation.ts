/**
 * Image generation providers — Gemini (primary) + Flux (fallback).
 * Used by the CMS API route and the CLI batch script.
 */

export type GenerationProvider = 'gemini' | 'flux'

export type GenerationResult = {
  imageBuffer: Buffer
  contentType: string
}

// ─── Gemini (Google) ────────────────────────────────────────────────────

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta'

export async function generateWithGemini(prompt: string): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const res = await fetch(
    `${GEMINI_API}/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a high-quality image: ${prompt}. No text or watermarks in the image.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          responseMimeType: 'image/png',
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts

  if (!parts) throw new Error('Gemini returned no content')

  const imagePart = parts.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
  )

  if (!imagePart?.inlineData) {
    throw new Error('Gemini returned no image data')
  }

  return {
    imageBuffer: Buffer.from(imagePart.inlineData.data, 'base64'),
    contentType: imagePart.inlineData.mimeType,
  }
}

// ─── Flux (BFL) ─────────────────────────────────────────────────────────

const BFL_API = 'https://api.bfl.ai/v1'
const MAX_POLLS = 60

export async function generateWithFlux(prompt: string): Promise<GenerationResult> {
  const apiKey = process.env.BFL_API_KEY
  if (!apiKey) throw new Error('BFL_API_KEY not configured')

  const submitRes = await fetch(`${BFL_API}/flux-2-pro-preview`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'x-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `${prompt}. No text in the image.`,
      width: 1440,
      height: 810,
    }),
  })

  if (!submitRes.ok) {
    const err = await submitRes.text()
    throw new Error(`Flux API error: ${submitRes.status} ${err.slice(0, 200)}`)
  }

  const submitData = await submitRes.json()
  const { polling_url: pollingUrl, id: requestId } = submitData

  if (!pollingUrl || !requestId) {
    throw new Error('Flux API did not return a polling URL')
  }

  let imageUrl: string | null = null
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const pollRes = await fetch(`${pollingUrl}?id=${requestId}`, {
      headers: { 'accept': 'application/json', 'x-key': apiKey },
    })
    if (!pollRes.ok) continue

    const pollData = await pollRes.json()
    if (pollData.status === 'Ready') {
      imageUrl = pollData.result?.sample
      break
    }
    if (pollData.status === 'Error' || pollData.status === 'Failed') {
      throw new Error(`Flux generation failed: ${JSON.stringify(pollData)}`)
    }
  }

  if (!imageUrl) throw new Error('Flux generation timeout')

  const imageRes = await fetch(imageUrl)
  if (!imageRes.ok) throw new Error('Failed to download Flux image')

  const arrayBuffer = await imageRes.arrayBuffer()
  return {
    imageBuffer: Buffer.from(arrayBuffer),
    contentType: imageRes.headers.get('content-type') || 'image/jpeg',
  }
}

// ─── Unified generator ──────────────────────────────────────────────────

export async function generateImage(
  prompt: string,
  provider?: GenerationProvider
): Promise<GenerationResult> {
  const p = provider ?? detectProvider()

  if (p === 'gemini') return generateWithGemini(prompt)
  return generateWithFlux(prompt)
}

export function detectProvider(): GenerationProvider {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.BFL_API_KEY) return 'flux'
  throw new Error('No image generation API key configured (GEMINI_API_KEY or BFL_API_KEY)')
}
