/**
 * ProductCarousel — horizontal scrollable row of product cards.
 * Reads product data from content/produits/[slug].yaml.
 * Server Component — no JS carousel, pure CSS scroll.
 *
 * Usage MDX:
 *   <ProductCarousel products="produit-a,produit-b,produit-c" />
 */

import Image from 'next/image'
import { AffiliateLink } from '@/components/ui/AffiliateLink'
import { getProduct, getPrimaryLink } from '@/lib/products'
import { tl } from '@/lib/i18n'

type ProductCarouselProps = {
  products: string
  /** Locale active (défaut fr). */
  locale?: string
}

export function ProductCarousel({ products, locale = 'fr' }: ProductCarouselProps) {
  const slugs = products
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const items = slugs
    .map((slug) => {
      const product = getProduct(slug)
      if (!product) return null
      const url = getPrimaryLink(product)
      return { slug, product, url }
    })
    .filter(
      (item): item is { slug: string; product: NonNullable<ReturnType<typeof getProduct>>; url: string } =>
        item !== null && item.url !== ''
    )

  if (items.length === 0) return null

  return (
    <div style={{ margin: 'var(--space-8) 0' }}>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'var(--space-3)',
        }}
      >
        {items.map(({ slug, product, url }) => (
          <div
            key={slug}
            style={{
              flex: '0 0 260px',
              maxWidth: '300px',
              scrollSnapAlign: 'start',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg, 12px)',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Aurora glow */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-30%',
                left: '10%',
                width: '80%',
                height: '100%',
                background: 'radial-gradient(ellipse, var(--aurora-1) 0%, transparent 70%)',
                opacity: 0.05,
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />

            {/* Product image */}
            {product.image && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: 'var(--space-4) var(--space-4) 0',
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={260}
                  height={180}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 'var(--radius-md, 8px)',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}

            {/* Card content */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                flex: 1,
              }}
            >
              {/* Badge */}
              {product.badge && (
                <span
                  style={{
                    fontFamily: 'var(--next-font-mono), monospace',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-3)',
                  }}
                >
                  {product.badge}
                </span>
              )}

              {/* Name */}
              <span
                style={{
                  fontFamily: 'var(--next-font-display), system-ui, sans-serif',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.25,
                }}
              >
                {product.name}
              </span>

              {/* Hook */}
              {product.hook && (
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {product.hook}
                </p>
              )}

              {/* Price */}
              <span
                style={{
                  fontFamily: 'var(--next-font-mono), monospace',
                  fontSize: 'clamp(20px, 4vw, 26px)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginTop: 'auto',
                  paddingTop: 'var(--space-2)',
                }}
              >
                {product.prix}
              </span>

              {/* CTA */}
              <AffiliateLink
                href={url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: 'var(--space-2) var(--space-4)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                  borderRadius: 'var(--radius-md, 8px)',
                  marginTop: 'var(--space-2)',
                }}
              >
                {tl(locale, 'product.viewPrice')}
              </AffiliateLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
