/**
 * lib/variants.ts — Résolution des variantes de design.
 *
 * ┌─ DEUX SQUELETTES, ET C'EST TOUT ──────────────────────────────────────────┐
 * │                                                                            │
 * │ Décision du 2026-08-02 : concevoir une home différente par site coûtait    │
 * │ plus de temps et de tokens que la différence n'en valait. Il reste DEUX    │
 * │ formes, et les sites divergent par la PEAU.                                │
 * │                                                                            │
 * │   • `marche`    → services souscriptibles (assurance, banque, énergie,      │
 * │                   télécom, crédit). Orbites de chips, ticker, tableau du    │
 * │                   marché, spotlight n°1. Référence : meilleur-abonnement-5g │
 * │   • `magazine`  → tout le reste. Mosaïque éditoriale décalée, bande de      │
 * │                   catégories. Référence : meilleure-voiture.be              │
 * │                                                                            │
 * │ La divergence passe désormais entièrement par : la palette (≥ 25° d'écart  │
 * │ de teinte avec les voisins), la typo (51 paires, exclusion glissante), les │
 * │ permutations shape/border/shadow, les leviers effects/cards (câblés le     │
 * │ 2026-08-17, cf. plus bas), et les 3 à 5 effets de `da-site.css`.           │
 * │                                                                            │
 * │ Deux sites de la même famille se ressembleront. C'est assumé : ça rachète  │
 * │ la partie la plus longue et la moins fiable d'un provisionnement.          │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * Retirées : `comparateur`, `fil`, et `presse`. Cette dernière était une
 * IDENTITÉ complète — masthead, pages catégorie et article dédiées — maintenue
 * pour un seul secteur. Les sites beauté prennent `magazine` comme les autres.
 *
 * `classifyNiche` n'est volontairement PAS touché : il rend toujours trois
 * familles, et ses tests passent inchangés. Seuls les pools ont changé.
 */
import { niche } from '@/niche.config'
import { classifyNiche, type HomeFamily } from '@/lib/niche-classify'

export type { HomeFamily }
export { classifyNiche, entityHead } from '@/lib/niche-classify'

// ─── Home ────────────────────────────────────────────────────────────────

export type HomeVariant = 'magazine' | 'marche'
export const HOME_VARIANTS: readonly HomeVariant[] = ['magazine', 'marche']

/**
 * Repli sur `magazine` : une home magazine ne choque jamais, un tableau de
 * marché plaqué sur une thématique éditoriale, si.
 */
export function resolveHomeVariant(): HomeVariant {
  const explicit = niche.layouts?.home as HomeVariant | undefined
  if (explicit && HOME_VARIANTS.includes(explicit)) return explicit
  return 'magazine'
}

/**
 * @deprecated L'identité `presse` a été retirée. Conservé pour ne pas casser
 * les imports existants (layout, resolvers) — rend toujours `false`.
 */
export function isPresse(): boolean {
  return false
}

export const HOME_PREVIEW: Record<string, HomeVariant> = {
  'home-v1': 'magazine',
  'home-v2': 'marche',
}

// ─── Catégorie ──────────────────────────────────────────────────────

export type CategoryVariant = 'classic' | 'editorial'
export const CATEGORY_VARIANTS: readonly CategoryVariant[] = ['classic', 'editorial']

export function resolveCategoryVariant(): CategoryVariant {
  const explicit = niche.layouts?.category as CategoryVariant | undefined
  if (explicit && CATEGORY_VARIANTS.includes(explicit)) return explicit
  return 'classic'
}

export const CATEGORY_PREVIEW: Record<string, CategoryVariant> = {
  'cat-v1': 'classic',
  'cat-v2': 'editorial',
}

// ─── Article ───────────────────────────────────────────────────────

export type ArticleVariant = 'classic'
export const ARTICLE_VARIANTS: readonly ArticleVariant[] = ['classic']

export function resolveArticleVariant(): ArticleVariant {
  return 'classic'
}

export const ARTICLE_PREVIEW: Record<string, ArticleVariant> = {
  'art-v1': 'classic',
}

// ─── Permutations structurelles — LA divergence, maintenant ─────────────────

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

