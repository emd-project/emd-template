/**
 * ArticleImage — image optimisée pour insertion dans le corps MDX.
 * Usage MDX :
 *   <ArticleImage src="/images/blog/mon-image.webp" alt="Description de l'image" />
 *   <ArticleImage src="/images/blog/mon-image.webp" alt="Description" caption="Source : rapport 2026" />
 * Server Component — compatible compileMDX.
 * Props MUST be strings (compileMDX drops JSX expression props).
 */

import Image from 'next/image'

type ArticleImageProps = {
  src: string
  alt: string
  caption?: string
  width?: string   // string car MDX passe des strings
  height?: string
}

export function ArticleImage({ src, alt, caption, width = '760', height = '428' }: ArticleImageProps) {
  const w = parseInt(width, 10) || 760
  const h = parseInt(height, 10) || 428

  return (
    <figure style={{ margin: 'var(--space-8) 0' }}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      />
      {caption && (
        <figcaption
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: 'var(--space-2)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
