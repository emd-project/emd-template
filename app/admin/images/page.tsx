/**
 * /admin/images — gestion des images structurelles du site.
 * Liste tous les slots du registre, montre leur statut et le prompt IA.
 */

import fs from 'fs'
import path from 'path'
import { getAllImageSlots, getImageSlotsBySection, type ImageSlot } from '@/lib/image-slots'
import { CopyPromptButton } from './CopyPromptButton'

function imageExists(relativePath: string): boolean {
  try {
    const absolute = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''))
    return fs.existsSync(absolute)
  } catch {
    return false
  }
}

const SECTION_LABELS: Record<string, string> = {
  home: 'Home',
  tools: 'Pages outils',
  author: 'Auteur',
  brand: 'Branding',
}

export default function ImagesAdminPage() {
  const slotsBySection = getImageSlotsBySection()
  const allSlots = getAllImageSlots()
  const total = allSlots.length
  const present = allSlots.filter((s) => imageExists(s.path)).length
  const missing = total - present

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#F0F0F5' }}>
          Images du site
        </h1>
        <p style={{ fontSize: 14, color: '#9090A8', margin: 0 }}>
          {present}/{total} images présentes · {missing} manquantes
        </p>
      </div>

      <div
        style={{
          padding: 16,
          background: 'rgba(123,97,255,0.06)',
          border: '1px solid rgba(123,97,255,0.20)',
          borderRadius: 10,
          marginBottom: 32,
          fontSize: 13,
          color: '#9090A8',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: '#F0F0F5' }}>Comment ajouter une image :</strong>
        <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li>Copie le prompt IA → utilise-le dans Midjourney, DALL-E, Flux ou Gemini</li>
          <li>Télécharge l&apos;image générée</li>
          <li>Renomme-la avec exactement le chemin indiqué (ex : <code>hero-background.webp</code>)</li>
          <li>Place-la dans le dossier <code>public/images/...</code> indiqué</li>
          <li>Recharge la page — l&apos;image apparaît automatiquement sur le site</li>
        </ol>
      </div>

      {Object.entries(slotsBySection).map(([section, slots]) => (
        <section key={section} style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#55556A',
              marginBottom: 12,
            }}
          >
            {SECTION_LABELS[section] ?? section}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {slots.map((slot) => (
              <SlotRow key={slot.id} slot={slot} exists={imageExists(slot.path)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function SlotRow({ slot, exists }: { slot: ImageSlot; exists: boolean }) {
  return (
    <div
      style={{
        background: '#13131A',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: 16,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 16,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#F0F0F5',
              fontFamily: 'monospace',
            }}
          >
            {slot.id}
          </span>
          {exists ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(61,255,192,0.1)',
                color: '#3DFFC0',
              }}
            >
              ✓ Présente
            </span>
          ) : (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(255,210,63,0.1)',
                color: '#FFD23F',
              }}
            >
              ⚠ Manquante
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#55556A', marginBottom: 8, fontFamily: 'monospace' }}>
          {slot.width}×{slot.height} · <code>{slot.path}</code>
        </div>
        <p style={{ fontSize: 13, color: '#9090A8', margin: '0 0 12px', lineHeight: 1.5 }}>
          {slot.description}
        </p>
        <details style={{ fontSize: 12 }}>
          <summary
            style={{
              cursor: 'pointer',
              color: '#7B61FF',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Prompt IA
          </summary>
          <div
            style={{
              padding: 12,
              background: '#0A0A0F',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 6,
              color: '#9090A8',
              lineHeight: 1.6,
              fontFamily: 'monospace',
              fontSize: 11,
            }}
          >
            {slot.prompt}
          </div>
        </details>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <CopyPromptButton prompt={slot.prompt} />
        {exists && (
          <a
            href={slot.path}
            target="_blank"
            rel="noopener"
            style={{
              fontSize: 11,
              color: '#55556A',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            Voir →
          </a>
        )}
      </div>
    </div>
  )
}
