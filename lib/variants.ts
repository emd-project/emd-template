/**
 * lib/variants.ts — Résolution des variantes de design (système de variantes).
 *
 * Doctrine : RUNTIME BÊTE. Une seule source de vérité (niche.config), des
 * fallbacks gracieux, jamais de crash si un champ est absent. La SÉLECTION se fait
 * à l'INIT (suggestVariants écrit le choix dans niche.config), pas au runtime.
 *
 * DESIGNS DE HOME (cf. components/home/HomeRouter) :
 *  - `marche`      → MarcheHome  ⭐ (orbites/chips, ticker, tableau du marché, spotlight n°1)
 *  - `comparateur` → ComparateurHome (hero split + carte + steps + stats)
 *  - `magazine`    → MagazineHome
 *  - `fil`         → FilHome
 *  - `presse`      → PresseHome ✦ (identité ÉDITORIALE complète : masthead sérif centré,
 *                    nav catégories sticky, une + sections par catégorie + colonne « les plus
 *                    lus », et des vues blog/catégorie/article dédiées). Réservée BEAUTÉ & MODE.
 *
 * ┌─ CHOIX DU DESIGN : le SECTEUR d'abord, le seed ensuite ────────────────────┐
 * │  La FAMILLE vient de `classifyNiche` (lib/niche-classify.ts), qui tranche  │
 * │  sur le seul axe qui discrimine vraiment :                                │
 * │                                                                            │
 * │    l'entité est-elle un SERVICE SOUSCRIPTIBLE ou un OBJET acheté ailleurs ?│
 * │                                                                            │
 * │  • Assurance / Banque / Énergie / Télécom / Crédit / Casino → on vient     │
 * │    COMPARER une offre à souscrire → famille `comparateur`                  │
 * │    (⅔ `marche`, ⅓ `comparateur`).                                          │
 * │  • Beauté / Mode → magazine éditorial haut de gamme → famille `beaute`     │
 * │    (`presse`). La VARIÉTÉ vient de la palette + typo (seedées au domaine),  │
 * │    pas du layout : deux sites beauté partagent la structure mais pas la DA. │
 * │  • Voiture / Retail & Tech / Hospitality / autres → thématique éditoriale   │
 * │    → famille `editorial` (⅔ `magazine`, ⅓ `fil`).                           │
 * │                                                                            │
 * │  ⚠️ On ne classe PAS sur « la requête est-elle comparative ? » : presque    │
 * │  tous les domaines du réseau le sont (« meilleure-citadine »), ce critère   │
 * │  envoyait donc tout le monde sur la home comparateur. Cf. niche-classify.  │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * La variante `presse` est une IDENTITÉ, pas seulement une home : quand elle est
 * active, le layout monte un masthead/footer éditoriaux (cf. `isPresse()`), et les
 * pages catégorie/article prennent leur rendu presse.
 */
import { niche } from '@/niche.config'
import { classifyNiche, type HomeFamily } from '@/lib/niche-classify'

export type { HomeFamily }
export { classifyNiche, entityHead } from '@/lib/niche-classify'

// ─── Home ────────────────────────────────────────────────────────────────
export type HomeVariant = 'magazine' | 'comparateur' | 'marche' | 'fil' | 'presse'
export const HOME_VARIANTS: readonly HomeVariant[] = ['magazine', 'comparateur', 'marche', 'fil', 'presse']

export function resolveHomeVariant(): HomeVariant {
  const explicit = niche.layouts?.home
  if (explicit && HOME_VARIANTS.includes(explicit)) return explicit
  return niche.style.hero === 'split' ? 'comparateur' : 'magazine'
}

/**
 * L'identité ÉDITORIALE (presse) est-elle active ? Le layout `(site)` s'en sert pour
 * monter le masthead + footer presse à la place de la Nav/Footer standard.
 */
export function isPresse(): boolean {
  return resolveHomeVariant() === 'presse'
}

export const HOME_PREVIEW: Record<string, HomeVariant> = {
  'home-v1': 'magazine',
  'home-v2': 'comparateur',
  'home-v3': 'marche',
  'home-v4': 'fil',
  'home-v5': 'presse',
}

