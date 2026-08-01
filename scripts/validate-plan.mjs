#!/usr/bin/env node
/**
 * scripts/validate-plan.mjs — LA PORTE DE LA PHASE 1.
 *
 * `content/site-plan.json` est le contrat que `seo-architect` écrit et que
 * `builder` implémente. Ce script est ce qui empêche de passer à la phase
 * suivante avec un plan incohérent.
 *
 * Pourquoi il existe : l'anti-cannibalisation, le plancher de questions, la
 * parité des locales et le modèle mention vivaient dans un `.md` de 21 000
 * caractères que l'agent devait appliquer de mémoire. Ils n'étaient donc
 * appliqués que lorsqu'on y pensait. Le relevé du parc au 01/08/2026 le
 * montre sans ambiguïté : trois sites jamais journalisés, quatre leviers de DA
 * morts pendant quatre sites, une typo par défaut sur trois sites malgré un
 * garde-fou déclaratif qui l'interdisait.
 *
 * Usage :
 *   node scripts/validate-plan.mjs content/site-plan.json
 *   node scripts/validate-plan.mjs content/site-plan.json --init
 *   node scripts/validate-plan.mjs content/site-plan.json --warn-only
 *
 * `--init` ajoute le contrôle de budget d'amorçage (PLAN-09b) : le nombre
 * d'articles en `seed` doit égaler `budget.seedArticles`. Il devient faux dès
 * la première publication quotidienne — ne l'utiliser QU'à l'init.
 *
 * ⛔ NE JAMAIS assouplir une règle pour faire passer un run. Si une règle
 * bloque à tort, c'est la règle qu'on discute, séparément, avec le cas qui le
 * justifie. Un garde-fou qu'on plie sous la pression d'une échéance ne vaut
 * plus rien pour aucun site.
 *
 * Node pur — aucune dépendance externe. Les contrôles de forme sont écrits ici
 * plutôt que délégués à ajv : `schemas/site-plan.schema.json` documente la
 * même forme pour les éditeurs, ce script fait foi à l'exécution.
 */

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const file = args.find((a) => !a.startsWith('--')) ?? 'content/site-plan.json'
const IS_INIT = args.includes('--init')
const WARN_ONLY = args.includes('--warn-only')

const errors = []
const warnings = []
const fail = (rule, where, msg) => errors.push({ rule, where, msg })
const warn = (rule, where, msg) => warnings.push({ rule, where, msg })

// ─── Chargement ───────────────────────────────────────────────

const abs = path.resolve(process.cwd(), file)
if (!fs.existsSync(abs)) {
  console.error(`\nvalidate-plan — fichier introuvable : ${file}\n`)
  process.exit(1)
}

let plan
try {
  plan = JSON.parse(fs.readFileSync(abs, 'utf-8'))
} catch (e) {
  console.error(`\nvalidate-plan — JSON invalide dans ${file} :\n  ${e.message}\n`)
  process.exit(1)
}

// ─── Outils ───────────────────────────────────────────────────

/**
 * Normalisation d'une requête pour la comparaison d'unicité.
 * « Les Meilleures Néobanques  » et « meilleures neobanques » sont LA MÊME
 * requête : c'est exactement le doublon qu'on cherche à attraper, pas celui
 * que deux agents écriraient à la casse près.
 */
const norm = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    // L'article defini initial ne distingue pas deux requetes : « les meilleurs
    // SUV » et « meilleurs SUV » sont LA MEME requete, et sans ce retrait deux
    // pages peuvent legitimement les revendiquer chacune. Trou trouve au premier
    // essai du validateur — c'est exactement le genre de doublon qui passe.
    .replace(/^(les|le|la|l)\s+/, '')

const isArr = (v) => Array.isArray(v)
const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const isInt = (v) => Number.isInteger(v)

const ASSET_TYPES = ['classement', 'comparateur', 'choisir', 'quiz', 'simulateur', 'blog-categorie', 'page', 'custom']
const STATUSES = ['seed', 'planned', 'disabled']
const INTENTS = ['informational', 'commercial', 'transactional', 'navigational', 'comparative']
const KEYWORD_SOURCES = ['keyword_ideas', 'ranked_keywords', 'gsc', 'manual']
const ARTICLE_TYPES = ['comparatif', 'face-a-face', 'info']

