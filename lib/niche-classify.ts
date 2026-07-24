/**
 * lib/niche-classify.ts — De quel TYPE est ce site ? (famille de design)
 *
 * ┌─ POURQUOI CE FICHIER ─────────────────────────────────────────────────────┐
 * │ La règle d'origine vivait en langue naturelle dans `docs/AUTO-DESIGN.md` : │
 * │   « intent transactionnel / comparatif → comparateur »                     │
 * │ Elle est FAUSSE en pratique. Presque tous les domaines du réseau sont      │
 * │ comparatifs (« meilleure-citadine », « comparatif-aspirateur »…), donc la  │
 * │ règle envoyait TOUT LE MONDE sur la home comparateur — y compris les sites │
 * │ produit qui doivent partir en magazine.                                    │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * Le bon axe n'est pas « la requête est-elle comparative ? » mais :
 *
 *   Peut-on SOUSCRIRE l'entité en ligne, ou est-ce un OBJET qu'on achète ailleurs ?
 *
 *   • service souscriptible (assurance, banque, énergie, télécom, casino…)
 *       → l'internaute veut CHANGER DE FOURNISSEUR        → `comparateur`
 *         (tableau de prix, offres en direct : ça a du sens)
 *   • produit physique (citadine, aspirateur, tondeuse, TV…)
 *       → l'internaute veut COMPRENDRE avant d'acheter ailleurs → `editorial`
 *         (un ticker de prix en direct n'a aucun sens ici)
 *   • beauté / mode → `beaute` (identité presse)
 *
 * ── Pourquoi on TOKENISE (et pas `String.includes`) ─────────────────────────
 * L'ancien matching par sous-chaîne produisait de vrais faux positifs :
 *   « meilleur-hotel-paris »  → contient `paris` (paris sportifs) → comparateur ✗
 *   « soins-palliatifs »      → contient `soin`                   → beaute      ✗
 * Ici : on découpe en tokens, on retire les modificateurs SEO, on retire les
 * accents, et on PONDÈRE le premier token de contenu ×2 — en français la tête
 * du groupe nominal vient en premier :
 *   « assurance auto »     → tête = assurance (service)  → comparateur ✓
 *   « meilleure citadine » → tête = citadine  (objet)    → editorial   ✓
 *
 * Fonction PURE : n'importe pas `niche.config`, donc testable unitairement et
 * utilisable par un script d'init avant même que la config existe.
 */

export type HomeFamily = 'comparateur' | 'editorial' | 'beaute'

export type Confidence = 'high' | 'medium' | 'low'

export type Classification = {
  /** Famille de design retenue. */
  family: HomeFamily
  /** Entité nue extraite du domaine (« meilleure-citadine.be » → « citadine »). */
  head: string
  confidence: Confidence
  /** Explication lisible — à logger par l'init (jamais de choix silencieux). */
  reason: string
  /**
   * Renseigné quand le SECTEUR et le DOMAINE ne tombent pas d'accord.
   * Le secteur gagne (vérité terrain), mais le désaccord doit être SURFACÉ :
   * c'est presque toujours le signe d'un mauvais libellé dans `sites.csv`.
   */
  conflict?: { fromSector: HomeFamily; fromDomain: HomeFamily }
}

// ─── Normalisation ──────────────────────────────────────────────────────────

