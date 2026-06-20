'use client'

/**
 * ComparateurSelector — comparaison côte à côte, pilotée par la DA.
 * Sélecteurs dropdown pour choisir les modèles à comparer + tableau de specs.
 * 'use client' isolé — la page /comparer reste Server Component.
 *
 * 100% token-driven (var(--accent-1), --border, --bg-surface, --radius, color-mix)
 * → adopte automatiquement la DA de chaque site. Aucune couleur en dur.
 *
 * Modèle EMD = MENTION, pas d'affiliation : pas de bouton d'achat affilié.
 * Le seul lien éventuel est NEUTRE (source officielle/marque) via `sourceUrl`.
 */

import { Fragment, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ModeleComparateur } from '@/lib/comparateur'

type Props = {
  modeles: ModeleComparateur[]
  specsLabels: Record<string, string>
}

export function ComparateurSelector({ modeles, specsLabels }: Props) {
  const maxSlots = Math.min(3, modeles.length)
  const initial = Math.min(2, maxSlots) || 1
  const [selected, setSelected] = useState<number[]>(
    modeles.slice(0, initial).map((_, i) => i)
  )

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
  const cols = selected.length
  const minPrice = Math.min(...selectedModeles.map((m) => m.prix))
  const gridCols = `minmax(116px, 0.85fr) repeat(${cols}, minmax(128px, 1fr))`
  const minWidth = 116 + cols * 140

  const labelCellBase: CSSProperties = {
    padding: 'var(--space-4) var(--space-4)',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--next-font-display), system-ui, sans-serif',
  }
  const valueCellBase: CSSProperties = {
    padding: 'var(--space-4) var(--space-4)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  const zebra = (i: number) =>
    i % 2 === 1 ? 'color-mix(in srgb, var(--text-primary) 4%, transparent)' : 'transparent'
  const cheapTint = 'color-mix(in srgb, var(--accent-1) 8%, transparent)'

  return (
    <div>
      {/* ── Sélecteurs de modèles ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
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
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-8) var(--space-3) var(--space-4)',
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
                  fontSize: '11px',
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

      {selected.length < maxSlots && (
        <button
          onClick={addSlot}
          style={{
            display: 'block',
            margin: '0 0 var(--space-6)',
            background: 'none',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-5)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          + Ajouter un modèle
        </button>
      )}

      {/* ── Tableau comparatif (scroll horizontal sur mobile) ── */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, minWidth: `${minWidth}px` }}>
            {/* En-tête : coin + modèles */}
            <div
              style={{
                background: 'var(--bg-surface-2)',
                borderBottom: '1px solid var(--border)',
              }}
            />
            {selectedModeles.map((m, i) => {
              const cheapest = m.prix === minPrice
              return (
                <div
                  key={i}
                  style={{
                    background: cheapest ? cheapTint : 'var(--bg-surface-2)',
                    borderBottom: '1px solid var(--border)',
                    borderTop: cheapest ? '2px solid var(--accent-1)' : '2px solid transparent',
                    borderLeft: '1px solid var(--border)',
                    padding: 'var(--space-4) var(--space-3)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: m.nouveaute ? 'var(--accent-3)' : 'transparent',
                      minHeight: '14px',
                    }}
                  >
                    Nouveau
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                      fontSize: 'clamp(15px, 2vw, 19px)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {m.nom}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--next-font-mono), monospace',
                      fontSize: 'clamp(15px, 2vw, 19px)',
                      fontWeight: 700,
                      color: cheapest ? 'var(--accent-1)' : 'var(--text-secondary)',
                      fontVariantNumeric: 'tabular-nums',
                      marginTop: '2px',
                    }}
                  >
                    {m.prix.toLocaleString('fr-FR')} €
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--bg-primary)',
                      background: cheapest && cols > 1 ? 'var(--accent-1)' : 'transparent',
                      borderRadius: 'var(--radius-full)',
                      padding: cheapest && cols > 1 ? '2px 9px' : 0,
                      marginTop: '4px',
                      minHeight: '15px',
                    }}
                  >
                    {cheapest && cols > 1 ? 'Meilleur prix' : ' '}
                  </span>
                </div>
              )
            })}

            {/* Lignes de specs */}
            {specKeys.map((key, rowIdx) => (
              <Fragment key={key}>
                <div style={{ ...labelCellBase, background: zebra(rowIdx) }}>
                  {specsLabels[key]}
                </div>
                {selectedModeles.map((m, i) => {
                  const cheapest = m.prix === minPrice
                  return (
                    <div
                      key={i}
                      style={{
                        ...valueCellBase,
                        background: cheapest ? cheapTint : zebra(rowIdx),
                        borderLeft: '1px solid var(--border)',
                      }}
                    >
                      {m.specs[key] ?? '—'}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Liens NEUTRES (source officielle), si renseignés ── */}
      {selectedModeles.some((m) => m.sourceUrl) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 'var(--space-3)',
            marginTop: 'var(--space-5)',
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-2)',
                    background: 'var(--accent-1)',
                    color: 'var(--bg-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: 'var(--space-3) var(--space-5)',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    width: '100%',
                    maxWidth: '240px',
                  }}
                >
                  Voir la fiche officielle →
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