/** Types d'assets qui n'ont pas vocation à porter des enfants. */
const TERMINAL_TYPES = ['page', 'custom', 'blog-categorie']

const clusters = isArr(plan.clusters) ? plan.clusters : []
const assets = isArr(plan.assets) ? plan.assets : []
const articles = isArr(plan.articles) ? plan.articles : []
const locales = plan?.market?.locales ?? []
const primary = plan?.market?.primaryLocale
const secondaries = locales.filter((l) => l !== primary)

// ═══ PLAN-00 — forme ═══════════════════════════════════════════

if (plan.schemaVersion !== '1.0') fail('PLAN-00', 'schemaVersion', `attendu "1.0", reçu ${JSON.stringify(plan.schemaVersion)}`)
for (const k of ['site', 'market', 'budget']) {
  if (!plan[k] || typeof plan[k] !== 'object') fail('PLAN-00', k, 'bloc requis absent')
}
if (!isStr(plan?.site?.domain)) fail('PLAN-00', 'site.domain', 'requis')
if (!isStr(plan?.site?.sector)) fail('PLAN-00', 'site.sector', 'requis')
if (!isStr(plan?.site?.positioning)) fail('PLAN-00', 'site.positioning', "l'angle éditorial en une phrase est requis — il conditionne la DA et la voix")
if (!isStr(primary)) fail('PLAN-00', 'market.primaryLocale', 'requis')
if (!isArr(locales) || locales.length === 0) fail('PLAN-00', 'market.locales', 'au moins une locale')
if (isArr(locales) && isStr(primary) && !locales.includes(primary)) fail('PLAN-00', 'market.locales', `ne contient pas primaryLocale « ${primary} »`)
if (clusters.length === 0) fail('PLAN-00', 'clusters', 'au moins un cluster')
if (assets.length === 0) fail('PLAN-00', 'assets', 'au moins un asset')

const clusterIds = new Set(clusters.map((c) => c?.id).filter(isStr))
const assetSlugs = new Set(assets.map((a) => a?.slug).filter(isStr))
const blogCats = new Set(assets.filter((a) => a?.type === 'blog-categorie' && isStr(a?.slug)).map((a) => a.slug))

// ═══ PLAN-01 — unicité des requêtes ════════════════════════════
// LA règle. Chaque requête exacte n'appartient qu'à UN propriétaire.

{
  const owner = new Map()
  const register = (q, where) => {
    const k = norm(q)
    if (!k) return
    if (owner.has(k)) {
      fail('PLAN-01', where, `requête « ${q} » déjà revendiquée par ${owner.get(k)} — deux pages sur la même requête se cannibalisent`)
    } else {
      owner.set(k, where)
    }
  }
  for (const a of assets) {
    if (a?.status === 'disabled') continue
    for (const q of a?.owns ?? []) register(q, `asset:${a?.slug ?? '?'}`)
  }
  for (const ar of articles) {
    for (const q of ar?.owns ?? []) register(q, `article:${ar?.slug ?? '?'}`)
  }
}

// ═══ PLAN-02 — le head nu appartient au classement ═════════════

{
  const HEAD = /^(le|la|les)?\s*(meilleur\w*|top\s*\d*|classement|palmares|comparatif)\b/
  // Un qualificatif transforme un head nu en longue traîne légitime :
  // « meilleurs SUV » appartient au classement, « meilleurs SUV pour familles
  // nombreuses » appartient au blog. C'est toute la frontière.
  const QUALIFIER = /\b(pour|vs|contre|avec|sans|selon|par|en \d{4}|moins de|plus de|si |quand|ou)\b/

  for (const ar of articles) {
    for (const q of ar?.owns ?? []) {
      const n = norm(q)
      if (HEAD.test(n) && !QUALIFIER.test(n)) {
        fail('PLAN-02', `article:${ar?.slug ?? '?'}`, `« ${q} » est un head nu : il appartient au classement. Le blog prend les variantes qualifiées (persona, usage, face-à-face).`)
      }
    }
  }
}

// ═══ PLAN-03 — aucun volume inventé ════════════════════════════

