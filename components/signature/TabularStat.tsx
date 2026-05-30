type TabularStatProps = {
  label: string
  value: string
  unit?: string
  accent?: 1 | 2 | 3 | 4 | 5
}

export function TabularStat({ label, value, unit, accent = 1 }: TabularStatProps) {
  const accentVar = `var(--accent-${accent})`

  return (
    <div
      className="tabular-stat"
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: 'var(--space-3) 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 800,
            color: accentVar,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {unit}
          </span>
        )}
      </span>
    </div>
  )
}
