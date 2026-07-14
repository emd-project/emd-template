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
 * │  • Assurance / Banque / Énergie / Télécom / Crédit / Casino → on vient     │
 * │    COMPARER une offre à souscrire → famille `comparateur`                  │
 * │    (⅔ `marche`, ⅓ `comparateur`).                                          │
 * │  • Beauté / Mode → magazine éditorial haut de gamme → famille `beaute`     │
 * │    (`presse`). La VARIÉTÉ vient de la palette + typo (seedées au domaine),  │
 * │    pas du layout : deux sites beauté partagent la structure mais pas la DA. │
 * │  • Voiture / Retail & Tech / Hospitality / autres → thématique éditoriale   │
 * │    → famille `editorial` (⅔ `magazine`, ⅓ `fil`).                           │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * La variante `presse` est une IDENTITÉ, pas seulement une home : quand elle est
 * active, le layout monte un masthead/footer éditoriaux (cf. `isPresse()`), et les
 * pages catégorie/article prennent leur rendu presse.
 */
import { niche } from '@/niche.config'

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

// ─── Famille de home, déduite du SECTEUR ────────────────────────────────────
export type HomeFamily = 'comparateur' | 'editorial' | 'beaute'

/** Secteurs « offre à souscrire » : on vient comparer des prix/conditions. */
const COMPARATEUR_KEYWORDS = [
  'assurance', 'banque', 'energie', 'énergie', 'telecom', 'télécom',
  'fournisseur', 'credit', 'crédit', 'pret', 'prêt', 'casino', 'paris',
  'mutuelle', 'abonnement',
]

/** Secteurs beauté / mode → identité magazine éditorial (`presse`). */
const BEAUTE_KEYWORDS = [
  'beauty', 'beaute', 'beauté', 'mode', 'cosmetique', 'cosmétique', 'maquillage',
  'parfum', 'soin', 'cheveux', 'coiffure', 'fashion',
]

/**
 * Famille de design à partir du secteur/catégorie de la niche
 * (colonne CATÉGORIE de `pipeline/sites.csv`, ou secteur de la spec).
 *  - « Beauty », « Mode » → 'beaute'   (→ `presse`)
 *  - « Assurance », « Banque », « Énergie », « Télécom », « Casino & Paris » → 'comparateur'
 *  - « Voiture », « Retailer & Tech », « Hospitality », … → 'editorial'
 * Défaut prudent : 'editorial' (une home magazine ne choque jamais ; un comparateur
 * plaqué sur une thématique éditoriale, si).
 */
export function homeFamily(sector: string | undefined | null): HomeFamily {
  const s = (sector ?? '').toLowerCase()
  if (BEAUTE_KEYWORDS.some((k) => s.includes(k))) return 'beaute'
  if (COMPARATEUR_KEYWORDS.some((k) => s.includes(k))) return 'comparateur'
  return 'editorial'
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

/**
 * Suggestion déterministe d'une combinaison complète.
 *
 * @param seed    domaine du site (fait diverger deux forks automatiquement)
 * @param family  `homeFamily(secteur)` — le SECTEUR décide de la famille, le SEED
 *                décide du design DANS la famille.
 */
export function suggestVariants(
  seed: string = niche.domain || niche.siteName,
  family: HomeFamily = 'editorial'
): {
  home: HomeVariant
  category: CategoryVariant
  shape: Shape
  border: Border
  shadow: Shadow
} {
  const h = seedHash(seed)
  const pool =
    family === 'comparateur' ? POOL_COMPARATEUR : family === 'beaute' ? POOL_BEAUTE : POOL_EDITORIAL
  const home = at(pool, h) as HomeVariant
  return {
    home,
    // L'identité presse impose ses propres pages catégorie.
    category: home === 'presse' ? 'presse' : at(['classic', 'editorial'] as const, h >>> 2),
    shape: at(['rounded', 'soft', 'sharp'] as const, h >>> 4),
    border: at(['hairline', 'standard', 'bold'] as const, h >>> 6),
    shadow: at(['flat', 'standard', 'deep'] as const, h >>> 8),
  }
}
