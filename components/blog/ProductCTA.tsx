/**
 * ProductCTA — carte produit affilié inline avec DA aurora.
 * Si image fournie → affiche image + nom + description + prix + CTA.
 * Sinon → design typographique pur.
 * Usage MDX :
 *   <ProductCTA name="Produit X" price="999 €" url="https://..." badge="Recommandé" hook="Description courte." />
 *   <ProductCTA name="Produit X" price="999 €" url="https://..." image="/images/produits/x.webp" badge="Recommandé" hook="Description courte." />
 * Server Component.
 */

import Image from 'next/image'
import { AffiliateLink } from '@/components/ui/AffiliateLink'
import { tl } from '@/lib/i18n'

type ProductCTAProps = {
  name: string
  price: string
  url: string
  image?: string
  badge?: string
  hook?: string
  /** Locale active (défaut fr). */
  locale?: string
}

export function ProductCTA({ name, price, url, image, badge, hook, locale = 'fr' }: ProductCTAProps) {
  return (
    <div style={{ margin: 'var(--space-10) 0' }}>
      <div className="comparateur-card-wrap">
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: 'var(--space-8) var(--space-6)',
            display: image ? 'grid' : 'flex',
            gridTemplateColumns: image ? 'minmax(120px, 200px) 1fr' : undefined,
            gap: image ? 'var(--space-6)' : 'var(--space-3)',
            flexDirection: image ? undefined : 'column',
            alignItems: image ? 'center' : 'center',
            textAlign: image ? 'left' : 'center',
          }}
        >
          {/* Aurora glow background */}
          <div aria-hidden="true" style={{ position: 'absolute', top: '-40%', left: '10%', width: '80%', height: '120%', background: 'radial-gradient(ellipse, var(--aurora-1) 0%, transparent 70%)', opacity: 0.06, filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div aria-hidden="true" style={{ position: 'absolute', bottom: '-30%', right: '5%', width: '60%', height: '100%', background: 'radial-gradient(ellipse, var(--aurora-3) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(40px)', pointerEvents: 'none' }} />

          {/* Product image */}
          {image && (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Image
                src={image}
                alt={name}
                width={200}
                height={200}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: image ? 'flex-start' : 'center' }}>
            {/* Badge */}
            {badge && (
              <span style={{ fontFamily: 'var(--next-font-mono), monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-3)' }}>
                {badge}
              </span>
            )}

            {/* Name */}
            <span style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {name}
            </span>

            {/* Hook / description */}
            {hook && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, maxWidth: '380px' }}>
                {hook}
              </p>
            )}

            {/* Price */}
            <span style={{ fontFamily: 'var(--next-font-mono), monospace', fontSize: image ? 'clamp(24px, 5vw, 32px)' : 'clamp(36px, 8vw, 52px)', fontWeight: 700, background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {price}
            </span>

            {/* CTA button */}
            <AffiliateLink href={url} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))', color: '#fff', fontWeight: 700, fontSize: '14px', padding: 'var(--space-3) var(--space-8)', textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
              {tl(locale, 'product.viewPrice')}
            </AffiliateLink>
          </div>
        </div>
      </div>
    </div>
  )
}
