/**
 * CompareBar — barre de comparaison visuelle entre deux produits.
 * Notes /10, animation CSS progressive, gagnant mis en valeur.
 * Server Component — compatible avec compileMDX de next-mdx-remote/rsc.
 *
 * Usage MDX :
 *   <CompareBar label="Photo" left="88" right="95" leftName="Produit A" rightName="Produit B" />
 *   Valeurs 0–100 converties en /10. Valeurs 0–10 acceptées aussi.
 *   Props MUST be strings (compileMDX drops JSX expression props).
 */

import type { ReactNode } from 'react'

type CompareBarProps = {
  label: string
  left: number | string
  right: number | string
  leftName?: string
  rightName?: string
}

function toTen(v: unknown): number {
  const n = Number(v)
  if (isNaN(n) || n === 0) return 0
  return n > 10 ? Math.round(n) / 10 : n
}

export function CompareBar(props: CompareBarProps) {
  const { label, left, right, leftName = 'A', rightName = 'B' } = props
  const l = toTen(left)
  const r = toTen(right)
  const lPct = Math.min((l / 10) * 100, 100)
  const rPct = Math.min((r / 10) * 100, 100)
  const leftWins = l > r
  const rightWins = r > l

  return (
    <div style={{ marginBottom: '20px' }}>
      <span style={{
        display: 'block', fontSize: '11px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--text-primary)',
        fontFamily: 'var(--next-font-display), system-ui, sans-serif',
        marginBottom: '8px',
      }}>
        {label}
      </span>
      <BarRow name={leftName} score={l} pct={lPct} wins={leftWins} side="left" idx={0} />
      <BarRow name={rightName} score={r} pct={rPct} wins={rightWins} side="right" idx={1} />
    </div>
  )
}

function BarRow({ name, score, pct, wins, side, idx }: {
  name: string; score: number; pct: number; wins: boolean; side: 'left' | 'right'; idx: number
}) {
  /* Use CSS variables for theme-aware colors */
  const accentVar = side === 'left' ? 'var(--accent-1)' : 'var(--accent-3)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
      {/* Label */}
      <span style={{
        fontSize: '12px',
        color: wins ? 'var(--text-primary)' : 'var(--text-muted)',
        minWidth: '100px', flexShrink: 0,
        fontWeight: wins ? 600 : 400,
      }}>
        {name}
      </span>

      {/* Bar track */}
      <div style={{
        flex: 1, height: '12px',
        background: 'var(--bg-surface-2)', borderRadius: '6px',
        overflow: 'hidden', position: 'relative',
      }}>
        {/* Graduation marks */}
        {[25, 50, 75].map(p => (
          <div key={p} style={{
            position: 'absolute', left: `${p}%`, top: 0, bottom: 0,
            width: '1px', background: 'var(--border)', zIndex: 1,
          }} />
        ))}

        {/* Filled bar */}
        <div
          className={wins ? 'compare-bar-fill compare-bar-winner' : 'compare-bar-fill compare-bar-loser'}
          style={{
            '--bar-width': `${pct}%`,
            '--bar-delay': `${idx * 150 + 200}ms`,
            '--bar-color': accentVar,
            height: '100%',
            borderRadius: '6px',
            position: 'relative',
            zIndex: 2,
          } as React.CSSProperties}
        />
      </div>

      {/* Score /10 */}
      <span style={{
        fontFamily: 'var(--next-font-mono), monospace',
        fontSize: '14px', fontWeight: 700,
        color: wins ? accentVar : 'var(--text-muted)',
        minWidth: '46px', textAlign: 'right', whiteSpace: 'nowrap',
      }}>
        {score.toFixed(1)}<span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.5 }}>/10</span>
      </span>
    </div>
  )
}

/**
 * CompareBarGroup — wrapper avec score total.
 */
export function CompareBarGroup({ children, leftName, rightName }: {
  children: ReactNode; leftName?: string; rightName?: string
}) {
  const items: { left: number; right: number; lN: string; rN: string }[] = []
  const arr = Array.isArray(children) ? children : [children]

  arr.forEach((child) => {
    if (child && typeof child === 'object' && 'props' in child) {
      const p = (child as { props: CompareBarProps }).props
      if (p.left !== undefined && p.right !== undefined) {
        items.push({ left: toTen(p.left), right: toTen(p.right), lN: p.leftName ?? 'A', rN: p.rightName ?? 'B' })
      }
    }
  })

  const lAvg = items.length ? +(items.reduce((s, i) => s + i.left, 0) / items.length).toFixed(1) : 0
  const rAvg = items.length ? +(items.reduce((s, i) => s + i.right, 0) / items.length).toFixed(1) : 0
  const lN = leftName ?? items[0]?.lN ?? 'A'
  const rN = rightName ?? items[0]?.rN ?? 'B'
  const lWins = lAvg > rAvg
  const rWins = rAvg > lAvg

  return (
    <div style={{
      margin: '32px 0', padding: '20px 20px 12px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
    }}>
      {children}

      {items.length > 1 && (
        <div style={{
          borderTop: '1px solid var(--border)',
          marginTop: '16px', paddingTop: '14px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '8px',
        }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--text-muted)',
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          }}>
            Moyenne
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{
              fontFamily: 'var(--next-font-mono), monospace',
              fontSize: '14px', fontWeight: 700,
              color: lWins ? 'var(--accent-1)' : 'var(--text-muted)',
            }}>
              {lN} {lAvg.toFixed(1)}<span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.5 }}>/10</span>
            </span>
            <span style={{
              fontFamily: 'var(--next-font-mono), monospace',
              fontSize: '14px', fontWeight: 700,
              color: rWins ? 'var(--accent-3)' : 'var(--text-muted)',
            }}>
              {rN} {rAvg.toFixed(1)}<span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.5 }}>/10</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
