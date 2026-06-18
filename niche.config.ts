/**
 * niche.config.ts — Configuration centrale du site.
 * C'est le SEUL fichier à remplir pour chaque nouveau site issu du template.
 *
 * Workflow :
 * - Soit rempli par Claude Code via le skill `init-site` (qui pose les questions
 *   par blocs, en commençant par le Bloc 0 — langues + marché géo).
 * - Soit rempli à la main quand il n'y a pas de livrable Claude Design.
 *
 * Tous les composants, configs et pages dépendent de ce fichier. Ne pas hardcoder
 * de couleur, de font, de nom de site, de tagline dans le JSX — passer par ici.
 *
 * IMPORTANT — Bloc 0 d'init-site :
 *   Les champs `market`, `locales`, `defaultLocale`, `localePrefix` sont définis
 *   AVANT tous les autres et pilotent l'architecture i18n du site (routing,
 *   middleware, hreflang, sitemap, OG locale, schema.org). Cf. skills/init-site/SKILL.md.
 */

export type NicheConfig = {
  // Identité
  siteName: string
  domain: string
  tagline: string

  // Vocabulaire de la niche
  entity: string          // "produit", "destination", "carte"
  entities: string        // pluriel
  entityVerb: string      // "acheter", "explorer", "souscrire"
  dealWord: string        // "deals", "bons plans", "offres"

  // Hero
  heroPrefix: string
  heroSuffix: string
  rotatingWords: string[]
  subtitle: string
  ctaPrimary: { text: string; url: string }
  ctaSecondary: { text: string; url: string }

  // Catégories (1 couleur accent par catégorie)
  categories: {
    slug: string
    label: string
    accent: string
    description?: string
  }[]

  // Outils
  quiz: {
    enabled: boolean
    question: string
    criteria: string[]
  }
  comparator: {
    enabled: boolean
    criteria: string[]
  }
  simulator: {
    enabled: boolean
    title: string
    description: string
  }

  // Style & DA
  style: {
    mode: 'dark' | 'light'
    hero: 'split' | 'centered' | 'minimal'
    effects: 'aurora' | 'subtle' | 'none'
    cards: 'bordered' | 'filled' | 'minimal'
    uiStyle: string
  }
  palette: {
    accent1: string
    accent2: string
    accent3: string
    accent4: string
    accent5: string
    bgPrimary: string
    bgSurface: string
    bgSurface2: string
    textPrimary: string
    textSecondary: string
    textMuted: string
  }
  fonts: {
    display: string
    body: string
  }

  // Auteur
  author: {
    name: string
    slug: string
    title: string
    bio: string
    tone: string[]
    noGo: string[]
    formulations: string[]
  }

  // Identité visuelle
  logo: string
  homeSections: string[]

  // Affiliation
  affiliateTag: string
  defaultStore: string

  // Signature DA anti-IA — personnalité visuelle unique
  signature: {
    anchor: string
    oneRule: string
    inspiration: string[]
    forbidden: string[]
    components: string[]
  }

  // ─── i18n & marché (Bloc 0 d'init-site) ────────────────────────────────
  /**
   * Marché géographique principal. Détermine OG locale (`fr_BE` vs `fr_FR`...),
   * devise par défaut (EUR/CHF/CAD...), schema.org `addressCountry`, références
   * institutionnelles citées par seo-geo-redaction (FSMA/BNB pour BE, ACPR/AMF
   * pour FR, FINMA pour CH, AMF Québec pour CA).
   */
  market: 'BE' | 'FR' | 'CA' | 'CH' | string

  /**
   * Locale par défaut du site (généralement la première de `locales`).
   * Avec `localePrefix: 'as-needed'`, cette locale n'a PAS de préfixe URL
   * (URLs canoniques courtes pour le marché principal → SEO optimal).
   */
  defaultLocale: string

  /**
   * Liste des langues supportées. Ordre = priorité éditoriale.
   * Si `length === 1` → routing `app/page.tsx` direct, pas de middleware i18n.
   * Si `length >= 2` → routing `app/[locale]/...`, middleware `next-intl`,
   *   miroir strict obligatoire (cf. skills/seo-geo-redaction/references/mirror-i18n.md).
   */
  locales: string[]

  /**
   * Comportement du préfixe locale dans l'URL.
   * - `'as-needed'` (recommandé) : default sans préfixe, autres sous segment.
   *   Ex: `/blog/article` (FR) + `/en/blog/article` (EN).
   * - `'always'` : toutes locales sous préfixe. Ex: `/fr/...` + `/en/...`.
   * - `undefined` : 1 seule locale, pas de routing locale-aware.
   */
  localePrefix?: 'as-needed' | 'always'

  // Technique
  vercelRegion: string
  repo: string
  branch: string
}

