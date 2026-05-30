import { ImageResponse } from 'next/og'
import { niche } from '@/niche.config'

export const runtime = 'edge'
export const alt = `${niche.siteName} — ${niche.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  const year = new Date().getFullYear()
  const domain = niche.domain.toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0F',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #FF3D57, #7B61FF, #3DFFC0)',
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 18,
            color: '#FF3D57',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 28,
            fontWeight: 700,
          }}
        >
          {domain} · {year}
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#F0F0F5',
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          {niche.tagline}
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 24, color: '#9090A8', fontWeight: 400 }}>
          Comparateur · Quiz · Simulateur · {niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1)}
        </div>

        {/* Watermark number */}
        <div
          style={{
            position: 'absolute',
            right: '60px',
            bottom: '40px',
            fontSize: '280px',
            fontWeight: 800,
            color: '#FFD23F',
            opacity: 0.05,
            lineHeight: 1,
          }}
        >
          10
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
