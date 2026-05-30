/**
 * lib/da-presets — base de données de directions artistiques pré-curées.
 *
 * Source : extrait du repo nextlevelbuilder/ui-ux-pro-max-skill, converti en JSON.
 * - 161 palettes par industrie/niche
 * - 72 paires typographiques (Google Fonts)
 * - 75 styles UI (Glassmorphism, Brutalism, Editorial, Tech, etc.)
 * - 161 règles de raisonnement par niche (pattern, mood, anti-patterns)
 *
 * Usage typique pendant l'init d'un nouveau site :
 * 1. findPalettesByKeyword("travel") → palettes pertinentes pour la niche
 * 2. findFontPairingsByMood("editorial elegant") → pairings cohérents
 * 3. findNicheRule("E-commerce Luxury") → règles de design
 * 4. composePreset(...) → génère un objet prêt à coller dans niche.config.ts
 */

import palettesData from './palettes.json'
import fontPairingsData from './font-pairings.json'
import uiStylesData from './ui-styles.json'
import nicheRulesData from './niche-rules.json'

// ─── Types ──────────────────────────────────────────────────────────────

export type Palette = {
  productType: string
  primary: string
  primaryFg: string
  secondary: string
  secondaryFg: string
  accent: string
  accentFg: string
  background: string
  foreground: string
  card: string
  cardFg: string
  muted: string
  mutedFg: string
  border: string
  destructive: string
  destructiveFg: string
  ring: string
  notes: string
}

export type FontPairing = {
  name: string
  category: string
  heading: string
  body: string
  mood: string
  bestFor: string
  notes: string
}

export type UIStyle = {
  category: string
  type: string
  keywords: string
  primaryColors: string
  secondaryColors: string
  effects: string
  bestFor: string
  doNotUseFor: string
  lightMode: string
  darkMode: string
  performance: string
  accessibility: string
  era: string
  complexity: string
  aiPrompt: string
  cssKeywords: string
  checklist: string
  variables: string
}

export type NicheRule = {
  category: string
  pattern: string
  stylePriority: string
  colorMood: string
  typographyMood: string
  effects: string
  decisionRules: string
  antiPatterns: string
  severity: string
}

// ─── Datasets ───────────────────────────────────────────────────────────

export const palettes = palettesData as Palette[]
export const fontPairings = fontPairingsData as FontPairing[]
export const uiStyles = uiStylesData as UIStyle[]
export const nicheRules = nicheRulesData as NicheRule[]

// ─── Search helpers ─────────────────────────────────────────────────────

function lower(s: string | undefined): string {
  return (s ?? '').toLowerCase()
}

function score(text: string, keywords: string[]): number {
  const t = lower(text)
  return keywords.reduce((acc, k) => acc + (t.includes(lower(k)) ? 1 : 0), 0)
}

/** Find palettes matching free-form keywords (niche, industry, mood). */
export function findPalettes(keywords: string[], limit = 5): Palette[] {
  return palettes
    .map((p) => ({
      p,
      s: score(`${p.productType} ${p.notes}`, keywords),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p)
}

/** Find a single palette by exact product type (case-insensitive). */
export function findPaletteByType(productType: string): Palette | undefined {
  const target = lower(productType)
  return palettes.find((p) => lower(p.productType) === target)
}

/** Find font pairings matching keywords (mood, best-for, category). */
export function findFontPairings(keywords: string[], limit = 5): FontPairing[] {
  return fontPairings
    .map((f) => ({
      f,
      s: score(`${f.name} ${f.category} ${f.mood} ${f.bestFor}`, keywords),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.f)
}

/** Find UI styles matching keywords. */
export function findUIStyles(keywords: string[], limit = 5): UIStyle[] {
  return uiStyles
    .map((u) => ({
      u,
      s: score(`${u.category} ${u.keywords} ${u.bestFor}`, keywords),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.u)
}

/** Find a niche rule by category name (case-insensitive). */
export function findNicheRule(category: string): NicheRule | undefined {
  const target = lower(category)
  return nicheRules.find((r) => lower(r.category) === target)
}

/** Find niche rules matching keywords. */
export function findNicheRules(keywords: string[], limit = 5): NicheRule[] {
  return nicheRules
    .map((r) => ({
      r,
      s: score(`${r.category} ${r.colorMood} ${r.typographyMood}`, keywords),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.r)
}

// ─── Preset composition ─────────────────────────────────────────────────

/**
 * Compose a niche.config.ts-ready preset from a product type + mood keywords.
 * Returns an object with palette + fonts + style suggestions + niche rule.
 */
export function composePreset(productType: string, moodKeywords: string[] = []) {
  const palette = findPaletteByType(productType) ?? findPalettes([productType, ...moodKeywords], 1)[0]
  const rule = findNicheRule(productType) ?? findNicheRules([productType, ...moodKeywords], 1)[0]
  const fonts = findFontPairings([...moodKeywords, productType, rule?.typographyMood ?? ''], 3)
  const styles = findUIStyles([...moodKeywords, productType, rule?.stylePriority ?? ''], 3)

  return {
    palette,
    rule,
    fonts,
    styles,
  }
}

/** List all unique product types (for quick reference). */
export function listProductTypes(): string[] {
  return Array.from(new Set(palettes.map((p) => p.productType))).sort()
}

/** List all unique font pairing categories. */
export function listFontCategories(): string[] {
  return Array.from(new Set(fontPairings.map((f) => f.category))).sort()
}

/** List all unique UI style categories. */
export function listStyleCategories(): string[] {
  return Array.from(new Set(uiStyles.map((u) => u.category))).sort()
}
