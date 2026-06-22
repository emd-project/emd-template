/**
 * lib/typography.ts — Pool TYPOGRAPHIQUE curé pour l'auto-DA à l'init.
 *
 * Pourquoi : le chemin par défaut n'exposait que ~4 combinaisons (les 4 skins Voltéo).
 * Ici : 16 paires display+body, **toutes sur Google Fonts** (donc chargeables via next/font),
 * adaptées aux sites comparateur/magazine, et variées (grotesque / serif éditorial / géométrique /
 * humaniste / expressif). `suggestFonts(domaine)` en choisit une de façon **déterministe** (anti-empreinte).
 *
 * IMPORTANT — next/font exige des imports STATIQUES : ce module ne charge PAS les fonts au runtime.
 * Il sert à l'INIT (et à la doc) pour CHOISIR une paire ; l'init réécrit ensuite `app/layout.tsx`
 * avec les imports next/font correspondants (nom Google → import : remplacer les espaces par `_`).
 */
import { niche } from '@/niche.config'

export type FontFamilyKind = 'grotesque' | 'serif-editorial' | 'geometric' | 'humanist' | 'expressive'

export type FontPairing = {
  id: string
  label: string
  /** Nom Google Fonts EXACT (pour next/font : remplacer les espaces par `_`). */
  display: string
  body: string
  family: FontFamilyKind
  mood: string
}

/** 16 paires curées, toutes Google Fonts, lisibles (AA) et « sérieuses » (pas de pixel/cyberpunk). */
export const FONT_PAIRINGS: readonly FontPairing[] = [
  { id: 'bricolage', label: 'Bricolage × Hanken', display: 'Bricolage Grotesque', body: 'Hanken Grotesk', family: 'grotesque', mood: 'moderne, chaleureux (défaut V1)' },
  { id: 'space-inter', label: 'Space Grotesk × Inter', display: 'Space Grotesk', body: 'Inter', family: 'grotesque', mood: 'tech, net, comparateur' },
  { id: 'archivo-inter', label: 'Archivo × Inter', display: 'Archivo', body: 'Inter', family: 'grotesque', mood: 'robuste, neutre, data' },
  { id: 'fraunces-inter', label: 'Fraunces × Inter', display: 'Fraunces', body: 'Inter', family: 'serif-editorial', mood: 'éditorial chaud, caractère' },
  { id: 'newsreader-public', label: 'Newsreader × Public Sans', display: 'Newsreader', body: 'Public Sans', family: 'serif-editorial', mood: 'presse, magazine, fil' },
  { id: 'spectral-plex', label: 'Spectral × IBM Plex Sans', display: 'Spectral', body: 'IBM Plex Sans', family: 'serif-editorial', mood: 'lecture longue, sérieux' },
  { id: 'playfair-source', label: 'Playfair × Source Sans 3', display: 'Playfair Display', body: 'Source Sans 3', family: 'serif-editorial', mood: 'luxe, fort contraste' },
  { id: 'dmserif-dmsans', label: 'DM Serif × DM Sans', display: 'DM Serif Display', body: 'DM Sans', family: 'serif-editorial', mood: 'élégant, titres affirmés' },
  { id: 'crimson-inter', label: 'Crimson Pro × Inter', display: 'Crimson Pro', body: 'Inter', family: 'serif-editorial', mood: 'académique, sobre' },
  { id: 'outfit-work', label: 'Outfit × Work Sans', display: 'Outfit', body: 'Work Sans', family: 'geometric', mood: 'géométrique, polyvalent' },
  { id: 'sora-hanken', label: 'Sora × Hanken', display: 'Sora', body: 'Hanken Grotesk', family: 'geometric', mood: 'premium, tech doux' },
  { id: 'manrope', label: 'Manrope (mono-famille)', display: 'Manrope', body: 'Manrope', family: 'geometric', mood: 'minimal, moderne' },
  { id: 'lexend-inter', label: 'Lexend × Inter', display: 'Lexend', body: 'Inter', family: 'humanist', mood: 'accessible, lisibilité max' },
  { id: 'jakarta', label: 'Plus Jakarta Sans (mono-famille)', display: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans', family: 'humanist', mood: 'SaaS, propre, B2B' },
  { id: 'syne-manrope', label: 'Syne × Manrope', display: 'Syne', body: 'Manrope', family: 'expressive', mood: 'créatif, marqué, mode' },
  { id: 'instrument', label: 'Instrument Serif × Instrument Sans', display: 'Instrument Serif', body: 'Instrument Sans', family: 'expressive', mood: 'éditorial moderne, chic' },
]

/** Familles privilégiées par archetype de home (le reste du pool sert de repli). */
export const FAMILY_BY_HOME: Record<string, FontFamilyKind[]> = {
  comparateur: ['grotesque', 'geometric', 'humanist'],
  marche: ['grotesque', 'geometric'],
  magazine: ['serif-editorial', 'expressive', 'grotesque'],
  fil: ['serif-editorial', 'expressive'],
}

function seedHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Choix déterministe d'une paire à partir d'un seed (domaine), avec biais optionnel par archetype :
 * deux sites de domaines différents tombent sur des typos différentes (anti-empreinte), mais cohérentes
 * avec le type de home. Passé à l'INIT, qui écrit la paire choisie dans `app/layout.tsx`.
 */
export function suggestFonts(seed: string = niche.domain || niche.siteName, home?: string): FontPairing {
  const families = home ? FAMILY_BY_HOME[home] : undefined
  const pool = families && families.length
    ? FONT_PAIRINGS.filter((p) => families.includes(p.family))
    : FONT_PAIRINGS
  const list = pool.length ? pool : FONT_PAIRINGS
  return list[seedHash(seed) % list.length]
}
