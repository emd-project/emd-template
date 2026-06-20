'use client'

/**
 * ComparateurSelector — comparaison côte à côte, pilotée par la DA.
 * Styles : .cmp-* (volteo-comparateur.css), 100% token-driven.
 * 'use client' isolé. Locale-aware (prop `locale`, défaut fr).
 * Modèle EMD = MENTION, pas d'affiliation.
 */

import { useState, type CSSProperties } from 'react'
import type { ModeleComparateur } from '@/lib/comparateur'
import { tl } from '@/lib/i18n'

type Props = {
  modeles: ModeleComparateur[]
  specsLabels: Record<string, string>
  /** Locale active (défaut fr). */
  locale?: string
}

export function ComparateurSelector({ modeles, specsLabels, locale = 'fr' }: Props) {
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
  const colStyle = { ['--cols']: selected.length } as CSSProperties
  const numLocale = locale === 'en' ? 'en-GB' : 'fr-FR'

  return (
    <div className="cmp">
      {/* Sélecteurs */}
      <div className="cmp-selectors" style={colStyle}>
        {selected.map((modeleIndex, slotIndex) => (
          <div className="cmp-slot" key={slotIndex}>
            <div className="cmp-select">
              <select
                value={modeleIndex}
                onChange={(e) => updateSlot(slotIndex, Number(e.target.value))}
                aria-label={tl(locale, 'comparator.modelAria', { n: slotIndex + 1 })}
              >
                {modeles.map((m, mi) => (
                  <option key={mi} value={mi}>{m.nom}</option>
                ))}
              </select>
              <span className="arrow" aria-hidden="true">▾</span>
            </div>
            {selected.length > 2 && (
              <button className="cmp-remove" onClick={() => removeSlot(slotIndex)}>{tl(locale, 'comparator.remove')}</button>
            )}
          </div>
        ))}
      </div>

      {selected.length < maxSlots && (
        <button className="cmp-add" onClick={addSlot}>{tl(locale, 'comparator.add')}</button>
      )}

      {/* Tableau comparatif */}
      <div className="cmp-scroll">
        <div className="cmp-table" style={colStyle}>
          <div className="cmp-row cmp-head">
            {selectedModeles.map((m, i) => (
              <div className="cmp-col-head" key={i}>
                <div className="cmp-new-slot">{m.nouveaute && <span className="cmp-new">{tl(locale, 'comparator.new')}</span>}</div>
                <h2 className="cmp-name">{m.nom}</h2>
                <div className="cmp-price">{m.prix.toLocaleString(numLocale)} €</div>
              </div>
            ))}
          </div>
          {specKeys.map((key) => (
            <div className="cmp-row" key={key}>
              {selectedModeles.map((m, i) => (
                <div className="cmp-cell" key={i}>
                  <div className="cmp-cell-label">{specsLabels[key]}</div>
                  <div className="cmp-cell-value">{m.specs[key] ?? '—'}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