for (const c of clusters) {
  const w = `cluster:${c?.id ?? '?'}`
  if (!isStr(c?.id)) fail('PLAN-03', w, 'id requis')
  if (!isStr(c?.label)) fail('PLAN-03', w, 'label requis')
  if (!INTENTS.includes(c?.intent)) fail('PLAN-03', w, `intent « ${c?.intent} » hors ${INTENTS.join(' | ')} — reprendre main_intent de DataForSEO, ne jamais deviner`)
  if (!KEYWORD_SOURCES.includes(c?.keywordSource)) fail('PLAN-03', w, `keywordSource requis parmi ${KEYWORD_SOURCES.join(' | ')} — un volume sans source est un volume inventé, et c'est pire qu'un volume absent : il a l'air fiable`)
  if (!isStr(c?.checkedAt)) fail('PLAN-03', w, 'checkedAt requis (date du relevé)')
  if (!isInt(c?.volume) || c.volume < 0) fail('PLAN-03', w, 'volume entier ≥ 0 requis')
  if (!isInt(c?.priority) || c.priority < 1 || c.priority > 5) fail('PLAN-03', w, 'priority entre 1 (pilier) et 5 (optionnel)')
}

// ═══ PLAN-04 — ni page-coquille, ni asset fantôme ══════════════

for (const a of assets) {
  const w = `asset:${a?.slug ?? '?'}`
  if (!ASSET_TYPES.includes(a?.type)) fail('PLAN-04', w, `type « ${a?.type } » hors ${ASSET_TYPES.join(' | ')}`)
  if (!isStr(a?.slug)) fail('PLAN-04', w, 'slug requis')
  if (!STATUSES.includes(a?.status)) fail('PLAN-04', w, `status requis parmi ${STATUSES.join(' | ')}`)

  if (a?.status === 'disabled') {
    if (!isStr(a?.disabledReason) || a.disabledReason.trim().length < 20) {
      fail('PLAN-04', w, "désactivé sans raison écrite. Éteindre un asset est une décision légitime — la taire ne l'est pas : la raison finit dans DECISIONS.md.")
    }
    continue
  }

  if (!isStr(a?.path) || !a.path.startsWith('/')) fail('PLAN-04', w, 'path requis, commençant par /')
  if (!isStr(a?.cluster)) fail('PLAN-04', w, 'cluster requis')
  else if (!clusterIds.has(a.cluster)) fail('PLAN-12', w, `cluster « ${a.cluster} » inconnu`)

  // Un asset actif sans requête réservée ne sert à rien : il n'a pas de raison
  // d'exister dans le plan, et il diluera le maillage.
  if (a?.type !== 'page' && (!isArr(a?.owns) || a.owns.length === 0)) {
    fail('PLAN-04', w, "actif mais ne réserve aucune requête — soit il possède quelque chose, soit il n'existe pas")
  }
  if (a?.type === 'classement' && (!isInt(a?.wordsMin) || a.wordsMin < 1000)) {
    fail('PLAN-04', w, 'un classement a un plancher de 1000 mots — en dessous il est thin, donc non citable')
  }
}

// ═══ PLAN-05 — le menu ne mène jamais au vide ══════════════════

{
  const used = new Set(articles.map((a) => a?.categorie).filter(isStr))
  for (const cat of blogCats) {
    if (!used.has(cat)) fail('PLAN-05', `asset:${cat}`, "catégorie blog sans aucun article planifié — une entrée de menu qui mène à une page vide")
  }
  for (const ar of articles) {
    if (!isStr(ar?.categorie)) fail('PLAN-05', `article:${ar?.slug ?? '?'}`, 'categorie requise')
    else if (!blogCats.has(ar.categorie)) fail('PLAN-05', `article:${ar.slug}`, `categorie « ${ar.categorie} » n'est pas un asset blog-categorie`)
  }
  if (blogCats.size > 0 && (blogCats.size < 3 || blogCats.size > 8)) {
    warn('PLAN-05', 'assets', `${blogCats.size} catégories blog — la zone utile est 4 à 8 : en dessous la thématique n'est pas couverte, au-dessus elles se cannibalisent`)
  }
}