/** Retire les diacritiques : « énergie » → « energie ». */
function deaccent(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Modificateurs de REQUÊTE : du bruit pour la classification.
 * C'est exactement ce que l'ancienne règle prenait pour un signal.
 */
const MODIFIERS = new Set([
  // superlatifs / comparatifs
  'meilleur', 'meilleure', 'meilleurs', 'meilleures', 'best', 'top', 'classement',
  'palmares', 'comparateur', 'comparatif', 'comparatifs', 'comparaison', 'compare',
  'comparer', 'versus', 'vs',
  // intention / outil
  'guide', 'guides', 'avis', 'test', 'tests', 'essai', 'essais', 'choisir', 'choix',
  'quel', 'quelle', 'quels', 'quelles', 'simulateur', 'simulation', 'calculateur',
  'calcul', 'estimation', 'devis',
  // prix
  'prix', 'tarif', 'tarifs', 'cout', 'promo', 'promos', 'bon', 'bons', 'plan',
  'plans', 'pas', 'cher', 'discount', 'reduction',
  // articles & liaisons
  'le', 'la', 'les', 'l', 'du', 'de', 'des', 'd', 'un', 'une', 'au', 'aux', 'en',
  'et', 'ou', 'pour', 'sur', 'mon', 'ma', 'mes', 'votre', 'vos', 'ton', 'ta', 'the',
  // génériques web / éditoriaux
  'site', 'web', 'online', 'info', 'infos', 'news', 'blog', 'mag', 'magazine',
  'portail', 'expert', 'experts', 'pro', 'plus', 'now', 'fr', 'be', 'ch', 'ca', 'eu',
])

/** Découpe un libellé en tokens de CONTENU (modificateurs et bruit retirés). */
function contentTokens(raw: string): string[] {
  return deaccent(raw.toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !MODIFIERS.has(t) && !/^\d+$/.test(t))
}

/**
 * Entité nue d'un domaine — utile aussi pour dériver `niche.entity`.
 *   « meilleure-citadine.be »        → « citadine »
 *   « comparateur-assurance-auto.fr »→ « assurance auto »
 * Repli sur `siteName` si le domaine ne contient que des modificateurs.
 */
export function entityHead(domain: string, siteName?: string): string {
  const bare = (domain || '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/\.[a-z]{2,6}$/i, '')
  const toks = contentTokens(bare)
  if (toks.length) return toks.join(' ')
  const fallback = contentTokens(siteName || '')
  return fallback.join(' ')
}

// ─── Lexiques ───────────────────────────────────────────────────────────────
// Tous les mots sont SANS ACCENT (la normalisation les retire avant comparaison).

/** Services SOUSCRIPTIBLES en ligne : on vient changer de fournisseur. */
const SOUSCRIPTIBLE = new Set([
  // assurance & prévoyance
  'assurance', 'assurances', 'assureur', 'assureurs', 'mutuelle', 'mutuelles',
  'prevoyance', 'complementaire',
  // banque & finance
  'banque', 'banques', 'neobanque', 'neobanques', 'credit', 'credits', 'pret',
  'prets', 'hypotheque', 'hypothecaire', 'emprunt', 'leasing', 'financement',
  'epargne', 'placement', 'placements', 'bourse', 'courtier', 'courtage',
  'retraite', 'pension',
  // énergie
  'energie', 'energies', 'electricite', 'gaz', 'fournisseur', 'fournisseurs',
  // télécom & web
  'telecom', 'telecoms', 'operateur', 'operateurs', 'forfait', 'forfaits',
  'abonnement', 'abonnements', 'internet', 'fibre', 'adsl',
  'vpn', 'hebergeur', 'hebergeurs', 'hosting', 'streaming',
  // jeux
  'casino', 'casinos', 'paris', 'bookmaker', 'bookmakers', 'poker', 'betting',
])

/** Beauté & mode → identité presse. */
const BEAUTE = new Set([
  'beaute', 'beauty', 'cosmetique', 'cosmetiques', 'maquillage', 'parfum',
  'parfums', 'soin', 'soins', 'creme', 'cremes', 'serum', 'cheveux', 'coiffure',
  'coiffeur', 'ongle', 'ongles', 'manucure', 'peau', 'skincare',
  'mode', 'fashion', 'vetement', 'vetements', 'lingerie', 'chaussure',
  'chaussures', 'bijou', 'bijoux', 'dressing', 'tendance', 'tendances', 'style',
])

/**
 * Produits PHYSIQUES / thématiques éditoriales : on achète (ou on lit) ailleurs.
 * Listés explicitement — pas seulement en repli — pour NEUTRALISER les faux
 * positifs (« assurance auto » contient `auto`, « hotel paris » contient `paris`).
 */
const EDITORIAL = new Set([
  // auto & mobilité
  'voiture', 'voitures', 'citadine', 'citadines', 'suv', 'berline', 'berlines',
  'break', 'monospace', 'cabriolet', 'auto', 'autos', 'automobile', 'automobiles',
  'moto', 'motos', 'scooter', 'velo', 'velos', 'vtt', 'trottinette', 'camion',
  'utilitaire', 'caravane',
  // électroménager & maison
  'aspirateur', 'aspirateurs', 'tondeuse', 'tondeuses', 'robot', 'robots',
  'lave', 'linge', 'vaisselle', 'frigo', 'refrigerateur', 'congelateur', 'four',
  'micro', 'ondes', 'cafetiere', 'bouilloire', 'friteuse', 'airfryer',
  'barbecue', 'plancha', 'aspirateurs', 'machine', 'machines',
  // tech & image
  'tv', 'televiseur', 'televiseurs', 'ordinateur', 'ordinateurs', 'laptop',
  'smartphone', 'smartphones', 'telephone', 'tablette', 'tablettes', 'casque',
  'casques', 'ecouteur', 'ecouteurs', 'enceinte', 'enceintes', 'imprimante',
  'ecran', 'ecrans', 'souris', 'clavier', 'console', 'consoles', 'jeu', 'jeux',
  'appareil', 'photo', 'drone', 'drones', 'montre', 'montres',
  // mobilier & extérieur
  'matelas', 'canape', 'meuble', 'meubles', 'lit', 'table', 'chaise', 'bureau',
  'piscine', 'piscines', 'spa', 'jacuzzi', 'jardin', 'jardinage', 'bricolage',
  'outil', 'outils', 'perceuse',
  // famille
  'poussette', 'poussettes', 'siege', 'jouet', 'jouets', 'bebe',
  // hospitality & voyage
  'hotel', 'hotels', 'restaurant', 'restaurants', 'voyage', 'voyages',
  'destination', 'destinations', 'sejour', 'camping', 'gite', 'chambre',
])

const LEXICONS: ReadonlyArray<{ family: HomeFamily; words: ReadonlySet<string> }> = [
  { family: 'comparateur', words: SOUSCRIPTIBLE },
  { family: 'beaute', words: BEAUTE },
  { family: 'editorial', words: EDITORIAL },
]

// ─── Scoring ────────────────────────────────────────────────────────────────

type Scores = Record<HomeFamily, number>

/** Score une liste de tokens. Le PREMIER token de contenu pèse double (tête FR). */
function score(tokens: readonly string[]): { scores: Scores; hits: string[] } {
  const scores: Scores = { comparateur: 0, editorial: 0, beaute: 0 }
  const hits: string[] = []
  tokens.forEach((tok, i) => {
    const weight = i === 0 ? 2 : 1
    for (const lex of LEXICONS) {
      if (lex.words.has(tok)) {
        scores[lex.family] += weight
        hits.push(`${tok}→${lex.family}`)
        break // un token ne compte que pour UNE famille
      }
    }
  })
  return { scores, hits }
}

/** Famille gagnante d'un jeu de scores. Égalité ou zéro → `editorial` (prudent). */
function winner(scores: Scores): { family: HomeFamily; top: number; runnerUp: number } {
  const ranked = (Object.keys(scores) as HomeFamily[])
    .map((f) => ({ f, n: scores[f] }))
    .sort((a, b) => b.n - a.n)
  const [first, second] = ranked
  // Défaut prudent : une home magazine ne choque jamais ; un comparateur plaqué
  // sur une thématique éditoriale, si.
  if (first.n === 0 || first.n === second.n) {
    return { family: 'editorial', top: first.n, runnerUp: second.n }
  }
  return { family: first.f, top: first.n, runnerUp: second.n }
}

function confidenceOf(top: number, runnerUp: number): Confidence {
  if (top === 0) return 'low'
  if (runnerUp === 0) return 'high'
  return top >= runnerUp * 2 ? 'high' : 'medium'
}

// ─── API ────────────────────────────────────────────────────────────────────

export type ClassifyInput = {
  /** Domaine du site (avec ou sans protocole / www / TLD). */
  domain?: string
  /** Nom du site — repli quand le domaine n'est que des modificateurs. */
  siteName?: string
  /**
   * Secteur (colonne CATÉGORIE de `pipeline/sites.csv`, ou secteur de la spec).
   * VÉRITÉ TERRAIN : quand il est fourni, il gagne. Le domaine sert alors de
   * contre-expertise et lève un `conflict` en cas de désaccord.
   */
  sector?: string | null
}

/**
 * Décide la famille de design d'un site.
 *
 * Ordre de décision :
 *  1. `sector` fourni → il fait foi (et on compare au domaine pour détecter
 *     un libellé douteux dans `sites.csv`) ;
 *  2. sinon, scoring des tokens du domaine (puis du `siteName`) ;
 *  3. sinon `editorial` — défaut prudent, confiance `low` (à surfacer).
 */
export function classifyNiche(input: ClassifyInput): Classification {
  const head = entityHead(input.domain ?? '', input.siteName)
  const domainTokens = head ? head.split(' ') : []
  const fromDomain = score(domainTokens)
  const domainWin = winner(fromDomain.scores)

  const sectorRaw = (input.sector ?? '').trim()
  if (sectorRaw) {
    const sectorScored = score(contentTokens(sectorRaw))
    const sectorWin = winner(sectorScored.scores)
    const conflict =
      domainWin.top > 0 && sectorWin.family !== domainWin.family
        ? { fromSector: sectorWin.family, fromDomain: domainWin.family }
        : undefined
    return {
      family: sectorWin.family,
      head,
      confidence: confidenceOf(sectorWin.top, sectorWin.runnerUp),
      reason: conflict
        ? `secteur « ${sectorRaw} » → ${sectorWin.family} (le secteur fait foi) ; ` +
          `le domaine « ${head} » suggérait ${domainWin.family} — VÉRIFIER le libellé du secteur`
        : `secteur « ${sectorRaw} » → ${sectorWin.family}`,
      ...(conflict ? { conflict } : {}),
    }
  }

  if (domainWin.top === 0) {
    return {
      family: 'editorial',
      head,
      confidence: 'low',
      reason:
        `aucun mot-clé reconnu dans « ${head || input.domain || '?'} » → défaut prudent ` +
        `editorial (magazine). Renseigner le secteur pour trancher.`,
    }
  }

  return {
    family: domainWin.family,
    head,
    confidence: confidenceOf(domainWin.top, domainWin.runnerUp),
    reason: `domaine « ${head} » → ${domainWin.family} [${fromDomain.hits.join(', ')}]`,
  }
}

/**
 * Compat — ancienne signature `homeFamily(secteur)` (cf. CLAUDE.md).
 * Délègue au classifieur pour qu'il n'existe qu'UNE logique de décision.
 */
export function homeFamily(sector: string | undefined | null): HomeFamily {
  return classifyNiche({ sector }).family
}
