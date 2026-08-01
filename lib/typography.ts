/**
 * lib/typography.ts — Pool TYPOGRAPHIQUE curé pour l'auto-DA à l'init.
 *
 * Pourquoi : le chemin par défaut n'exposait que ~4 combinaisons (les 4 skins Voltéo).
 * Ici : **51 paires** display+body, **toutes sur Google Fonts** (donc chargeables via next/font),
 * adaptées aux sites comparateur/magazine, et variées (grotesque / serif éditorial / géométrique /
 * humaniste / expressif). `suggestFonts(domaine)` en choisit une de façon **déterministe** (anti-empreinte).
 *
 * ┌─ POURQUOI 51 ET PLUS 16 ───────────────────────────────────────────────────┐
 * │ Relevé du parc au 01/08/2026, sur les imports next/font RÉELS de 18 sites : │
 * │   · Inter en body sur 6 sites                                              │
 * │   · Archivo × Inter sur 3 sites — tous secteur finance/énergie, tous en    │
 * │     home `comparateur` : même squelette + même typo = footprint            │
 * │   · 3 sites encore sur une police par défaut du template                   │
 * │                                                                            │
 * │ La cause n'était pas le hasard : le pool `comparateur` ne comptait que     │
 * │ **7 paires** pour la famille la plus peuplée du réseau (~10 sites). À dix  │
 * │ sites pour sept paires, la collision est ARITHMÉTIQUE. Les pools valent    │
 * │ désormais : comparateur 29 · marche 22 · magazine 33 · fil 21 · tout 50.   │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * IMPORTANT — next/font exige des imports STATIQUES : ce module ne charge PAS les fonts au runtime.
 * Il sert à l'INIT (et à la doc) pour CHOISIR une paire ; l'init réécrit ensuite `app/layout.tsx`
 * avec les imports next/font correspondants (nom Google → import : remplacer les espaces par `_`,
 * ex. « Source Sans 3 » → `Source_Sans_3`).
 *
 * ⚠️ `check-ui-guards.mjs` refuse **plus de 3 familles de polices** dans le repo (UI-13). Une paire
 * + une mono éventuelle tient dans le budget ; une troisième famille de texte, non.
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

/**
 * 51 paires curées, toutes Google Fonts, lisibles (AA) et « sérieuses » (pas de pixel/cyberpunk).
 * Toute paire ajoutée ici doit être vérifiée disponible sur fonts.google.com : un nom fantaisiste
 * casse le build au premier `next/font/google`.
 */