// ═══ PLAN-06 — matériau citable ════════════════════════════════

for (const ar of articles) {
  const w = `article:${ar?.slug ?? '?'}`
  if (!isStr(ar?.slug)) fail('PLAN-06', w, 'slug requis')
  if (!ARTICLE_TYPES.includes(ar?.type)) fail('PLAN-06', w, `type requis parmi ${ARTICLE_TYPES.join(' | ')}`)
  if (isStr(ar?.cluster) && !clusterIds.has(ar.cluster)) fail('PLAN-12', w, `cluster « ${ar.cluster} » inconnu`)

  const qs = isArr(ar?.questions) ? ar.questions.filter(isStr) : []
  if (qs.length < 3) {
    fail('PLAN-06', w, `${qs.length} question(s) cible(s) — minimum 3. Les H2 en question sont le matériau que les LLM citent : sans elles la page n'est pas citable.`)
  }
  for (const q of qs) {
    if (!q.trim().endsWith('?')) warn('PLAN-06', w, `« ${q} » n'est pas formulée en question`)
    else if (q.trim().length < 15) warn('PLAN-06', w, `« ${q} » est trop courte pour être un H2 utile`)
  }
}

// ═══ PLAN-07 — le modèle mention tient ═════════════════════════

if (articles.length > 0) {
  const withBrands = articles.filter((a) => isArr(a?.brands) && a.brands.length >= 2).length
  const ratio = withBrands / articles.length
  if (ratio < 2 / 3) {
    fail('PLAN-07', 'articles', `${withBrands}/${articles.length} articles font surgir ≥ 2 marques réelles (${(ratio * 100).toFixed(0)} %, minimum 67 %). Le modèle est la MENTION : une page sans marque réelle n'a aucune valeur commerciale.`)
  }
  const noPersona = articles.filter((a) => a?.type === 'comparatif' && !isStr(a?.persona))
  if (noPersona.length > 0) {
    warn('PLAN-07', 'articles', `${noPersona.length} comparatif(s) sans persona — c'est le levier de longue traîne le moins disputé`)
  }
}

// ═══ PLAN-08 — parité des locales ══════════════════════════════

if (secondaries.length > 0) {
  const check = (o, w) => {
    const lp = o?.localizedPaths ?? {}
    for (const loc of secondaries) {
      if (!isStr(lp[loc])) fail('PLAN-08', w, `pas de chemin pour la locale « ${loc} » — la parité est une règle dure, pas une intention`)
      else if (isStr(o?.path) && lp[loc] === o.path) warn('PLAN-08', w, `le slug « ${loc} » recopie le slug primaire — traduire le slug, ne pas le recopier`)
    }
  }
  for (const a of assets) if (a?.status !== 'disabled') check(a, `asset:${a?.slug ?? '?'}`)
  for (const ar of articles) check(ar, `article:${ar?.slug ?? '?'}`)
}

// ═══ PLAN-09 — budget honnête ══════════════════════════════════

{
  const b = plan.budget ?? {}
  if (!isInt(b.seedArticles) || b.seedArticles < 1) fail('PLAN-09', 'budget.seedArticles', 'entier ≥ 1 requis')
  if (!isInt(b.dailyPublish) || b.dailyPublish < 0) fail('PLAN-09', 'budget.dailyPublish', 'entier ≥ 0 requis')
  if (!isInt(b.maxArticles) || b.maxArticles < 1) fail('PLAN-09', 'budget.maxArticles', 'entier ≥ 1 requis')

  if (isInt(b.dailyPublish) && isInt(b.maxArticles) && isInt(b.seedArticles)) {
    const capacity = b.seedArticles + b.dailyPublish * 365
    if (b.maxArticles > capacity) {
      fail('PLAN-09', 'budget', `maxArticles ${b.maxArticles} > ${capacity} absorbables en 12 mois (${b.seedArticles} seed + ${b.dailyPublish}/jour). Planifier des pages qui ne seront jamais écrites produit une arborescence creuse — pire qu'une arborescence plate et dense.`)
    }
  }
  if (articles.length > (b.maxArticles ?? Infinity)) {
    fail('PLAN-09', 'articles', `${articles.length} articles pour un maxArticles de ${b.maxArticles}`)
  }

  if (IS_INIT) {
    const seeded = articles.filter((a) => a?.status === 'seed').length
    if (seeded !== b.seedArticles) {
      fail('PLAN-09b', 'articles', `${seeded} article(s) en seed pour budget.seedArticles = ${b.seedArticles}. (Ce contrôle n'a de sens qu'à l'init : il devient faux dès la première publication quotidienne.)`)
    }
    const pillars = clusters.filter((c) => c?.priority <= 2).map((c) => c.id)
    for (const p of pillars) {
      const seededInPillar = articles.some((a) => a?.cluster === p && a?.status === 'seed')
      const assetInPillar = assets.some((a) => a?.cluster === p && a?.status === 'seed')
      if (!seededInPillar && !assetInPillar) {
        fail('PLAN-09b', `cluster:${p}`, "cluster pilier (priorité 1-2) entièrement planned alors que l'init publie ailleurs. C'est le travers naturel : les pages faciles sortent en premier.")
      }
    }
  }
}

