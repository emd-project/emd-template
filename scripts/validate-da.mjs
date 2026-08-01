#!/usr/bin/env node
/**
 * scripts/validate-da.mjs — LA PORTE DE LA PHASE 2.
 *
 * En V1, le contrat de DA n'est PAS un fichier de plus : `niche.config.ts`,
 * `app/globals.css`, `app/layout.tsx` et `app/styles/da-site.css` sont deja la
 * source de verite. Un `design-plan.json` les dupliquerait, et deux sources de
 * verite finissent toujours par diverger.
 *
 * `content/da-report.json` est donc purement PROBATOIRE : il declare ce que
 * l'agent a tire, mute et calcule. Ce script relit le rapport ET les fichiers
 * reels, et **recalcule** tout ce qui est calculable.
 *
 * C'est le point important : un ratio de contraste auto-declare ne prouve rien.
 * Le registre V2 en donnait la demonstration — il annoncait meilleur-chocolat.be
 * en Playfair Display alors que le site tourne en DM Serif Display, et personne
 * ne s'en est apercu pendant des mois. Ici, ce qui est declare est verifie
 * contre le disque, et ce qui est calculable est recalcule.
 *
 * Usage :
 *   node scripts/validate-da.mjs content/da-report.json
 *   node scripts/validate-da.mjs content/da-report.json registry/da-registry.json
 *   node scripts/validate-da.mjs content/da-report.json <registre> --warn-only
 *
 * Sans registre, DA-03 et DA-06b (divergence reseau) sont SAUTES et signales.
 *
 * ⛔ NE JAMAIS assouplir un seuil pour faire passer un build.
 *
 * Node pur — aucune dependance externe.
 */

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const positional = args.filter((a) => !a.startsWith('--'))
const file = positional[0] ?? 'content/da-report.json'
const registryPath = positional[1] ?? null
const WARN_ONLY = args.includes('--warn-only')

const ROOT = process.cwd()
const errors = []
const warnings = []
const fail = (rule, where, msg) => errors.push({ rule, where, msg })
const warn = (rule, where, msg) => warnings.push({ rule, where, msg })

const readJson = (p) => {
  const abs = path.resolve(ROOT, p)
  if (!fs.existsSync(abs)) return null
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf-8'))
  } catch (e) {
    console.error(`\nvalidate-da — JSON invalide dans ${p} :\n  ${e.message}\n`)
    process.exit(1)
  }
}
const readText = (p) => {
  const abs = path.resolve(ROOT, p)
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf-8') : null
}
const exists = (p) => fs.existsSync(path.resolve(ROOT, p))

const report = readJson(file)
if (!report) {
  console.error(`\nvalidate-da — fichier introuvable : ${file}\n`)
  process.exit(1)
}
const registry = registryPath ? readJson(registryPath) : null

// ─── Couleur — le calcul fait foi ─────────────────────────────

const HEX = /^#[0-9a-fA-F]{6}$/

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)