// ─── Valeurs par défaut (placeholder) ───────────────────────────────────
// Ces valeurs permettent au site de build avec un template vierge. Le défaut
// visuel est le skin V1 Voltéo (clair, magazine). Elles sont remplacées par
// init-site lors du bootstrap (skin choisi + muté) — cf. docs/AUTO-DESIGN.md.

export const niche: NicheConfig = {
  siteName: 'emd-template',
  domain: 'example.com',
  tagline: 'Le comparateur indépendant de votre niche',

  entity: 'produit',
  entities: 'produits',
  entityVerb: 'choisir',
  dealWord: 'deals',

  heroPrefix: 'Choisir votre',
  heroSuffix: 'en toute confiance',
  rotatingWords: ['produit'],
  subtitle: 'Comparateur indépendant, quiz personnalisé et simulateur — tout pour décider vite et bien.',
  ctaPrimary: { text: 'Comparer →', url: '/comparer' },
  ctaSecondary: { text: 'Quiz personnalisé', url: '/quiz' },

  categories: [],

  quiz: { enabled: true, question: '', criteria: [] },
  comparator: { enabled: true, criteria: [] },
  simulator: { enabled: true, title: '', description: '' },

  // Défaut = skin V1 Voltéo « Électrique » (clair) · archétype magazine (hero centered).
  // 'split' → home comparateur ; 'centered'/'minimal' → home magazine.
  style: {
    mode: 'light',
    hero: 'centered',
    effects: 'subtle',
    cards: 'bordered',
    uiStyle: 'electrique',
  },
  palette: {
    accent1: '#FF3D57',
    accent2: '#FFD23F',
    accent3: '#3DFFC0',
    accent4: '#7B61FF',
    accent5: '#3D9BFF',
    bgPrimary: '#0A0A0F',
    bgSurface: '#13131A',
    bgSurface2: '#1C1C26',
    textPrimary: '#F0F0F5',
    textSecondary: '#9090A8',
    textMuted: '#55556A',
  },
  fonts: { display: 'Bricolage Grotesque', body: 'Hanken Grotesk' },

  author: { name: '', slug: '', title: '', bio: '', tone: [], noGo: [], formulations: [] },

  logo: 'emd·template',
  homeSections: ['ticker', 'deals', 'articles', 'categories', 'tools', 'author'],

  signature: {
    anchor: '',
    oneRule: '',
    inspiration: [],
    forbidden: [],
    components: [],
  },

  affiliateTag: '',
  defaultStore: 'Amazon',

  // Bloc 0 d'init-site — placeholders à remplacer impérativement
  market: 'BE',                  // À choisir : 'BE' | 'FR' | 'CA' | 'CH' | string
  defaultLocale: 'fr',
  // i18n actif : FR (défaut, sans préfixe) + EN (sous /en). L'arbre EN vit dans
  // app/en/ (frère disjoint des routes FR sous app/(site)/). Le routing reste
  // explicite par dossier — pas de middleware i18n, pas de [locale] dynamique.
  locales: ['fr', 'en'],
  localePrefix: 'as-needed',

  vercelRegion: 'fra1',
  repo: '',
  branch: 'main',
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Accent CSS variable for a given category index. */
const ACCENT_VARS = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)']

export function categoryAccent(index: number): string {
  return ACCENT_VARS[index % ACCENT_VARS.length]
}

/** Map category slug → label */
export function categoryLabels(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const cat of niche.categories) map[cat.slug] = cat.label
  return map
}

/** Map category slug → CSS accent variable */
export function categoryAccents(): Record<string, string> {
  const map: Record<string, string> = {}
  niche.categories.forEach((cat, i) => {
    map[cat.slug] = categoryAccent(i)
  })
  return map
}

/** True si le site est multi-langue (≥ 2 locales actives). */
export function isMultilingual(): boolean {
  return niche.locales.length >= 2
}

/**
 * Helper pour construire un chemin localisé respectant `localePrefix: 'as-needed'`.
 * - Si lang === defaultLocale → renvoie path tel quel (pas de préfixe)
 * - Sinon → préfixe `/[lang]`
 * Exemple : localePath('fr', '/blog') → '/blog' ; localePath('en', '/blog') → '/en/blog'
 */
export function localePath(lang: string, path: string): string {
  if (lang === niche.defaultLocale) return path
  return `/${lang}${path === '/' ? '' : path}`
}
