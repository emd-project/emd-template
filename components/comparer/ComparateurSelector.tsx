'use client'

/**
 * ComparateurSelector — comparaison côte à côte style Apple.
 * Sélecteurs dropdown pour choisir les modèles à comparer.
 * 'use client' isolé — la page /comparer reste Server Component.
 *
 * Modèle EMD = MENTION, pas d'affiliation : pas de bouton d'achat affilié.
 * Le seul lien éventuel est NEUTRE (source officielle/marque) via `sourceUrl`,
 * rendu uniquement s'il est renseigné.
 */

import { useState } from 'react'
import type { ModeleComparateur } from '@/lib/comparateur'

type Props = {
  modeles: ModeleComparateur[]
  specsLabels: Record<string, string>
}

export function ComparateurSelector({ modeles, specsLabels }: Props) {
  const maxSlots = Math.min(3, modeles.length)
  const defaults = modeles.slice(0, maxSlots).map((_, i) => i)
  const [selected, setSelected] = useState<number[]>(defaults)

  function updateSlot(slotIndex: number, modeleIndex: number) {
    setSelected((prev) => {
      const next = [...prev]
      next[slotIndex] = modeleIndex
      return next
    })
  }

  function addSlot() {
    if (selected.length >= maxSlots) return
    const used = new Set(selected)
    const next = modeles.findIndex((_, i) => !used.has(i))
    setSelected((prev) => [...prev, next >= 0 ? next : 0])
  }

  function removeSlot(slotIndex: number) {
    if (selected.length <= 2) return
    setSelected((prev) => prev.filter((_, i) => i !== slotIndex))
  }

  const specKeys = Object.keys(specsLabels)
  const selectedModeles = selected.map((i) => modeles[i])

  return (
    <div>
      {/* Selectors row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${selected.length}, 1fr)`,
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {selected.map((modeleIndex, slotIndex) => (
          <div key={slotIndex}>
            <div style={{ position: 'relative' }}>
              <select
                value={modeleIndex}
                onChange={(e) => updateSlot(slotIndex, Number(e.target.value))}
                aria-label={`Modèle ${slotIndex + 1}`}
                style={{
                  width: '100%',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-10) var(--space-3) var(--space-4)',
                  fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {modeles.map((m, mi) => (
                  <option key={mi} value={mi}>
                    {m.nom}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              >
                ▾
              </span>
            </div>
            {selected.length > 2 && (
              <button
                onClick={() => removeSlot(slotIndex)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: 'var(--space-1)',
                  padding: 0,
                }}
              >
                Retirer
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add slot button */}
      {selected.length < maxSlots && (
        <button
          onClick={addSlot}
          style={{
            display: 'block',
            margin: '0 auto var(--space-8)',
            background: 'none',
            border: '1px dashed var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-5)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          + Ajouter un modèle
        </button>
      )}

      {/* Model headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${selected.length}, 1fr)`,
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {selectedModeles.map((m, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: m.nouveaute ? 'var(--accent-3)' : 'transparent',
                marginBottom: 'var(--space-2)',
                minHeight: '15px',
              }}
            >
              Nouveau
            </span>
            <h2
              style={{
                fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginBottom: 'var(--space-2)',
              }}
            >
              {m.nom}
            </h2>
            <div
              style={{
                fontFamily: 'var(--next-font-mono), monospace',
                fontSize: 'clamp(14px, 2vw, 18px)',
                color: 'var(--accent-1)',
                fontWeight: 600,
              }}
            >
              {m.prix.toLocaleString('fr-FR')} €
            </div>
          </div>
        ))}
      </div>

      {/* Specs comparison rows */}
      <div
        style={{
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        {specKeys.map((key) => (
          <div
            key={key}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${selected.length}, 1fr)`,
              gap: 'var(--space-4)',
              borderBottom: '1px solid var(--glass-border)',
              padding: 'var(--space-4) 0',
            }}
          >
            {selectedModeles.map((m, i) => {
              const value = m.specs[key] ?? '—'
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    {specsLabels[key]}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {value}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* CTA row — lien NEUTRE vers la source officielle, uniquement si renseigné (pas d'affiliation) */}
      {selectedModeles.some((m) => m.sourceUrl) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${selected.length}, 1fr)`,
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
          }}
        >
          {selectedModeles.map((m, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              {m.sourceUrl ? (
                <a
                  href={m.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  style={{
                    display: 'inline-block',
                    background: 'var(--accent-1)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: 'var(--space-3) var(--space-5)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    width: '100%',
                    maxWidth: '220px',
                    textAlign: 'center',
                  }}
                >
                  Voir la fiche officielle
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