// ═══ PLAN-10 — aucune trace d'affiliation ══════════════════════

{
  const BANNED = new Set(['affiliate', 'affiliatetag', 'affiliateurl', 'affiliatelink', 'price', 'pricewas', 'oldprice', 'promo', 'promocode', 'coupon', 'cta', 'ctaurl', 'ctatext', 'deal', 'deals', 'discount'])
  const seen = []
  const walk = (node, trail) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${trail}[${i}]`))
    for (const [k, v] of Object.entries(node)) {
      if (BANNED.has(k.toLowerCase())) seen.push(`${trail}.${k}`)
      walk(v, `${trail}.${k}`)
    }
  }
  walk(plan, '')
  for (const s of seen) {
    fail('PLAN-10', s, "champ d'affiliation dans le contrat. Le modèle EMD est la MENTION : aucun lien marchand, aucun CTA d'achat, aucun prix barré. Un lien produit légitime est NEUTRE, vers la source officielle.")
  }
}

// ═══ PLAN-11 — profondeur ══════════════════════════════════════

for (const a of assets) {
  if (a?.status === 'disabled') continue
  const d = isInt(a?.depth) ? a.depth : (isStr(a?.path) ? a.path.split('/').filter(Boolean).length : null)
  if (d === null) continue
  if (d > 4) fail('PLAN-11', `asset:${a?.slug ?? '?'}`, `profondeur ${d} > 4`)
  else if (d === 4 && !TERMINAL_TYPES.includes(a?.type)) {
    warn('PLAN-11', `asset:${a?.slug ?? '?'}`, `profondeur 4 sur un type « ${a?.type} » non terminal — le niveau 4 est fait pour les branches terminales (définition, procédure), là où se trouve le volume non disputé`)
  }
}

// ─── Rapport ──────────────────────────────────────────────────

const render = (list, mark) => {
  const byWhere = new Map()
  for (const f of list) {
    if (!byWhere.has(f.where)) byWhere.set(f.where, [])
    byWhere.get(f.where).push(f)
  }
  for (const [where, items] of [...byWhere.entries()].sort()) {
    console.log(`\n  ${where || '(racine)'}`)
    for (const it of items) console.log(`    ${mark} ${it.rule}  ${it.msg}`)
  }
}

console.log(`\nvalidate-plan — ${file}${IS_INIT ? ' (mode init)' : ''}`)
console.log(`  ${clusters.length} cluster(s) · ${assets.length} asset(s) · ${articles.length} article(s) · ${locales.length} locale(s)`)

if (warnings.length) {
  console.log(`\n${warnings.length} avertissement(s) :`)
  render(warnings, '!')
}

if (!errors.length) {
  console.log('\nOK — le plan passe tous les invariants.\n')
  process.exit(0)
}

console.log(`\n${errors.length} violation(s) :`)
render(errors, 'x')

if (WARN_ONLY) process.exit(0)

console.log(
  "\nCorriger le PLAN, jamais le validateur. Si une règle bloque à tort, c'est la\n" +
    'règle qui se discute — séparément, avec le cas qui le justifie.\n'
)
process.exit(1)