/**
 * DealsStrip — bandeau de deals en défilement continu (MarqueeStrip).
 * Données statiques placeholder — remplacées par ISR + API deals ensuite.
 * Server Component.
 */

import { MarqueeStrip } from '@/components/effects/MarqueeStrip'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'

type Deal = {
  label: string
  badge: string
  badgeColor?: string
}

// Placeholder deals — will be replaced by CMS content
const DEALS: Deal[] = [
  { label: `${niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)} en cours`, badge: t('deals.comingSoon'), badgeColor: 'var(--accent-3)' },
  { label: t('deals.placeholder'), badge: t('deals.template'), badgeColor: 'var(--accent-2)' },
]

function DealChip({ label, badge, badgeColor = 'var(--accent-1)' }: Deal) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-2) var(--space-5)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        color: 'var(--text-primary)',
        fontSize: '13px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          padding: '2px 8px',
          backgroundColor: badgeColor,
          color: '#fff',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        {badge}
      </span>
      {label}
    </span>
  )
}

export function DealsStrip() {
  return (
    <section aria-label={t('deals.ariaLabel')} style={{ paddingBlock: 'var(--space-4)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
      <MarqueeStrip speed="slow" gap="var(--space-3)">
        {DEALS.map((deal) => (
          <DealChip key={deal.label} {...deal} />
        ))}
      </MarqueeStrip>
    </section>
  )
}