export const FONT_PAIRINGS: readonly FontPairing[] = [
  // ── Grotesques (13) ───────────────────────────────────────────────────────
  { id: 'bricolage', label: 'Bricolage × Hanken', display: 'Bricolage Grotesque', body: 'Hanken Grotesk', family: 'grotesque', mood: 'moderne, chaleureux (défaut V1 — exclu du tirage)' },
  { id: 'space-inter', label: 'Space Grotesk × Inter', display: 'Space Grotesk', body: 'Inter', family: 'grotesque', mood: 'tech, net, comparateur' },
  { id: 'archivo-inter', label: 'Archivo × Inter', display: 'Archivo', body: 'Inter', family: 'grotesque', mood: 'robuste, neutre, data' },
  { id: 'familjen-karla', label: 'Familjen Grotesk × Karla', display: 'Familjen Grotesk', body: 'Karla', family: 'grotesque', mood: 'nordique, sobre, sec' },
  { id: 'schibsted-source', label: 'Schibsted Grotesk × Source Sans 3', display: 'Schibsted Grotesk', body: 'Source Sans 3', family: 'grotesque', mood: 'presse scandinave, neutre chaud' },
  { id: 'chivo-mulish', label: 'Chivo × Mulish', display: 'Chivo', body: 'Mulish', family: 'grotesque', mood: 'journalistique, dense' },
  { id: 'barlowsc-figtree', label: 'Barlow Semi Condensed × Figtree', display: 'Barlow Semi Condensed', body: 'Figtree', family: 'grotesque', mood: 'condensé, technique, sportif' },
  { id: 'sairac-asap', label: 'Saira Condensed × Asap', display: 'Saira Condensed', body: 'Asap', family: 'grotesque', mood: 'titres serrés, industriel' },
  { id: 'darker-cabin', label: 'Darker Grotesque × Cabin', display: 'Darker Grotesque', body: 'Cabin', family: 'grotesque', mood: 'contrasté, éditorial léger' },
  { id: 'oswald-lato', label: 'Oswald × Lato', display: 'Oswald', body: 'Lato', family: 'grotesque', mood: 'affiche, presse populaire' },
  { id: 'franklin-lora', label: 'Libre Franklin × Lora', display: 'Libre Franklin', body: 'Lora', family: 'grotesque', mood: 'institutionnel, lecture posée' },
  { id: 'madefor-rubik', label: 'Wix Madefor Display × Rubik', display: 'Wix Madefor Display', body: 'Rubik', family: 'grotesque', mood: 'corporate net, sans froideur' },
  { id: 'anton-nunito', label: 'Anton × Nunito Sans', display: 'Anton', body: 'Nunito Sans', family: 'grotesque', mood: 'impact, magazine grand public' },

  // ── Serif éditorial (15) ──────────────────────────────────────────────────
  { id: 'fraunces-inter', label: 'Fraunces × Inter', display: 'Fraunces', body: 'Inter', family: 'serif-editorial', mood: 'éditorial chaud, caractère' },
  { id: 'newsreader-public', label: 'Newsreader × Public Sans', display: 'Newsreader', body: 'Public Sans', family: 'serif-editorial', mood: 'presse, magazine, fil' },
  { id: 'spectral-plex', label: 'Spectral × IBM Plex Sans', display: 'Spectral', body: 'IBM Plex Sans', family: 'serif-editorial', mood: 'lecture longue, sérieux' },
  { id: 'playfair-source', label: 'Playfair × Source Sans 3', display: 'Playfair Display', body: 'Source Sans 3', family: 'serif-editorial', mood: 'luxe, fort contraste' },
  { id: 'dmserif-dmsans', label: 'DM Serif × DM Sans', display: 'DM Serif Display', body: 'DM Sans', family: 'serif-editorial', mood: 'élégant, titres affirmés' },
  { id: 'crimson-inter', label: 'Crimson Pro × Inter', display: 'Crimson Pro', body: 'Inter', family: 'serif-editorial', mood: 'académique, sobre' },
  { id: 'zilla-public', label: 'Zilla Slab × Public Sans', display: 'Zilla Slab', body: 'Public Sans', family: 'serif-editorial', mood: 'mécane, technique assumé' },
  { id: 'lora-figtree', label: 'Lora × Figtree', display: 'Lora', body: 'Figtree', family: 'serif-editorial', mood: 'classique accessible' },
  { id: 'literata-karla', label: 'Literata × Karla', display: 'Literata', body: 'Karla', family: 'serif-editorial', mood: 'lecture écran, confortable' },
  { id: 'sourceserif-plex', label: 'Source Serif 4 × IBM Plex Sans', display: 'Source Serif 4', body: 'IBM Plex Sans', family: 'serif-editorial', mood: 'documentaire, institutionnel' },
  { id: 'bitter-work', label: 'Bitter × Work Sans', display: 'Bitter', body: 'Work Sans', family: 'serif-editorial', mood: 'slab lisible, robuste' },
  { id: 'petrona-jost', label: 'Petrona × Jost', display: 'Petrona', body: 'Jost', family: 'serif-editorial', mood: 'humaniste chaud × géométrique froid' },
  { id: 'frankruhl-assistant', label: 'Frank Ruhl Libre × Assistant', display: 'Frank Ruhl Libre', body: 'Assistant', family: 'serif-editorial', mood: 'quotidien, autorité calme' },
  { id: 'youngserif-epilogue', label: 'Young Serif × Epilogue', display: 'Young Serif', body: 'Epilogue', family: 'serif-editorial', mood: 'contemporain, gras assumé' },
  { id: 'domine-nunito', label: 'Domine × Nunito Sans', display: 'Domine', body: 'Nunito Sans', family: 'serif-editorial', mood: 'titres denses, corps doux' },

  // ── Géométriques (10) ─────────────────────────────────────────────────────
  { id: 'outfit-work', label: 'Outfit × Work Sans', display: 'Outfit', body: 'Work Sans', family: 'geometric', mood: 'géométrique, polyvalent' },
  { id: 'sora-hanken', label: 'Sora × Hanken', display: 'Sora', body: 'Hanken Grotesk', family: 'geometric', mood: 'premium, tech doux' },
  { id: 'manrope', label: 'Manrope (mono-famille)', display: 'Manrope', body: 'Manrope', family: 'geometric', mood: 'minimal, moderne' },
  { id: 'jost-mulish', label: 'Jost × Mulish', display: 'Jost', body: 'Mulish', family: 'geometric', mood: 'bauhaus, sec et clair' },
  { id: 'poppins-work', label: 'Poppins × Work Sans', display: 'Poppins', body: 'Work Sans', family: 'geometric', mood: 'rond, grand public' },
  { id: 'urbanist-inter', label: 'Urbanist × Inter', display: 'Urbanist', body: 'Inter', family: 'geometric', mood: 'contemporain, léger' },
  { id: 'montserrat-rubik', label: 'Montserrat × Rubik', display: 'Montserrat', body: 'Rubik', family: 'geometric', mood: 'urbain, large' },
  { id: 'redhat', label: 'Red Hat Display × Red Hat Text', display: 'Red Hat Display', body: 'Red Hat Text', family: 'geometric', mood: 'système cohérent, B2B' },
  { id: 'questrial-karla', label: 'Questrial × Karla', display: 'Questrial', body: 'Karla', family: 'geometric', mood: 'épuré, une seule graisse' },
  { id: 'raleway-lato', label: 'Raleway × Lato', display: 'Raleway', body: 'Lato', family: 'geometric', mood: 'élancé, classique du web' },

  // ── Humanistes (7) ────────────────────────────────────────────────────────
  { id: 'lexend-inter', label: 'Lexend × Inter', display: 'Lexend', body: 'Inter', family: 'humanist', mood: 'accessible, lisibilité max' },
  { id: 'jakarta', label: 'Plus Jakarta Sans (mono-famille)', display: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans', family: 'humanist', mood: 'SaaS, propre, B2B' },
  { id: 'fira-cabin', label: 'Fira Sans × Cabin', display: 'Fira Sans', body: 'Cabin', family: 'humanist', mood: 'ingénieur, chaleureux' },
  { id: 'bevietnam-nunito', label: 'Be Vietnam Pro × Nunito Sans', display: 'Be Vietnam Pro', body: 'Nunito Sans', family: 'humanist', mood: 'net, amical' },
  { id: 'signika-assistant', label: 'Signika × Assistant', display: 'Signika', body: 'Assistant', family: 'humanist', mood: 'signalétique, direct' },
  { id: 'epilogue-figtree', label: 'Epilogue × Figtree', display: 'Epilogue', body: 'Figtree', family: 'humanist', mood: 'moderne, un peu sec' },
  { id: 'archivonarrow-open', label: 'Archivo Narrow × Open Sans', display: 'Archivo Narrow', body: 'Open Sans', family: 'humanist', mood: 'compact, presse en ligne' },

  // ── Expressifs (6) ────────────────────────────────────────────────────────
  { id: 'syne-manrope', label: 'Syne × Manrope', display: 'Syne', body: 'Manrope', family: 'expressive', mood: 'créatif, marqué, mode' },
  { id: 'instrument', label: 'Instrument Serif × Instrument Sans', display: 'Instrument Serif', body: 'Instrument Sans', family: 'expressive', mood: 'éditorial moderne, chic' },
  { id: 'unbounded-hanken', label: 'Unbounded × Hanken', display: 'Unbounded', body: 'Hanken Grotesk', family: 'expressive', mood: 'affirmé, presque brutaliste' },
  { id: 'gloock-karla', label: 'Gloock × Karla', display: 'Gloock', body: 'Karla', family: 'expressive', mood: 'didone contemporain, luxe' },
  { id: 'bodoni-work', label: 'Bodoni Moda × Work Sans', display: 'Bodoni Moda', body: 'Work Sans', family: 'expressive', mood: 'mode, contraste extrême' },
  { id: 'prata-mulish', label: 'Prata × Mulish', display: 'Prata', body: 'Mulish', family: 'expressive', mood: 'haut de gamme, calme' },
]

/**
 * Paire CÂBLÉE dans `app/layout.tsx` du template (Bricolage Grotesque × Hanken Grotesk).
 *
 * ⛔ Elle est EXCLUE du tirage de `suggestFonts` : un site qui sort avec la typo du
 * template est indistinguable d'un fork non configuré — c'est le signal n°1 d'un
 * init qui n'a pas tourné, et c'est exactement ce que vérifie le garde-fou
 * « les fonts par défaut ont été remplacées » de `tests/unit/da-guards.test.ts`.
 *
 * Elle reste dans `FONT_PAIRINGS` (pool exporté = source de vérité documentaire,
 * potentiellement lue ailleurs) : le filtrage se fait AU TIRAGE, pas dans la liste.
 * Si une spec impose explicitement cette paire, elle gagne — mais alors c'est un
 * choix humain, pas un tirage.
 */
export const TEMPLATE_DEFAULT_PAIRING_ID = 'bricolage'

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

/** Comparaison de noms de familles tolérante à la casse et aux espaces parasites. */
function sameFamily(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export type SuggestedFonts = FontPairing & {
  /**
   * `true` quand `exclude.fonts` couvrait TOUT le pool de l'archetype : le tirage
   * non filtré est conservé (mieux vaut une typo répétée qu'un pool vide), mais
   * l'appelant doit le SAVOIR — c'est le signal qu'il faut faire diverger le site
   * autrement, ou élargir la fenêtre d'exclusion.
   */
  fontCollision: boolean
}

/**
 * Choix déterministe d'une paire à partir d'un seed (domaine), avec biais optionnel par archetype :
 * deux sites de domaines différents tombent sur des typos différentes (anti-empreinte), mais cohérentes
 * avec le type de home. Passé à l'INIT, qui écrit la paire choisie dans `app/layout.tsx`.
 *
 * @param seed    domaine du site (fait diverger deux forks automatiquement)
 * @param home    archetype de home (`comparateur` / `marche` / `magazine` / `fil`). Absent ou inconnu
 *                (`presse`) → tout le pool.
 * @param exclude polices déjà portées par les sites voisins. **OPTIONNEL, mais à passer à l'init.**
 *                Une paire est écartée si SON DISPLAY OU SON BODY figure dans la liste — c'est plus
 *                dur que d'exclure la paire entière, et c'est voulu : trois sites en « X × Inter »
 *                se ressemblent autant que trois sites sur la même paire exacte.
 *
 * La paire par défaut du template est retirée des candidats (cf. `TEMPLATE_DEFAULT_PAIRING_ID`).
 * Les pools restants ne sont JAMAIS vides : comparateur 29, marche 22, magazine 33, fil 21,
 * `presse`/archetype inconnu/absent → 50.
 *
 * Rétro-compatibilité : `suggestFonts(domaine)` et `suggestFonts(domaine, home)` rendent exactement
 * ce qu'ils rendaient — le troisième paramètre est optionnel et sans effet quand il est vide.
 *
 * Exemple à l'init (les N derniers sites de `pipeline/provisioned-log.csv`) :
 *   suggestFonts(niche.domain, v.home, { fonts: ['Inter', 'Archivo', 'Figtree', 'Fraunces'] })
 */
export function suggestFonts(
  seed: string = niche.domain || niche.siteName,
  home?: string,
  exclude?: { fonts?: readonly string[] }
): SuggestedFonts {
  const selectable = FONT_PAIRINGS.filter((p) => p.id !== TEMPLATE_DEFAULT_PAIRING_ID)
  const families = home ? FAMILY_BY_HOME[home] : undefined
  const pool = families && families.length
    ? selectable.filter((p) => families.includes(p.family))
    : selectable
  const list = pool.length ? pool : selectable

  const banned = exclude?.fonts ?? []
  let fontCollision = false
  let candidates = list

  if (banned.length > 0) {
    const filtered = list.filter(
      (p) => !banned.some((b) => sameFamily(b, p.display) || sameFamily(b, p.body))
    )
    if (filtered.length > 0) {
      candidates = filtered
    } else {
      // Pool épuisé : on garde le tirage non filtré plutôt que de sortir de la
      // famille, et on le SIGNALE. Un tirage silencieusement dégradé est pire
      // qu'une répétition assumée : personne ne va le chercher.
      fontCollision = true
    }
  }

  return { ...candidates[seedHash(seed) % candidates.length], fontCollision }
}