/**
 * niche.config.ts — Configuration centrale du site.
 * C'est le SEUL fichier à remplir pour chaque nouveau site issu du template.
 *
 * Tous les composants, configs et pages dépendent de ce fichier. Ne pas hardcoder
 * de couleur, de font, de nom de site, de tagline dans le JSX — passer par ici.
 *
 * MODÈLE ÉCONOMIQUE : vente de MENTIONS. Aucune monétisation par lien sortant.
 * Les liens externes éventuels sont NEUTRES (source officielle / page de marque),
 * en `rel="noopener noreferrer nofollow"`, jamais monétisés.
 */

export type NicheConfig = {
  // Identité
  siteName: string
  domain: string
  tagline: string

  // Vocabulaire de la niche
  entity: string
  entities: string
  entityVerb: string
  dealWord: string
  /**
   * Genre grammatical de l'entité (`entity`/`entities`) — pilote TOUS les accords FR
   * (meilleur·e·s, Quel/Quelle, le/la, son/sa, tous/toutes, participes). OBLIGATOIRE.
   * Ex. « néobanque » → 'f' ; « opérateur » → 'm'. Cf. lib/utils/grammar.ts.
   */
  entityGender: 'm' | 'f'
  /** Genre de `dealWord` si différent (sinon repli sur `entityGender`). OPTIONNEL. */
  dealWordGender?: 'm' | 'f'

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
  /**
   * Page /deals — **DÉSACTIVÉE PAR DÉFAUT**.
   *
   * Le modèle EMD est la MENTION : aucune monétisation des liens sortants. Une page
   * « bons plans » n'a de sens que si la niche a de VRAIES offres factuelles (prix
   * courants sourcés et datés, liens NEUTRES vers la source officielle). Sans ça, on
   * ne livre pas une coquille vide : `enabled: false`, le lien disparaît de la nav et
   * les routes `/deals` (FR + EN) renvoient un 404.
   */
  deals?: {
    enabled: boolean
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

  // Signature DA anti-IA
  signature: {
    anchor: string
    oneRule: string
    inspiration: string[]
    forbidden: string[]
    components: string[]
  }

  // ─── i18n & marché (Bloc 0 d'init-site) ───────────────────────────
  market: 'BE' | 'FR' | 'CA' | 'CH' | string
  defaultLocale: string
  locales: string[]
  localePrefix?: 'as-needed' | 'always'

  // ─── Variantes de design & permutations (système de variantes) ──────────
  /**
   * Choix de variante par type de page. OPTIONNEL & RÉTRO-COMPATIBLE :
   * - `home` absent → resolver retombe sur `style.hero` (split→comparateur, sinon magazine).
   *
   * Home     : 'magazine' | 'comparateur' | 'marche' | 'fil' | 'presse'
   * Catégorie: 'classic' | 'editorial' | 'presse'
   * Article  : 'classic' | 'presse'
   * Preview  : /home-v1..v5 · /cat-v1..v3 · /art-v1..v2
   *
   * ⚠️ `presse` est une IDENTITÉ, pas une simple home : dès que `home: 'presse'`,
   * `isPresse()` bascule le layout (masthead + footer éditoriaux + PresseStyle) ET
   * les pages blog/catégorie/article prennent leur rendu presse.
   *
   * À l'init : suggestVariants(domaine, homeFamily(secteur)) propose une combinaison ;
   * Claude l'écrit ici puis dépublie les routes preview (cf. docs/AUTO-DESIGN.md).
   */
  layouts?: {
    home?: 'magazine' | 'comparateur' | 'marche' | 'fil' | 'presse'
    category?: 'classic' | 'editorial' | 'presse'
    article?: 'classic' | 'presse'
  }

  /**
   * Permutations structurelles légères (anti-empreinte). OPTIONNEL. Surchargent
   * uniquement des tokens via PermutationStyle (rien dans volteo.css) :
   *  - shape  : rayons (--radius-*)        'rounded' (défaut) | 'soft' | 'sharp'
   *  - border : bordures (--border*)        'standard' (défaut) | 'hairline' | 'bold'
   *  - shadow : ombres (--shadow-*)         'standard' (défaut) | 'flat' | 'deep'
   */
  permutations?: {
    shape?: 'rounded' | 'soft' | 'sharp'
    border?: 'hairline' | 'standard' | 'bold'
    shadow?: 'flat' | 'standard' | 'deep'
  }

  // Technique
  vercelRegion: string
  repo: string
  branch: string
}

// ─── Valeurs par défaut (placeholder) ──────────────────────────────
export const niche: NicheConfig = {
  siteName: 'emd-template',
  domain: 'example.com',
  tagline: 'Le comparateur indépendant de votre niche',

  entity: 'produit',
  entities: 'produits',
  entityVerb: 'choisir',
  dealWord: 'deals',
  entityGender: 'm', // « produit » = masculin (placeholder). À accorder au genre réel à l'init.

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
  // Modèle MENTION : page /deals désactivée par défaut.
  deals: { enabled: false },

  // Défaut = skin V1 Voltéo « Électrique » (clair) · archétype magazine (hero centered).
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
  homeSections: ['ticker', 'articles', 'categories', 'tools', 'author'],

  signature: {
    anchor: '',
    oneRule: '',
    inspiration: [],
    forbidden: [],
    components: [],
  },

  // Bloc 0 d'init-site — placeholders à remplacer impérativement
  market: 'BE',
  defaultLocale: 'fr',
  locales: ['fr', 'en'],
  localePrefix: 'as-needed',

  // Variantes & permutations : non définies par défaut → resolver retombe sur
  // style.hero (magazine) + shape/border/shadow 'standard'. L'init les renseigne
  // via suggestVariants(domaine, homeFamily(secteur)) pour faire diverger chaque fork.

  vercelRegion: 'fra1',
  repo: '',
  branch: 'main',
}

// ─── Helpers ───────────────────────────────────────────────────

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

/** True si la page /deals est activée (défaut : NON — modèle MENTION). */
export function dealsEnabled(): boolean {
  return niche.deals?.enabled === true
}

/**
 * Helper pour construire un chemin localisé respectant `localePrefix: 'as-needed'`.
 */
export function localePath(lang: string, path: string): string {
  if (lang === niche.defaultLocale) return path
  return `/${lang}${path === '/' ? '' : path}`
}
