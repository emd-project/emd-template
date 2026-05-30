/**
 * PriceTag — affichage prix avec JetBrains Mono (tabular-nums).
 * Affiche : prix barré (optionnel) + prix actuel + badge % économie (optionnel).
 * JetBrains Mono chargé ici uniquement — pas dans layout global.
 * Server Component.
 */

import { JetBrains_Mono } from 'next/font/google'

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--next-font-mono',
  display: 'swap',
  preload: false,  // chargé à la demande, pas critique
})

type PriceTagProps = {
  price: number           // prix actuel en euros
  priceOriginal?: number  // prix barré
  currency?: string       // défaut '€'
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean     // affiche badge % économie si priceOriginal fourni
  className?: string
}

const FONT_SIZES = {
  sm: { current: '18px', original: '13px', badge: '11px' },
  md: { current: '26px', original: '16px', badge: '12px' },
  lg: { current: '36px', original: '20px', badge: '13px' },
}

function computeSavings(price: number, original: number): number {
  return Math.round(((original - price) / original) * 100)
}

export function PriceTag({
  price,
  priceOriginal,
  currency = '€',
  size = 'md',
  showBadge = true,
  className,
}: PriceTagProps) {
  const sizes = FONT_SIZES[size]
  const savings = priceOriginal ? computeSavings(price, priceOriginal) : 0

  return (
    <div
      className={`${fontMono.variable} ${className ?? ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
      }}
    >
      {/* Prix barré */}
      {priceOriginal !== undefined && (
        <span
          style={{
            fontFamily: 'var(--next-font-mono), ui-monospace, monospace',
            fontSize: sizes.original,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-muted)',
            textDecoration: 'line-through',
          }}
          aria-label={`Prix habituel : ${priceOriginal} ${currency}`}
        >
          {priceOriginal.toFixed(2)}{currency}
        </span>
      )}

      {/* Prix actuel */}
      <span
        style={{
          fontFamily: 'var(--next-font-mono), ui-monospace, monospace',
          fontSize: sizes.current,
          fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--accent-2)',
          lineHeight: 1,
        }}
        aria-label={`Prix actuel : ${price} ${currency}`}
      >
        {price.toFixed(2)}{currency}
      </span>

      {/* Badge économie */}
      {showBadge && priceOriginal !== undefined && savings > 0 && (
        <span
          aria-label={`Économie de ${savings}%`}
          style={{
            fontSize: sizes.badge,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-3)',
            color: 'var(--bg-primary)',
            letterSpacing: '0.02em',
            alignSelf: 'center',
          }}
        >
          -{savings}%
        </span>
      )}
    </div>
  )
}
