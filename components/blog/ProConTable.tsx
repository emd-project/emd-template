/**
 * ProConTable — tableau pour/contre côte à côte.
 * Usage MDX :
 *   <ProConTable pros="Avantage 1|Avantage 2" cons="Inconvénient 1|Inconvénient 2" />
 * Props MUST be strings (compileMDX drops JSX expression props).
 * Libellés par défaut localisés via `locale` (défaut fr).
 */

import { tl } from '@/lib/i18n'

type Props = {
  pros: string | string[]
  cons: string | string[]
  labelPro?: string
  labelCon?: string
  /** Locale active (défaut fr). */
  locale?: string
}

function parseList(val: string | string[] | undefined): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  return val.split('|').map((s) => s.trim()).filter(Boolean)
}

export function ProConTable({
  pros,
  cons,
  labelPro,
  labelCon,
  locale = 'fr',
}: Props) {
  const proList = parseList(pros)
  const conList = parseList(cons)
  const proLabel = labelPro ?? tl(locale, 'proConTable.pros')
  const conLabel = labelCon ?? tl(locale, 'proConTable.cons')

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        margin: 'var(--space-6) 0',
      }}
    >
      {/* Pour */}
      <div
        style={{
          background: 'color-mix(in srgb, var(--accent-3) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent-3) 20%, transparent)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4) var(--space-5)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'var(--accent-3)',
            margin: '0 0 var(--space-3)',
          }}
        >
          ✓ {proLabel}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {proList.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                paddingLeft: 'var(--space-4)',
                position: 'relative',
              }}
            >
              <span
                aria-hidden="true"
                style={{ position: 'absolute', left: 0, color: 'var(--accent-3)', fontWeight: 700 }}
              >
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Contre */}
      <div
        style={{
          background: 'color-mix(in srgb, var(--accent-1) 5%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent-1) 18%, transparent)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4) var(--space-5)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'var(--accent-1)',
            margin: '0 0 var(--space-3)',
          }}
        >
          ✗ {conLabel}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {conList.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                paddingLeft: 'var(--space-4)',
                position: 'relative',
              }}
            >
              <span
                aria-hidden="true"
                style={{ position: 'absolute', left: 0, color: 'var(--accent-1)', fontWeight: 700 }}
              >
                ×
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
