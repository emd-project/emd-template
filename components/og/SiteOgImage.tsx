/**
 * components/og/SiteOgImage.tsx — image OpenGraph du site, LOCALE-AWARE.
 *
 * Une seule implémentation, montée par deux routes de convention Next :
 *  - app/opengraph-image.tsx      → locale par défaut (FR)
 *  - app/en/opengraph-image.tsx   → /en et ses descendants
 *
 * POURQUOI DEUX ROUTES. `opengraph-image` s'applique à un SEGMENT et à ses
 * enfants. Tant que la seule route vivait à la racine, TOUTES les pages /en
 * héritaient d'une image dont le titre — `niche.tagline` — était français :
 * chaque partage social d'une page anglaise sortait en français. Le fichier dans
 * `app/en/` remplace l'héritage pour cette branche et rien d'autre.
 *
 * La grande ligne est du CONTENU DE CONFIG → `nicheL(locale, 'tagline')`
 * (lib/niche-l10n.ts, repli silencieux sur la base). La ligne de services est du
 * vocabulaire d'INTERFACE → `tl(locale, 'tools.*.eyebrow')`, dont les valeurs FR
 * sont mot pour mot celles qui étaient en dur ici. `dealWord` reste tel quel :
 * c'est le mot de la niche, il n'a pas de dimension de locale.
 *
 * Couleurs = palette du SITE (jamais celles du template en dur).
 */
import { ImageResponse } from 'next/og'
import { niche } from '@/niche.config'
import { nicheL } from '@/lib/niche-l10n'
import { tl } from '@/lib/i18n'

export const OG_SIZE = { width: 1200, height: 630 }

/** Texte alternatif de l'image, dans la locale demandée. */
export function ogAlt(locale: string): string {
  return `${niche.siteName} — ${nicheL(locale, 'tagline')}`
}

export function renderSiteOgImage(locale: string): ImageResponse {
  const year = new Date().getFullYear()
  const domain = niche.domain.toUpperCase()
  const p = niche.palette
  const services = [
    tl(locale, 'tools.comparator.eyebrow'),
    tl(locale, 'tools.quiz.eyebrow'),
    tl(locale, 'tools.simulator.eyebrow'),
    niche.dealWord.charAt(0).toUpperCase() + niche.dealWord.slice(1),
  ].join(' · ')

  return new ImageResponse(
    (
      <div
        style={{
          background: p.bgPrimary,
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
            background: `linear-gradient(90deg, ${p.accent1}, ${p.accent4}, ${p.accent3})`,
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 18,
            color: p.accent1,
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
            color: p.textPrimary,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          {nicheL(locale, 'tagline')}
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 24, color: p.textSecondary, fontWeight: 400 }}>
          {services}
        </div>

        {/* Watermark accent */}
        <div
          style={{
            position: 'absolute',
            right: '60px',
            bottom: '40px',
            fontSize: '280px',
            fontWeight: 800,
            color: p.accent2,
            opacity: 0.05,
            lineHeight: 1,
          }}
        >
          ★
        </div>
      </div>
    ),
    OG_SIZE
  )
}
