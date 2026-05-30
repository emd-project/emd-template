/**
 * ProductAffiliate — ligne produit avec lien Amazon affilié.
 * Si image fournie → miniature à gauche.
 * Sinon → design border-left accent + typo.
 * Server Component.
 */
import Link from 'next/link'
import Image from 'next/image'
import { addAffiliateTag } from '@/lib/utils/affiliate'

type Props = {
  name: string
  hint: string
  priceFrom: string
  amazonUrl: string
  accent: string
  bgRgba: string
  image?: string
}

export function ProductAffiliate({ name, hint, priceFrom, amazonUrl, accent, image }: Props) {
  return (
    <Link
      href={addAffiliateTag(amazonUrl)}
      target="_blank"
      rel="noopener sponsored"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        className="product-affiliate"
        style={{
          borderLeft: image ? 'none' : `2px solid color-mix(in srgb, ${accent} 35%, transparent)`,
          paddingLeft: image ? 0 : 'var(--space-3)',
          paddingTop: 'var(--space-1)',
          paddingBottom: 'var(--space-1)',
          display: 'flex',
          alignItems: 'center',
          gap: image ? 'var(--space-3)' : 0,
          transition: 'border-color 150ms ease',
        }}
      >
        {image && (
          <Image
            src={image}
            alt={name}
            width={48}
            height={48}
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <p style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              {name}
            </p>
            <span style={{ fontSize: '12px', fontWeight: 700, color: accent, flexShrink: 0 }}>
              dès {priceFrom}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, opacity: 0.75 }}>
              {hint}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>amazon.fr →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