/**
 * ÉTAT DU CÂBLAGE — `style.effects` et `style.cards` sont LUS depuis le 2026-08-17.
 *
 * `PermutationStyle` surcharge désormais cinq leviers, pas trois. Aux tokens de
 * shape/border/shadow s'ajoutent :
 *
 *   • effects → `--fx-aurora`, un token d'INTENSITÉ sans unité (1 · ~0,35 · 0) qui
 *     pilote l'opacité des dégradés déjà présents dans `app/globals.css` :
 *     `.article-hero-band`, `.comparateur-card-wrap`, `.text-gradient-hero`,
 *     `.nav-glass-active::before`. Ni position, ni taille, ni layout ne changent.
 *   • cards   → `--card-bg` et `--card-border-width`, deux tokens de SURFACE,
 *     consommés par `app/globals.css` (`.glass-card`, `.table-scroll-wrap`) et par
 *     le bloc « surface de carte » de `app/styles/da-site.css`.
 *
 * Les défauts REPRODUISENT le rendu historique : `aurora` et `bordered` n'émettent
 * aucun override. Un fork qui ne déclare rien — ou qui déclare ces deux valeurs —
 * rend exactement ce qu'il rendait avant. Seuls `subtle`, `none`, `filled` et
 * `minimal` changent quelque chose.
 *
 * `none` est le seul interrupteur qui sorte un site SANS AUCUN dégradé : c'est le
 * cliché n°1 d'une page générée, et il n'existait pas jusqu'ici.
 *
 * HORS PÉRIMÈTRE, à savoir avant d'espérer plus : les surfaces de carte des deux
 * homes et des pages catégorie vivent dans `app/styles/volteo*.css` via les alias
 * `--paper` et `--line`, que partagent aussi la nav collante (`.magnav`), les chips
 * et les inputs. Les remapper au niveau du token casserait ces surfaces, et ces
 * fichiers sont le système partagé de tous les forks. C'est donc `da-site.css`,
 * chargé en dernier et propre au site, qui consomme les tokens de carte sur ces
 * classes — jamais volteo.
 */
export type Effects = 'aurora' | 'subtle' | 'none'
export type Cards = 'bordered' | 'filled' | 'minimal'

export const EFFECTS_VARIANTS: readonly Effects[] = ['aurora', 'subtle', 'none']
export const CARDS_VARIANTS: readonly Cards[] = ['bordered', 'filled', 'minimal']

/**
 * Défaut `aurora` = ce que le CSS rendait avant le câblage. Une valeur hors pool
 * retombe dessus : `PermutationStyle` indexe un Record avec ce résultat et
 * l'injecte dans un <style>, on ne lui passe donc que du vocabulaire connu.
 */
export function resolveEffects(): Effects {
  const explicit = niche.style?.effects as Effects | undefined
  if (explicit && EFFECTS_VARIANTS.includes(explicit)) return explicit
  return 'aurora'
}

/** Défaut `bordered` : filet visible et fond de carte inchangés. */
export function resolveCards(): Cards {
  const explicit = niche.style?.cards as Cards | undefined
  if (explicit && CARDS_VARIANTS.includes(explicit)) return explicit
  return 'bordered'
}

// ─── Famille ────────────────────────────────────────────────────────────────

export function homeFamily(sector: string | undefined | null): HomeFamily {
  return classifyNiche({ sector }).family
}

/**
 * Un seul squelette par famille. Les pools ne servent plus qu'à router :
 * service souscriptible → `marche`, tout le reste → `magazine`.
 */
const POOL_COMPARATEUR = ['marche'] as const
const POOL_EDITORIAL = ['magazine'] as const
const POOL_BEAUTE = ['magazine'] as const

// ─── Sélection déterministe — à utiliser À L'INIT ───────────────────────────

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
function unique<T>(arr: readonly T[]): T[] {
  return arr.filter((v, i) => arr.indexOf(v) === i)
}

export type SuggestedVariants = {
  home: HomeVariant
  category: CategoryVariant
  shape: Shape
  border: Border
  shadow: Shadow
  effects: Effects
  cards: Cards
  family: HomeFamily
  /**
   * Avec un seul squelette par famille, exclure ce squelette épuise le pool :
   * `homeCollision` passe à `true` et le tirage est conservé. C'est le
   * comportement attendu, pas un défaut — la home d'un site ne diverge plus,
   * c'est la peau qui s'en charge.
   */
  homeCollision: boolean
}

/**
 * Suggestion déterministe d'une combinaison complète.
 *
 * @param seed    domaine du site (fait diverger deux forks)
 * @param family  famille de design. Omise, elle est déduite du seed.
 * @param exclude homes des sites voisins. **Sans effet utile désormais** : un
 *                pool d'un seul élément ne peut pas éviter une répétition. Le
 *                paramètre est conservé pour la compatibilité des appels, et
 *                signale la collision au lieu de la corriger.
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
    category: at(['classic', 'editorial'] as const, h >>> 2),
    shape: at(['rounded', 'soft', 'sharp'] as const, h >>> 4),
    border: at(['hairline', 'standard', 'bold'] as const, h >>> 6),
    shadow: at(['flat', 'standard', 'deep'] as const, h >>> 8),
    // Offsets DISTINCTS : réutiliser >>>4 ou >>>6 corrélerait les effets aux
    // rayons (tous les sites « sharp » en aurora).
    effects: at(['subtle', 'none', 'aurora'] as const, h >>> 10),
    cards: at(['bordered', 'filled', 'minimal'] as const, h >>> 12),
    family: fam,
    homeCollision,
  }
}
