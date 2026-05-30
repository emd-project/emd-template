'use client'

/**
 * AnnouncementBar — bandeau sticky haut, fond --accent-2 (jaune).
 * Slide depuis le haut à l'apparition. Dismissible.
 * 'use client' uniquement pour la logique dismiss.
 */

import { useState } from 'react'
import { X } from 'lucide-react'

type AnnouncementBarProps = {
  message: string
  href?: string
  cta?: string
  dismissible?: boolean
}

export function AnnouncementBar({
  message,
  href,
  cta,
  dismissible = true,
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      role="banner"
      style={{
        backgroundColor: 'var(--accent-2)',
        color: 'var(--bg-primary)',
        padding: 'var(--space-2) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        fontSize: '13px',
        fontWeight: 500,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        animation: 'slide-down 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <span>{message}</span>

      {href && cta && (
        <a
          href={href}
          style={{
            fontWeight: 700,
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            color: 'inherit',
            marginLeft: 'var(--space-2)',
          }}
        >
          {cta} →
        </a>
      )}

      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer le bandeau"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-sm)',
            opacity: 0.7,
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