// ─── Catégorie ──────────────────────────────────────────────────────
export type CategoryVariant = 'classic' | 'editorial' | 'presse'
export const CATEGORY_VARIANTS: readonly CategoryVariant[] = ['classic', 'editorial', 'presse']

export function resolveCategoryVariant(): CategoryVariant {
  const explicit = niche.layouts?.category
  if (explicit && CATEGORY_VARIANTS.includes(explicit)) return explicit
  // L'identité presse impose ses pages catégorie.
  return isPresse() ? 'presse' : 'classic'
}

export const CATEGORY_PREVIEW: Record<string, CategoryVariant> = {
  'cat-v1': 'classic',
  'cat-v2': 'editorial',
  'cat-v3': 'presse',
}

// ─── Article ───────────────────────────────────────────────────────
export type ArticleVariant = 'classic' | 'presse'
export const ARTICLE_VARIANTS: readonly ArticleVariant[] = ['classic', 'presse']

export function resolveArticleVariant(): ArticleVariant {
  const explicit = niche.layouts?.article
  if (explicit && ARTICLE_VARIANTS.includes(explicit)) return explicit
  return isPresse() ? 'presse' : 'classic'
}

export const ARTICLE_PREVIEW: Record<string, ArticleVariant> = {
  'art-v1': 'classic',
  'art-v2': 'presse',
}

// ─── Permutations structurelles (anti-empreinte) ────────────────────────────
export type Shape = 'rounded' | 'soft' | 'sharp'
export type Border = 'hairline' | 'standard' | 'bold'
export type Shadow = 'flat' | 'standard' | 'deep'

export function resolveShape(): Shape {
  return niche.permutations?.shape ?? 'rounded'
}
export function resolveBorder(): Border {
  return niche.permutations?.border ?? 'standard'
}
export function resolveShadow(): Shadow {
  return niche.permutations?.shadow ?? 'standard'
}

// ─── Leviers de style tirés à l'init (niche.config.style) ───────────────────
/**
 * `style.effects` et `style.cards` sont deux vrais leviers de DA (halo/aurora du
 * hero, traitement des cartes) — mais ils n'étaient JAMAIS tirés : les 4 derniers
 * sites provisionnés sont tous sortis avec le défaut du template
 * (`subtle` + `bordered`). Ils font donc partie de la suggestion, au même titre
 * que shape/border/shadow. Les valeurs suivent EXACTEMENT le type de
 * `NicheConfig['style']`.
 */
export type Effects = 'aurora' | 'subtle' | 'none'
export type Cards = 'bordered' | 'filled' | 'minimal'

// ─── Famille de home ────────────────────────────────────────────────────────

/**
 * Famille de design à partir du secteur/catégorie de la niche
 * (colonne CATÉGORIE de `pipeline/sites.csv`, ou secteur de la spec).
 *
 * Délègue à `classifyNiche` : il n'existe qu'UNE logique de décision, testable
 * unitairement (cf. tests/unit/niche-classify.test.ts).
 */
export function homeFamily(sector: string | undefined | null): HomeFamily {
  return classifyNiche({ sector }).family
}

/**
 * Pools par famille. ⅔ / ⅓ (le 1er design est tiré 2× plus souvent).
 * `beaute` ne contient QUE `presse` : c'est une identité complète, et la variété
 * inter-sites y est portée par la **palette + la typo seedées sur le domaine**
 * (deux sites beauté = même structure, DA différente).
 */
const POOL_COMPARATEUR = ['marche', 'marche', 'comparateur'] as const
const POOL_EDITORIAL = ['magazine', 'magazine', 'fil'] as const
const POOL_BEAUTE = ['presse'] as const

// ─── Sélection AUTO déterministe (anti-empreinte) — à utiliser À L'INIT ──────
function seedHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function at<T>(arr: readonly T[], n: number): T {
  return arr[n % arr.length]
}

/** Dédoublonne en préservant l'ordre (les pools contiennent des doublons de pondération). */
function unique<T>(arr: readonly T[]): T[] {
  return arr.filter((v, i) => arr.indexOf(v) === i)
}

