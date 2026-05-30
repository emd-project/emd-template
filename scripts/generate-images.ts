/**
 * Batch image generation from image-slots registry.
 *
 * Usage:
 *   npx tsx scripts/generate-images.ts                    # all slots
 *   npx tsx scripts/generate-images.ts --section home     # only home slots
 *   npx tsx scripts/generate-images.ts --slot home-hero-background  # single slot
 *   npx tsx scripts/generate-images.ts --provider gemini  # force provider
 *   npx tsx scripts/generate-images.ts --dry-run          # show prompts only
 *   npx tsx scripts/generate-images.ts --local            # force local output (public/)
 *   npx tsx scripts/generate-images.ts --prompt-override "custom prompt"  # override slot prompt
 *
 * Env vars required:
 *   GEMINI_API_KEY or BFL_API_KEY  — image generation
 *   BLOB_READ_WRITE_TOKEN          — Vercel Blob storage (optional, falls back to local)
 */

import { getAllImageSlots, type ImageSlot } from '../lib/image-slots'
import { generateImage, detectProvider, type GenerationProvider } from '../lib/image-generation'
import { put } from '@vercel/blob'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

const args = process.argv.slice(2)
const flags = parseFlags(args)

function parseFlags(argv: string[]): Record<string, string> {
  const f: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      f[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
    }
  }
  return f
}

async function main() {
  const dryRun = flags['dry-run'] === 'true'
  const sectionFilter = flags['section']
  const slotFilter = flags['slot']
  const providerFlag = flags['provider'] as GenerationProvider | undefined
  const promptOverride = flags['prompt-override']
  const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN
  const localOut = flags['local'] === 'true' || !useBlob

  let slots = getAllImageSlots()

  if (sectionFilter) {
    slots = slots.filter((s) => s.section === sectionFilter)
  }
  if (slotFilter) {
    slots = slots.filter((s) => s.id === slotFilter)
  }

  if (slots.length === 0) {
    console.log('No slots matched the filter.')
    process.exit(0)
  }

  let provider: GenerationProvider
  try {
    provider = providerFlag ?? detectProvider()
  } catch {
    if (dryRun) {
      provider = 'gemini'
    } else {
      console.error('No API key found. Set GEMINI_API_KEY or BFL_API_KEY.')
      process.exit(1)
    }
  }

  console.log(`\n📸 Image generation — ${slots.length} slot(s)`)
  console.log(`   Provider: ${provider}`)
  console.log(`   Storage: ${useBlob && !localOut ? 'Vercel Blob' : 'local (public/)'}`)
  if (dryRun) console.log('   Mode: DRY RUN (no generation)')
  console.log('')

  let success = 0
  let failed = 0

  for (const slot of slots) {
    const prompt = promptOverride ?? slot.prompt
    console.log(`[${slot.id}] ${slot.width}x${slot.height}`)
    console.log(`  Prompt: ${prompt.slice(0, 120)}...`)

    if (dryRun) {
      console.log('  → skipped (dry run)\n')
      continue
    }

    try {
      const result = await generateImage(prompt, provider)

      const ext = result.contentType.includes('png') ? 'png' : result.contentType.includes('webp') ? 'webp' : 'jpg'

      if (useBlob && !localOut) {
        const blobPath = slot.path.replace(/^\//, '').replace(/\.\w+$/, `.${ext}`)
        const blob = await put(blobPath, result.imageBuffer, {
          access: 'public',
          contentType: result.contentType,
          addRandomSuffix: false,
        })
        console.log(`  → Blob: ${blob.url}\n`)
      } else {
        const localPath = join(process.cwd(), 'public', slot.path.replace(/\.\w+$/, `.${ext}`))
        const dir = dirname(localPath)
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
        writeFileSync(localPath, result.imageBuffer)
        console.log(`  → Local: ${localPath}\n`)
      }

      success++

      // Rate limiting between calls
      await new Promise((r) => setTimeout(r, 2000))
    } catch (e) {
      console.error(`  ✗ Failed: ${e instanceof Error ? e.message : e}\n`)
      failed++
    }
  }

  console.log(`\nDone: ${success} generated, ${failed} failed, ${slots.length - success - failed} skipped.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
