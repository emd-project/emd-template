/**
 * niche.config.ts — Configuration centrale du site.
 * C'est le SEUL fichier à remplir pour chaque nouveau site issu du template.
 *
 * Workflow :
 * - Soit rempli par Claude Code lors de l'intégration des outputs Claude Design
 *   (voir design-incoming/READ-FIRST.md).
 * - Soit rempli à la main quand il n'y a pas de livrable Claude Design.
 *
 * Tous les composants, configs et pages dépendent de ce fichier. Ne pas hardcoder
 * de couleur, de font, de nom de site, de tagline dans le JSX — passer par ici.
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
  heroPrefix: string      // "Choisir votre"
  heroSuffix: string      // "en 10 minutes"
  rotatingWords: string[] // ["iPhone", "Mac"] → ["vol", "hôtel"]
  subtitle: string
  ctaPrimary: { text: string; url: string }
  ctaSecondary: { text: string; url: string }

  // Catégories (1 couleur accent par catégorie)
  categories: {
    slug: string
    label: string
    accent: string // hex color
    description?: string
  }[]

  // Outils
  quiz: {
    enabled: boolean
    question: string        // "Quel iPhone pour vous ?"
    criteria: string[]      // ["budget", "usage", "taille"]
  }
  comparator: {
    enabled: boolean
    criteria: string[]      // ["prix", "performance", "photo"]
  }
  simulator: {
    enabled: boolean
    title: string           // "Calculer votre budget Apple"
    description: string
  }

  // Style & DA
  style: {
    mode: 'dark' | 'light'             // dark-first ou light-first
    hero: 'split' | 'centered' | 'minimal' // layout du hero
    effects: 'aurora' | 'subtle' | 'none'  // intensité des effets visuels
    cards: 'bordered' | 'filled' | 'minimal' // style des cartes article
    uiStyle: string                    // style UI depuis da-presets (ex: "Glassmorphism", "Brutalism", "Editorial Grid / Magazine")
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
    display: string   // Google Fonts family name
    body: string      // Google Fonts family name
  }

  // Auteur
  author: {
    name: string
    slug: string
    title: string
    bio: string
    tone: string[]          // ["direct", "honnête", "expert"]
    noGo: string[]          // ["révolutionnaire", "incroyable"]
    formulations: string[]  // ["Honnêtement,", "Le vrai tip :"]
  }

  // Identité visuelle
  logo: string                // Texte du logo libre (ex: "10min·voyage", "MonSite", "ASPIRO")
  homeSections: string[]      // Ordre des sections home. Options: 'ticker', 'deals', 'articles', 'categories', 'tools', 'author'

  // Affiliation
  affiliateTag: string     // "monsite-21"
  defaultStore: string     // "Amazon"

  // Signature DA anti-IA — personnalité visuelle unique
  signature: {
    anchor: string           // élément visuel distinctif (ex: "lettrine éditoriale façon Monocle")
    oneRule: string          // 1 règle qui casse le look IA (ex: "jamais de gradient sur les boutons")
    inspiration: string[]    // 2-3 vrais magazines/sites pour le ton visuel
    forbidden: string[]      // patterns visuels interdits (ceux qui crient "IA")
    components: string[]     // composants signature activés: 'lettrine' | 'pullQuote' | 'editorialFootnote' | 'tabularStat'
  }

  // Langue & i18n
  defaultLocale: string    // "fr"
  locales: string[]        // ["fr"] — ajouter "en" quand la traduction est prête

  // Technique
  vercelRegion: string     // "fra1"
  repo: string             // "org/repo"
  branch: string           // branche principale — PAS toujours "main" ! Le CMS l'utilise pour lire/écrire le contenu.
}

// ─── Valeurs par défaut (placeholder) ───────────────────────────────────
// Ces valeurs permettent au site de build avec un template vierge. Elles sont
// remplacées soit par Claude Code lors de l'intégration des outputs Claude Design,
// soit à la main lors d'un setup manuel.

export const niche: NicheConfig = {
  siteName: '10min-template',
  domain: 'example.com',
  tagline: 'Trouvez le bon choix en 10 minutes',

  entity: 'produit',
  entities: 'produits',
  entityVerb: 'choisir',
  dealWord: 'deals',

  heroPrefix: 'Choisir votre',
  heroSuffix: 'en 10 minutes',
  rotatingWords: ['produit'],
  subtitle: 'Comparateur indépendant, quiz personnalisé et simulateur — tout pour décider vite et bien.',
  ctaPrimary: { text: 'Comparer →', url: '/comparer' },
  ctaSecondary: { text: 'Quiz personnalisé', url: '/quiz' },

  categories: [],

  quiz: { enabled: true, question: '', criteria: [] },
  comparator: { enabled: true, criteria: [] },
  simulator: { enabled: true, title: '', description: '' },

  style: {
    mode: 'dark',
    hero: 'split',
    effects: 'aurora',
    cards: 'bordered',
    uiStyle: '',
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
  fonts: { display: 'Unbounded', body: 'Space Grotesk' },

  author: { name: '', slug: '', title: '', bio: '', tone: [], noGo: [], formulations: [] },

  logo: '10min·template',
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

  defaultLocale: 'fr',
  locales: ['fr'],

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
