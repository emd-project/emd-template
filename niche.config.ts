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
  /**
   * Page /simulateur — **OPTIONNELLE, et DÉSACTIVÉE PAR DÉFAUT**.
   *
   * Le bloc entier peut être ABSENT : un `niche.config.ts` régénéré par l'init n'est
   * pas obligé de l'écrire, et le site doit compiler et fonctionner sans. Aucun accès
   * direct `niche.simulator.X` dans le repo : on passe par `simulatorEnabled()` pour
   * les conditions et par de l'optional chaining + repli pour les métadonnées.
   *
   * Le simulateur de cycles de prix ne tient que s'il existe de VRAIES données de
   * prix (sourcées et datées). Sans elles, la page n'affiche qu'un « Aucune donnée
   * de cycle de prix pour le moment » : une coquille vide annoncée dans la nav, le
   * footer et le sitemap. Tant que `enabled` est faux (ou le bloc absent), les routes
   * `/simulateur` (FR + EN) renvoient un 404 et le lien disparaît partout.
   *
   * `title` / `description` restent renseignables : ils pilotent les métadonnées le
   * jour où la niche active réellement le simulateur.
   */
  simulator?: {
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
    /**
     * TIRÉ par `suggestVariants` à l'init (champ `effects`) — ne pas laisser le
     * défaut du template : c'est la TRACE que la sélection auto a tourné.
     * LU par `resolveEffects()` depuis le 2026-08-17 : `PermutationStyle` en
     * dérive `--fx-aurora`, l'intensité des dégradés de globals.css.
     * `aurora` = l'état historique · `subtle` = atténué · `none` = zéro dégradé.
     */
    effects: 'aurora' | 'subtle' | 'none'
    /**
     * TIRÉ par `suggestVariants` à l'init (champ `cards`) — LU par
     * `resolveCards()` depuis le 2026-08-17 : `--card-bg` et
     * `--card-border-width`, consommés par globals.css et par le bloc « surface
     * de carte » de app/styles/da-site.css. `bordered` = l'état historique.
     */
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

  /**
   * Surcharges de CONFIGURATION par locale. OPTIONNEL, indexé par code de locale.
   *
   * POURQUOI CE MÉCANISME EN PLUS DE `tl()` — les deux ne traitent pas la même
   * matière et ne peuvent pas fusionner :
   *  - `tl(locale, clé)` (lib/i18n.ts) traduit les LIBELLÉS D'INTERFACE, un
   *    vocabulaire FERMÉ et identique pour tous les forks (« Comparer », « Voir
   *    tout », « min de lecture »). Il vit dans content/translations/[locale].json,
   *    versionné avec le moteur.
   *  - `localized` traduit le CONTENU DE CONFIGURATION, ouvert et propre à CHAQUE
   *    site : sa tagline, son H1, son sous-titre, ses catégories. Aucune de ces
   *    chaînes ne peut avoir de clé dans le moteur partagé — elles n'existent que
   *    dans ce fichier.
   * Mettre la tagline d'un fork dans en.json polluerait tous les autres forks ;
   * inventer une clé `tl()` par site rendrait le fichier de traductions dépendant
   * de la niche. D'où deux dimensions distinctes, qui se rejoignent seulement dans
   * le JSX.
   *
   * REPLI SILENCIEUX, ET C'EST LE CONTRAT : le bloc entier peut être ABSENT, une
   * locale peut manquer, un champ peut manquer ou être vide — dans tous ces cas on
   * rend la valeur de BASE, sans avertissement et sans chaîne vide. Un fork sans
   * traductions rend donc EXACTEMENT ce qu'il rendait avant l'existence de ce champ.
   * Ne jamais lire `niche.localized` directement : passer par lib/niche-l10n.ts
   * (`nicheL`, `categoryLabelL`, `categoriesL`, …), qui porte ce repli.
   *
   * La locale par défaut n'a RIEN à déclarer ici : elle lit la base directement.
   *
   * Ex. :
   *   localized: {
   *     en: {
   *       tagline: 'The independent comparison site for …',
   *       subtitle: '…',
   *       categories: { 'assurance-auto': 'Car insurance' },
   *     },
   *   }
   */
  localized?: {
    [locale: string]: {
      tagline?: string
      subtitle?: string
      heroPrefix?: string
      heroSuffix?: string
      rotatingWords?: string[]
      entity?: string
      entities?: string
      /**
       * Libellés de catégories indexés par SLUG — JAMAIS par position.
       * Par position, réordonner `categories` réaffecterait chaque traduction à la
       * catégorie voisine, en silence et sans erreur de compilation.
       * Une catégorie sans entrée garde son `label` de base.
       */
      categories?: Record<string, string>
      ctaPrimary?: { text?: string }
      ctaSecondary?: { text?: string }
    }
  }

  // ─── Variantes de design & permutations (système de variantes) ──────────
  /**
   * Choix de variante par type de page. OPTIONNEL & RÉTRO-COMPATIBLE :
   * - `home` absent → resolver retombe sur 'magazine' (cf. resolveHomeVariant).
   *
   * DEUX squelettes de home, et c'est tout (décision du 2026-08-02, cf.
   * lib/variants.ts) : `marche` pour les services souscriptibles, `magazine` pour
   * tout le reste — et pour le repli.
   *
   * Home     : 'magazine' | 'marche'
   * Catégorie: 'classic' | 'editorial'
   * Article  : 'classic'
   * Preview  : /home-v1..v2 · /cat-v1..v2 · /art-v1
   *
   * RETIRÉES le 2026-08-02 : `comparateur`, `fil`, et `presse`. Cette dernière
   * était une IDENTITÉ complète — masthead, pages catégorie et article dédiées —
   * maintenue pour un seul secteur ; `isPresse()` rend désormais toujours `false`
   * et les sites beauté prennent `magazine` comme les autres. Le type ne les
   * accepte plus : les écrire ici serait une erreur de compilation, pas un rendu
   * silencieusement retombé sur le défaut.
   *
   * À l'init : suggestVariants(domaine, homeFamily(secteur)) propose une combinaison ;
   * Claude l'écrit ici puis dépublie les routes preview (cf. docs/AUTO-DESIGN.md).
   */
  layouts?: {
    home?: 'magazine' | 'marche'
    category?: 'classic' | 'editorial'
    article?: 'classic'
  }

  /**
   * Permutations structurelles légères (anti-empreinte). OPTIONNEL. Surchargent
   * uniquement des tokens via PermutationStyle (rien dans volteo.css) :
   *  - shape  : rayons (--radius-*)        'rounded' (défaut) | 'soft' | 'sharp'
   *  - border : bordures (--border*)        'standard' (défaut) | 'hairline' | 'bold'
   *  - shadow : ombres (--shadow-*)         'standard' (défaut) | 'flat' | 'deep'
   *
   * Avec `style.effects` et `style.cards` (câblés le 2026-08-17), ce sont les leviers
   * de `suggestVariants` qui changent le rendu sans toucher la palette ou la typo
   * (cf. components/layout/PermutationStyle.tsx, qui émet les cinq).
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
  // Aucune donnée de cycle de prix par défaut : page /simulateur désactivée.
  simulator: { enabled: false, title: '', description: '' },
  // Modèle MENTION : page /deals désactivée par défaut.
  deals: { enabled: false },

  // Défaut = skin V1 Voltéo « Électrique » (clair) · archétype magazine (hero centered).
  style: {
    mode: 'light',
    hero: 'centered',
    // effects & cards : valeurs de TEMPLATE. L'init les remplace par le tirage de
    // suggestVariants(domaine, famille) — les 4 derniers sites provisionnés les
    // ont toutes deux gardées, faute d'être tirées. Elles pilotent le rendu depuis
    // le 2026-08-17 : `subtle` atténue réellement les dégradés du template.
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

  // `localized` : ABSENT par défaut, et c'est voulu. Tant qu'aucune traduction de
  // config n'est écrite, toutes les pages — FR comme EN — rendent la valeur de base.

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

/**
 * Map category slug → label, dans la locale par DÉFAUT.
 * Pour une autre locale, passer par `categoryLabelsL(locale)` (lib/niche-l10n.ts).
 */
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
 * True si la page /simulateur est activée (défaut : NON — aucune donnée de cycle
 * de prix dans le template, et le bloc `simulator` est OPTIONNEL). Les routes FR + EN
 * renvoient 404 quand c'est faux ; nav, footer et sitemap sont conditionnés au même flag.
 */
export function simulatorEnabled(): boolean {
  return niche.simulator?.enabled === true
}

/**
 * Helper pour construire un chemin localisé respectant `localePrefix: 'as-needed'`.
 */
export function localePath(lang: string, path: string): string {
  if (lang === niche.defaultLocale) return path
  return `/${lang}${path === '/' ? '' : path}`
}

/**
 * Slugs des pages légales PAR LOCALE.
 *
 * Les routes EN ne sont PAS la traduction littérale des FR : le repo expose
 * `app/en/legal-notice/` et `app/en/privacy/`, pas `/en/mentions-legales` ni
 * `/en/confidentialite`. Passer ces chemins par `localePath` produisait donc deux
 * 404 dans le footer de TOUTES les pages EN. Toute nouvelle locale doit ajouter
 * son entrée ici ET les routes correspondantes.
 */
const LEGAL_SLUGS: Record<string, { legalNotice: string; privacy: string }> = {
  fr: { legalNotice: 'mentions-legales', privacy: 'confidentialite' },
  en: { legalNotice: 'legal-notice', privacy: 'privacy' },
}

/**
 * Chemin localisé d'une page légale. Repli : locale demandée → locale par défaut → FR.
 *
 * ⚠️ Le repli porte sur le PRÉFIXE **ET** sur le SLUG. Une locale sans entrée
 * `LEGAL_SLUGS` n'a pas non plus de routes légales : renvoyer `/nl/confidentialite`
 * (préfixe d'une locale inconnue + slug FR) était un 404 garanti. On résout donc
 * d'abord UNE locale servable, puis on l'utilise pour les deux moitiés de l'URL.
 *
 * Ex. legalPath('en', 'privacy') → '/en/privacy' ; legalPath('fr', 'privacy') →
 * '/confidentialite' ; legalPath('nl', 'privacy') → '/confidentialite' (et non un 404).
 */
export function legalPath(lang: string, page: 'legalNotice' | 'privacy'): string {
  let resolved = lang
  if (!LEGAL_SLUGS[resolved]) resolved = niche.defaultLocale
  if (!LEGAL_SLUGS[resolved]) resolved = 'fr'
  const slugs = LEGAL_SLUGS[resolved] ?? LEGAL_SLUGS.fr
  return localePath(resolved, `/${slugs[page]}`)
}