/** Luminance relative WCAG 2.2 : canaux linearises, ponderes 0,2126 / 0,7152 / 0,0722. */
const luminance = (hex) => {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Ratio = (L_clair + 0,05) / (L_sombre + 0,05). Jamais arrondi : 4,49 echoue. */
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const hue = (hex) => {
  const [r, g, b] = rgb(hex)
  const mx = Math.max(r, g, b)
  const d = mx - Math.min(r, g, b)
  if (!d) return 0
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return ((h % 360) + 360) % 360
}

/** Ecart circulaire de teinte : 350 et 10 sont a 20 degres, pas a 340. */
const hueDelta = (a, b) => {
  const d = Math.abs(hue(a) - hue(b))
  return Math.min(d, 360 - d)
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const isArr = (v) => Array.isArray(v)

const palette = report.palette ?? {}
const fonts = report.fonts ?? {}

// ═══ DA-00 — forme ═════════════════════════════════════════════

if (report.schemaVersion !== '1.0') fail('DA-00', 'schemaVersion', `attendu "1.0", recu ${JSON.stringify(report.schemaVersion)}`)
if (!isStr(report?.site?.domain)) fail('DA-00', 'site.domain', 'requis')

// ═══ DA-01 — le parti pris, ecrit et pose ══════════════════════

{
  const pp = report.partiPris
  if (!isStr(pp) || pp.trim().length < 40) {
    fail('DA-01', 'partiPris', "requis, au moins 40 caracteres. Une phrase concrete et ancree dans la thematique — « papier fiduciaire, tableaux comptables sobres, cuivre et marine ». Sans parti pris, les choix ne sont pas coherents entre eux : c'est exactement ce qui produit des sites plats et interchangeables.")
  } else {
    const css = readText('app/styles/da-site.css')
    if (css === null) {
      fail('DA-01', 'app/styles/da-site.css', "absent — c'est le SEUL fichier de style propre a ce site, et le seul endroit ou poser des effets sans casser les autres forks")
    } else {
      const head = css.split('\n').slice(0, 20).join('\n')
      const words = pp.toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 4)
      const found = words.filter((w) => head.toLowerCase().includes(w)).length
      if (found < Math.min(2, words.length)) {
        fail('DA-01', 'app/styles/da-site.css', "le parti pris n'est pas repris en tete du fichier. Il doit y etre lisible : c'est ce qui permet a la prochaine intervention de comprendre pourquoi le site ressemble a ca.")
      }
    }
  }
}

// ═══ DA-02 — la typo est reellement chargee ════════════════════

{
  const { display, body } = fonts
  if (!isStr(display) || !isStr(body)) {
    fail('DA-02', 'fonts', 'display et body requis')
  } else {
    if (display === 'Bricolage Grotesque' && body === 'Hanken Grotesk') {
      fail('DA-02', 'fonts', "paire par defaut du template : un site qui sort avec elle est indistinguable d'un fork non configure")
    }
    const layout = readText('app/layout.tsx')
    if (layout === null) {
      fail('DA-02', 'app/layout.tsx', 'absent')
    } else {
      // next/font exige des imports STATIQUES, espaces remplaces par `_`.
      // Ecrire la paire dans niche.config.fonts ne change RIEN au rendu :
      // aucun code ne lit ce champ. C'est le piege numero un de la phase 2.
      for (const [role, fam] of [['display', display], ['body', body]]) {
        const importName = fam.replace(/\s+/g, '_')
        if (!layout.includes(importName)) {
          fail('DA-02', 'app/layout.tsx', `« ${fam} » (${role}) annoncee mais absente des imports next/font. Rappel : niche.config.fonts n'est lu par aucun code — seul layout.tsx pilote le rendu.`)
        }
      }
    }
    const cfg = readText('niche.config.ts')
    if (cfg) {
      for (const [role, fam] of [['display', display], ['body', body]]) {
        const re = new RegExp(`${role}:\\s*'${fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`)
        if (!re.test(cfg)) warn('DA-02', 'niche.config.ts', `fonts.${role} ne dit pas « ${fam} » — le champ est une trace, mais une trace qui ment induit en erreur`)
      }
    }
    if (fonts.fontCollision === true) {
      warn('DA-02', 'fonts', "suggestFonts signale une collision : la fenetre d'exclusion couvrait tout le pool. Faire diverger le site autrement, ou elargir le pool.")
    }
  }
}

// ═══ DA-03 — divergence de palette contre le reseau ════════════

{
  const a1 = palette.accent1
  if (!isStr(a1) || !HEX.test(a1)) {
    fail('DA-03', 'palette.accent1', 'hex #RRGGBB requis')
  } else {
    const sites = isArr(registry?.sites) ? registry.sites : null
    if (!sites) {
      warn('DA-03', 'registre', 'absent — la divergence reseau est SAUTEE. Le registre vit dans emd-project/emd-template et ne se copie pas dans un fork.')
    } else {
      const self = String(report.site.domain).replace(/^www\./, '')
      const window = registry?.thresholds?.excludeWindow ?? 8
      const minDelta = registry?.thresholds?.accentHueMinDelta ?? 25
      const others = sites
        .filter((s) => isStr(s?.accent1) && HEX.test(s.accent1))
        .filter((s) => String(s.domain).replace(/^www\./, '') !== self)
        .slice(-window)

      for (const o of others) {
        const d = hueDelta(a1, o.accent1)
        if (d < minDelta) {
          fail('DA-03', 'palette.accent1', `${a1} est a ${d.toFixed(1)} degres de ${o.domain} (${o.accent1}) — minimum ${minDelta}. Muter la TEINTE, pas la luminosite.`)
        }
      }
      if (isStr(palette.bgPrimary) && isStr(palette.bgSurface)) {
        const clash = others.find((o) => o.bgPrimary === palette.bgPrimary && o.bgSurface === palette.bgSurface)
        if (clash) fail('DA-03', 'palette', `couple de fonds ${palette.bgPrimary}/${palette.bgSurface} identique a ${clash.domain} — deux presets differents partagent souvent le meme stack de fonds, et les sites paraissent jumeaux malgre des accents distincts`)
      }
    }
    if (!isStr(palette.source)) {
      fail('DA-03', 'palette.source', "requis : la direction de docs/DA-DIRECTIONS.md ou le preset de lib/da-presets/palettes.json d'ou vient la palette. Jamais d'hex improvises.")
    }
    if (!isArr(report.palette?.mutations) || report.palette.mutations.length === 0) {
      fail('DA-03', 'palette.mutations', 'aucune mutation chiffree declaree — un preset repris tel quel se retrouve a l\'identique sur deux sites')
    }
  }
}

// ═══ DA-04 — la palette est propagee dans les CINQ blocs ═══════

{
  const css = readText('app/globals.css')
  if (css === null) {
    fail('DA-04', 'app/globals.css', 'absent')
  } else {
    // Ne reecrire que `:root` laisse TOUS les sites identiques en mode clair.
    const blocks = [
      { name: '@theme', re: /@theme\b/ },
      { name: ':root', re: /:root\s*\{/ },
      { name: 'media prefers-color-scheme: light', re: /@media\s*\(\s*prefers-color-scheme:\s*light\s*\)/ },
      { name: 'html[data-theme="light"]', re: /\[data-theme=["']light["']\]/ },
      { name: 'html[data-theme="dark"]', re: /\[data-theme=["']dark["']\]/ },
    ]
    for (const b of blocks) {
      if (!b.re.test(css)) fail('DA-04', 'app/globals.css', `bloc « ${b.name} » absent — n'en oublier AUCUN, sinon tous les sites sont identiques dans un des deux modes`)
    }
    const TEMPLATE_ACCENTS = ['#FF3D57', '#C8001F', '#3DFFC0', '#7B61FF']
    const left = TEMPLATE_ACCENTS.filter((h) => css.toUpperCase().includes(h))
    if (left.length) fail('DA-04', 'app/globals.css', `accents du template encore presents : ${left.join(', ')}`)
  }

  const volteo = readText('app/styles/volteo.css')
  if (volteo) {
    const root = volteo.replace(/\/\*[\s\S]*?\*\//g, '').split(/^\}/m)[0] ?? ''
    const bare = (root.match(/#[0-9a-fA-F]{6}\b/g) ?? []).filter((h) => !/^#(000000|ffffff)$/i.test(h))
    if (bare.length) fail('DA-04', 'app/styles/volteo.css', `valeurs de couleur dans le :root d'une couche d'ALIAS : ${bare.join(', ')} — la DA passe par niche.config.palette puis globals.css, une valeur ici desynchronise la source unique`)
  }
}

// ═══ DA-05 — le contraste, RECALCULE ═══════════════════════════

{
  const list = isArr(report.contrast) ? report.contrast : []
  if (list.length < 4) {
    fail('DA-05', 'contrast', `${list.length} paire(s) declaree(s) — au minimum texte principal et texte secondaire sur fond et sur surface, en clair ET en sombre`)
  }
  const modes = new Set(list.map((c) => c?.mode))
  const isDual = report?.palette?.mode === 'dual' || modes.size > 1
  if (!modes.has('light') && !modes.has('dark')) {
    fail('DA-05', 'contrast', "aucun mode declare — un accent lisible en clair ne l'est pas mecaniquement en sombre")
  }

  for (const [i, c] of list.entries()) {
    const w = `contrast[${i}]${isStr(c?.pair) ? ` ${c.pair}` : ''}`
    if (!isStr(c?.fg) || !HEX.test(c.fg) || !isStr(c?.bg) || !HEX.test(c.bg)) {
      fail('DA-05', w, 'fg et bg en hex #RRGGBB requis')
      continue
    }
    const actual = contrast(c.fg, c.bg)
    const threshold = typeof c.threshold === 'number' ? c.threshold : 4.5

    // Le ratio DECLARE doit correspondre au calcul : un chiffre auto-declare et
    // jamais verifie ne prouve rien.
    if (typeof c.ratio === 'number' && Math.abs(c.ratio - actual) > 0.05) {
      fail('DA-05', w, `ratio declare ${c.ratio} mais calcule ${actual.toFixed(2)} — le calcul fait foi`)
    }
    if (actual < threshold) {
      fail('DA-05', w, `${actual.toFixed(2)}:1 < ${threshold} requis (${c.fg} sur ${c.bg}${isStr(c.mode) ? `, mode ${c.mode}` : ''}). Ajuster la LIGHTNESS du token, pas la teinte, puis recalculer.`)
    }
  }
  if (isDual && modes.size < 2) {
    warn('DA-05', 'contrast', 'palette annoncee bi-mode mais un seul mode mesure')
  }
}

// ═══ DA-06 — les effets, la peau du site ═══════════════════════

{
  const effects = isArr(report.effects) ? report.effects : []
  if (effects.length < 3 || effects.length > 5) {
    fail('DA-06', 'effects', `${effects.length} effet(s) — la zone utile est 3 a 5. C'est le levier le plus sous-exploite, et celui qui rend un site reconnaissable.`)
  }
  for (const [i, e] of effects.entries()) {
    if (!isStr(e?.id)) fail('DA-06', `effects[${i}]`, 'id requis')
    if (!isStr(e?.why)) fail('DA-06', `effects[${i}]`, "« why » requis : en quoi cet effet sert le parti pris. Un effet choisi sans raison est un effet decoratif, donc interchangeable.")
  }

  const css = readText('app/styles/da-site.css')
  if (css) {
    // Les regles de LAYOUT appartiennent aux composants, qui sont partages par
    // tous les forks. Ici on fait de la couleur, de la matiere, du mouvement,
    // de la typographie — jamais de la grille.
    if (/grid-template-columns|flex-basis|\bwidth:\s*\d/.test(css)) {
      fail('DA-06', 'app/styles/da-site.css', 'regle de layout detectee — da-site.css fait couleur, matiere, mouvement et typographie ; le layout appartient aux composants')
    }
    const bare = (css.replace(/\/\*[\s\S]*?\*\//g, '').match(/#[0-9a-fA-F]{6}\b/g) ?? [])
    if (bare.length) warn('DA-06', 'app/styles/da-site.css', `${bare.length} hex en dur (${[...new Set(bare)].slice(0, 4).join(', ')}) — passer par les tokens`)
    if (/@keyframes|animation:|transition:/.test(css) && !/prefers-reduced-motion/.test(css)) {
      fail('DA-06', 'app/styles/da-site.css', 'animation sans @media (prefers-reduced-motion: reduce)')
    }
  }

  const sites = isArr(registry?.sites) ? registry.sites : null
  if (sites && effects.length) {
    const mine = new Set(effects.map((e) => e?.id).filter(isStr))
    const window = registry?.thresholds?.excludeWindow ?? 8
    for (const o of sites.slice(-window)) {
      const theirs = isArr(o?.effects) ? o.effects : null
      if (!theirs || !theirs.length) continue
      const inter = theirs.filter((t) => mine.has(t)).length
      if (inter === mine.size && inter === theirs.length) {
        fail('DA-06b', 'effects', `selection identique a ${o.domain} — c'est le 3e niveau d'anti-empreinte, apres le squelette et la palette`)
      }
    }
  }
}

// ═══ DA-07 — aucune couleur en dur dans le rendu ═══════════════

{
  const IGNORED = new Set(['node_modules', '.next', '.git', '.vercel', 'dist', 'build', 'out', 'coverage'])
  const ALLOWED = new Set(['app/globals.css', 'app/styles/da-site.css', 'app/opengraph-image.tsx', 'app/icon.svg'])
  // Exemptions de PERIMETRE, pas de complaisance.
  // `app/admin/` est le chrome du CMS : noindex, jamais servi au lecteur, il ne
  // porte aucune direction artistique. Les `app/styles/volteo*.css` sont le
  // systeme de design partage par TOUS les forks — l'art-director a interdiction
  // d'y toucher, et volteo-chrome.css documente ses valeurs comme volontairement
  // invariantes (c'est meme ce que verifie tests/unit/da-guards.test.ts). Les y
  // signaler bloquerait un run pour une dette qu'il ne peut pas corriger ; elle
  // se corrige une fois, au centre.
  const EXEMPT = [/^app\/admin\//, /^app\/styles\/volteo[a-z-]*\.css$/]
  const offenders = new Map()
  const walk = (dir) => {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      const abs = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (!IGNORED.has(e.name)) walk(abs)
        continue
      }
      if (!/\.(tsx?|jsx?|css)$/.test(e.name)) continue
      const rel = path.relative(ROOT, abs).split(path.sep).join('/')
      if (ALLOWED.has(rel) || EXEMPT.some((re) => re.test(rel))) continue
      const raw = fs.readFileSync(abs, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      const hits = (raw.match(/#[0-9a-fA-F]{6}\b/g) ?? []).filter((h) => !/^#(000000|ffffff)$/i.test(h))
      if (hits.length) offenders.set(rel, [...new Set(hits)])
    }
  }
  for (const d of ['app', 'components']) if (exists(d)) walk(path.resolve(ROOT, d))
  for (const [f, hits] of offenders) {
    fail('DA-07', f, `couleur en dur : ${hits.slice(0, 5).join(', ')}${hits.length > 5 ? ` (+${hits.length - 5})` : ''} — une couleur ecrite dans un composant est un bug de build, pas un detail : c'est ainsi que l'empreinte partagee revient`)
  }
}

// ═══ DA-08 — les previews sont depubliees ══════════════════════

{
  const found = []
  for (const base of ['app/(site)', 'app/en']) {
    const abs = path.resolve(ROOT, base)
    if (!fs.existsSync(abs)) continue
    for (const name of fs.readdirSync(abs)) {
      if (!/^(home-v\d|cat-v\d|art-v\d)$/.test(name)) continue
      // L'API GitHub ne sait pas SUPPRIMER : github_commit_batch n'accepte que
      // `content` ou `imageFilename`. Un fork provisionne par API ne peut donc
      // jamais faire disparaitre ces dossiers, et cet invariant etait impassable
      // par construction. Ce qui compte n'est pas l'absence du DOSSIER mais
      // l'absence de PAGE : une route neutralisee en notFound() n'emet aucune
      // route, aucune entree de sitemap, aucun lien, et ne s'indexe pas.
      const page = path.resolve(abs, name, 'page.tsx')
      const raw = fs.existsSync(page) ? fs.readFileSync(page, 'utf-8') : ''
      if (!/notFound\s*\(\s*\)/.test(raw)) found.push(`${base}/${name}`)
    }
  }
  if (found.length) {
    fail('DA-08', 'app', `${found.length} route(s) preview encore servie(s) : ${found.join(', ')}. Dix formes pre-ecrites partagees par trente forks = empreinte reseau detectable. Supprimer le dossier, ou a defaut remplacer son page.tsx par : import { notFound } from "next/navigation"; export default function Page() { notFound() }`)
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
    console.log(`\n  ${where}`)
    for (const it of items) console.log(`    ${mark} ${it.rule}  ${it.msg}`)
  }
}

console.log(`\nvalidate-da — ${file}${registry ? ` · registre : ${registryPath}` : ' · SANS registre'}`)
if (isStr(fonts.display)) console.log(`  ${fonts.display} × ${fonts.body} · accent1 ${palette.accent1 ?? '?'}${isStr(palette.accent1) && HEX.test(palette.accent1) ? ` (teinte ${hue(palette.accent1).toFixed(1)}°)` : ''} · ${isArr(report.effects) ? report.effects.length : 0} effet(s)`)

if (warnings.length) {
  console.log(`\n${warnings.length} avertissement(s) :`)
  render(warnings, '!')
}

if (!errors.length) {
  console.log('\nOK — la DA passe tous les invariants.\n')
  process.exit(0)
}

console.log(`\n${errors.length} violation(s) :`)
render(errors, 'x')

if (WARN_ONLY) process.exit(0)

console.log("\nCorriger le TOKEN, jamais le seuil. Un plancher qu'on assouplit pour faire\npasser un build ne vaut plus rien pour aucun site.\n")
process.exit(1)
