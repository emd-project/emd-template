/**
 * ImagePlaceholder — affiche une image optimisée si elle existe,
 * ou un placeholder visuel pour signaler quelle image mettre.
 *
 * Usage : <ImagePlaceholder slotId="home-hero-background" />
 *
 * Comportement :
 * - Si l'image existe : rendue via next/image avec les bonnes dimensions.
 * - Image absente, en dev : bloc détaillé (ID, dimensions, prompt IA) pour savoir quoi générer.
 * - Image absente, en prod : placeholder épuré (ID + dimensions). C'est un FILET DE SÉCURITÉ —
 *   en V2, un site en prod ne doit afficher AUCUN placeholder (toutes les images sont générées).
 *
 * Server Component — pas de JS client.
 */

import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import { getImageSlot } from '@/lib/image-slots'

type Props = {
  slotId: string
  /** Si true, l'image est marquée priority (LCP). À utiliser above-fold. */
  priority?: boolean
  /** Override du style Image. */
  className?: string
  /** Override du style wrapper. */
  style?: React.CSSProperties
  /** Object-fit override. */
  fit?: 'cover' | 'contain'
}

function imageExists(relativePath: string): boolean {
  try {
    const absolute = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''))
    return fs.existsSync(absolute)
  } catch {
    return false
  }
}

export function ImagePlaceholder({ slotId, priority = false, className, style, fit = 'cover' }: Props) {
  const slot = getImageSlot(slotId)

  if (!slot) {
    // Slot inconnu — ne rien afficher, warn uniquement en dev
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          style={{
            padding: '16px',
            background: 'rgba(255,61,87,0.1)',
            border: '1px dashed var(--accent-1)',
            borderRadius: '8px',
            color: 'var(--accent-1)',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        >
          ⚠ ImagePlaceholder : slot inconnu &quot;{slotId}&quot;
        </div>
      )
    }
    return null
  }

  const exists = imageExists(slot.path)
  const isDev = process.env.NODE_ENV === 'development'

  // Image présente → render normal
  if (exists) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${slot.width} / ${slot.height}`,
          ...style,
        }}
      >
        <Image
          src={slot.path}
          alt={slot.alt}
          fill
          priority={priority}
          sizes="100vw"
          className={className}
          style={{ objectFit: fit }}
        />
      </div>
    )
  }

  // Image absente + prod → placeholder épuré (filet de sécurité, pas la cible)
  if (!isDev) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${slot.width} / ${slot.height}`,
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          textAlign: 'center',
          ...style,
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
          {slot.id}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.6 }}>
          {slot.width}×{slot.height} · {slot.path}
        </div>
      </div>
    )
  }

  // Image absente + dev → placeholder visuel
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${slot.width} / ${slot.height}`,
        background: 'linear-gradient(135deg, rgba(255,61,87,0.04), rgba(123,97,255,0.04))',
        border: '2px dashed color-mix(in srgb, var(--accent-1) 40%, transparent)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--next-font-mono, monospace)',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--accent-1)',
          marginBottom: 'var(--space-2)',
        }}
      >
        📷 Image manquante
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-1)',
        }}
      >
        {slot.id}
      </div>
      <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: 'var(--space-3)' }}>
        {slot.width}×{slot.height} · {slot.path}
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          lineHeight: 1.5,
          marginBottom: 'var(--space-3)',
        }}
      >
        {slot.description}
      </div>
      <details style={{ fontSize: '11px', opacity: 0.7, maxWidth: '700px' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--accent-4)' }}>Voir le prompt IA</summary>
        <div
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            fontSize: '10px',
          }}
        >
          {slot.prompt}
        </div>
      </details>
    </div>
  )
}
