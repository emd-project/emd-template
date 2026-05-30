/**
 * Upload an image to Vercel Blob from the command line.
 * Usage: npx tsx scripts/upload-blob.ts path/to/image.jpg
 *
 * Requires BLOB_READ_WRITE_TOKEN env var.
 * Returns the public URL.
 */

import { put } from '@vercel/blob'
import { readFileSync } from 'fs'
import { basename } from 'path'

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx tsx scripts/upload-blob.ts <image-path>')
    process.exit(1)
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Error: BLOB_READ_WRITE_TOKEN env var is required')
    process.exit(1)
  }

  const fileName = basename(filePath)
  const fileBuffer = readFileSync(filePath)

  const blob = await put(`images/${fileName}`, fileBuffer, {
    access: 'public',
    addRandomSuffix: false,
  })

  console.log(blob.url)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