/** Combinaison complète suggérée pour un site (écrite dans `niche.config` à l'init). */
export type SuggestedVariants = {
  home: HomeVariant
  category: CategoryVariant
  shape: Shape
  border: Border
  shadow: Shadow
  /** → `niche.config.style.effects` (ne PAS laisser le défaut du template). */
  effects: Effects
  /** → `niche.config.style.cards` (ne PAS laisser le défaut du template). */
  cards: Cards
  family: HomeFamily
  /**
   * `true` quand `exclude.home` couvrait TOUT le pool de la famille : le tirage
   * initial est conservé (mieux vaut une home répétée qu'une home hors famille),
   * mais l'appelant doit le SAVOIR — c'est le signal qu'il faut faire diverger le
   * site autrement (palette, typo, permutations).
   */
  homeCollision: boolean
}

/**
 * Suggestion déterministe d'une combinaison complète.
 *
 * @param seed    domaine du site (fait diverger deux forks automatiquement)
 * @param family  famille de design. **OPTIONNEL** : omise, elle est DÉDUITE du
 *                seed via `classifyNiche`.
 * @param exclude homes déjà utilisées par les sites voisins (N-1, N-2, …).
 *                **OPTIONNEL**. Le pool `comparateur` n'a que DEUX homes
 *                distinctes pour cinq secteurs : re-saler le seed ne règle la
 *                collision qu'avec le site précédent. Passer ici la liste des
 *                homes à éviter donne une exclusion réelle.
 *
 * ⚠️ Historique : `family` valait `'editorial'` par défaut. Les deux skills
 * appelant `suggestVariants(niche.domain)` (un seul argument), la famille était
 * toujours `editorial` → `comparateur`, `marche` et `presse` étaient
 * INATTEIGNABLES par le chemin d'init nominal, quel que soit le secteur.
 * Le défaut est désormais dérivé du seed : le même appel devient correct.
 *
 * Quand le SECTEUR est connu (colonne CATÉGORIE de `sites.csv`), le passer
 * explicitement reste préférable — c'est la vérité terrain :
 *   suggestVariants(niche.domain, classifyNiche({ domain, sector }).family)
 *
 * Les DEUX derniers paramètres sont optionnels : `suggestVariants(domaine)` et
 * `suggestVariants(domaine, famille)` restent valides et rendent le même tirage.
 */
export function suggestVariants(
  seed: string = niche.domain || niche.siteName,
  family?: HomeFamily,
  exclude?: { home?: readonly string[] }
): SuggestedVariants {
  const fam = family ?? classifyNiche({ domain: seed, siteName: niche.siteName }).family
  const h = seedHash(seed)
  const pool: readonly HomeVariant[] =
    fam === 'comparateur' ? POOL_COMPARATEUR : fam === 'beaute' ? POOL_BEAUTE : POOL_EDITORIAL

  let home = at(pool, h)
  let homeCollision = false

  // Anti-répétition : re-tirage DANS le pool restant (et pas re-salage du seed,
  // qui peut retomber sur la même valeur — c'est le bug de collision N-2).
  const banned = exclude?.home ?? []
  if (banned.length > 0 && banned.includes(home)) {
    const remaining = unique(pool).filter((v) => !banned.includes(v))
    if (remaining.length > 0) {
      home = at(remaining, h >>> 14)
    } else {
      homeCollision = true
    }
  }

  return {
    home,
    // L'identité presse impose ses propres pages catégorie.
    category: home === 'presse' ? 'presse' : at(['classic', 'editorial'] as const, h >>> 2),
    shape: at(['rounded', 'soft', 'sharp'] as const, h >>> 4),
    border: at(['hairline', 'standard', 'bold'] as const, h >>> 6),
    shadow: at(['flat', 'standard', 'deep'] as const, h >>> 8),
    // Offsets DISTINCTS de shape/border/shadow : réutiliser >>>4 ou >>>6
    // corrélerait les effets aux rayons (tous les sites « sharp » en aurora).
    effects: at(['subtle', 'none', 'aurora'] as const, h >>> 10),
    cards: at(['bordered', 'filled', 'minimal'] as const, h >>> 12),
    family: fam,
    homeCollision,
  }
}
