'use client'

/**
 * ComparateurSelector — comparaison côte à côte, pilotée par la DA.
 * Sélecteurs dropdown pour choisir les modèles. Styles : .cmp-* (volteo-comparateur.css),
 * 100% token-driven → adopte la DA de chaque site.
 * 'use client' isolé — la page /comparer reste Server Component.
 * Modèle EMD = MENTION, pas d'affiliation : pas de bouton d'achat affilié.
 */

import { useState, type CSSProperties } from 'react'
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
  const colStyle = { ['--cols']: selected.length } as CSSProperties

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
                aria-label={`Modèle ${slotIndex + 1}`}
              >
                {modeles.map((m, mi) => (
                  <option key={mi} value={mi}>{m.nom}</option>
                ))}
              </select>
              <span className="arrow" aria-hidden="true">▾</span>
            </div>
            {selected.length > 2 && (
              <button className="cmp-remove" onClick={() => removeSlot(slotIndex)}>Retirer</button>
            )}
          </div>
        ))}
      </div>

      {selected.length < maxSlots && (
        <button className="cmp-add" onClick={addSlot}>+ Ajouter un modèle</button>
      )}

      {/* Tableau comparatif */}
      <div className="cmp-scroll">
        <div className="cmp-table" style={colStyle}>
          <div className="cmp-row cmp-head">
            {selectedModeles.map((m, i) => (
              <div className="cmp-col-head" key={i}>
                <div className="cmp-new-slot">{m.nouveaute && <span className="cmp-new">Nouveau</span>}</div>
                <h2 className="cmp-name">{m.nom}</h2>
                <div className="cmp-price">{m.prix.toLocaleString('fr-FR')} €</div>
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
