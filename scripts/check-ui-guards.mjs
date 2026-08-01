#!/usr/bin/env node
/**
 * scripts/check-ui-guards.mjs — LES PLANCHERS D'UI, MÉCANISÉS.
 *
 * Sans planchers chiffrés, un design généré peut être « unique » et illisible.
 * Ce script porte la moitié GREPPABLE de `references/design-ux-regles.md`
 * (dépôt `emd-project/emd-methodo`), plus la liste d'anti-patterns visuels d'IA
 * que ce document nomme explicitement.
 *
 * Usage :
 *   node scripts/check-ui-guards.mjs              # gate (exit 1 si violation)
 *   node scripts/check-ui-guards.mjs --warn-only  # affiche, n'échoue jamais
 *   EMD_UI_CHECK=strict node scripts/…            # force le gate sur le template nu
 *
 * MODE TEMPLATE : tant que `niche.config.ts` n'est pas configuré (siteName
 * 'emd-template' / domain 'example.com'), le gate est DÉSARMÉ — le template contient
 * par construction des blocs de debug qui violent ses propres règles. Il s'arme seul
 * dès que la niche est renseignée, donc dès le premier vrai site.
 *
 * Échappatoire ponctuelle : `// ui-guard-ignore` sur la ligne ou celle d'avant.
 *
 * Node pur — aucune dépendance externe.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const FORCE_WARN_ONLY = args.includes('--warn-only')
const STRICT = process.env.EMD_UI_CHECK === 'strict'

const SCAN_ROOTS = ['app', 'components']
const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', '.vercel', 'dist', 'build', 'coverage', 'out', '.turbo'])
const SCAN_EXT = new Set(['.ts', '.tsx', '.jsx', '.css'])

/** Fichiers de chrome de dev : ils affichent volontairement des états d'erreur. */
const EXEMPT_FILES = new Set(['components/ui/ImagePlaceholder.tsx'])

/** Échelle 4/8 admise (px). 20, 40, 56 et 80 tolérés : paliers intermédiaires courants. */
const SPACING_SCALE = new Set([0, 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128])

const errors = []
const warnings = []
const files = []

/**
 * Fichiers qu'un fork SUBIT et n'a pas le droit de corriger : le systeme de
 * design partage par tous les sites du reseau, et le chrome du CMS (noindex,
 * jamais servi au lecteur, ne porte aucune direction artistique).
 */
const isShared = (file) =>
  /^app\/styles\/volteo[a-z-]*\.css$/.test(file) || /^app\/admin\//.test(file)

/**
 * Une violation dans un fichier partage n'est pas imputable au site : l'y
 * bloquer arrete un run pour une dette qu'il ne peut pas payer. Elle devient
 * donc un AVERTISSEMENT dans un fork, et reste BLOQUANTE en mode strict —
 * c'est-a-dire dans la CI du template, le seul endroit ou cette dette se paie.
 *
 * Le premier correctif n'avait traite que le compteur UI-12 ; UI-01, UI-03,
 * UI-08 et AIP-04 continuaient de scanner ces memes fichiers. Resultat : dix
 * violations propres au moteur suffisaient a rendre le gate infranchissable
 * pour tout fork des qu'une DA l'armait.
 */
const fail = (rule, file, line, msg, excerpt) => {
  if (!STRICT && isShared(file)) {
    warnings.push({ rule, file, line, msg: `${msg}  [dette moteur — hors perimetre du fork]`, excerpt })
    return
  }
  errors.push({ rule, file, line, msg, excerpt })
}
const warn = (rule, file, line, msg, excerpt) => warnings.push({ rule, file, line, msg, excerpt })

// ─── Collecte ─────────────────────────────────────────────────

function walk(dir) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (!IGNORED_DIRS.has(e.name)) walk(abs)
    } else if (SCAN_EXT.has(path.extname(abs))) {
      const file = path.relative(ROOT, abs).split(path.sep).join('/')
      try {
        files.push({ file, raw: fs.readFileSync(abs, 'utf-8') })
      } catch {
        /* illisible : on n'invente pas de verdict dessus */
      }
    }
  }
}

for (const root of SCAN_ROOTS) {
  const abs = path.join(ROOT, root)
  if (fs.existsSync(abs)) walk(abs)
}

function ignored(lines, i) {
  return /ui-guard-ignore/.test(lines[i] ?? '') || /ui-guard-ignore/.test(lines[i - 1] ?? '')
}

/**
 * La ligne est-elle dans un bloc `@media (prefers-reduced-motion: reduce)` ?
 *
 * WCAG 2.3.3 impose d'y neutraliser les animations, et la forme canonique est
 * `animation-duration: 0.01ms`. UI-06 la signalait comme durée hors bornes : le
 * garde pénalisait donc exactement le code qu'il doit exiger, et rendait le gate
 * impassable sur tout site correctement accessible.
 */
function inReducedMotion(lines, i) {
  for (let j = i; j >= 0 && i - j < 25; j--) {
    if (/prefers-reduced-motion/.test(lines[j] ?? '')) return true
    if (j !== i && /^\s*\}/.test(lines[j] ?? '')) return false
  }
  return false
}

// ─── Accumulateurs globaux (comptages inter-fichiers) ─────────

const fontSizes = new Set()
const fontFamilies = new Set()
const shadowValues = new Map()

// ─── Passe ligne à ligne ─────────────────────────────────────

for (const { file, raw } of files) {
  const exempt = EXEMPT_FILES.has(file)
  // Le systeme de design PARTAGE par tous les forks. Un fork n'a pas le droit
  // d'y toucher (cf. art-director), donc l'y compter bloque un run pour une
  // dette qu'il ne peut pas corriger. Elle se corrige une fois, au centre.
  const shared = /^app\/styles\/volteo[a-z-]*\.css$/.test(file)
  const lines = raw.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const n = i + 1
    const cut = line.trim().slice(0, 110)
    if (ignored(lines, i)) continue

    // ── Typographie ────────────────────────────────────────

    // Recense les tailles pour le comptage global.
    if (!shared) {
      for (const m of line.matchAll(/font-size:\s*([0-9.]+)(px|rem|em)/g)) fontSizes.add(m[1] + m[2])
      for (const m of line.matchAll(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g)) fontSizes.add(m[1])
      for (const m of line.matchAll(/\btext-\[([0-9.]+)(px|rem)\]/g)) fontSizes.add(m[1] + m[2])
    }
    // Ne compter que de VRAIES familles : `var(--font-body)` et `inherit` sont
    // des indirections vers la paire deja comptee, pas une troisieme police.
    for (const m of line.matchAll(/font-family:\s*([^;]+);/g)) {
      const fam = m[1].split(',')[0].trim().replace(/['"]/g, '')
      if (!/^var\(/.test(fam) && !/^(inherit|initial|unset|revert|sans-serif|serif|monospace|system-ui|ui-sans-serif|ui-serif|ui-monospace|cursive|fantasy)$/i.test(fam)) {
        fontFamilies.add(fam)
      }
    }

    // UI-01 — plancher absolu de taille de texte (11 px).
    for (const m of line.matchAll(/(?:font-size:\s*|\btext-\[)([0-9.]+)px/g)) {
      const px = parseFloat(m[1])
      if (px < 11) fail('UI-01', file, n, `taille de texte ${px}px < plancher absolu 11px`, cut)
      else if (px < 12) warn('UI-01', file, n, `taille de texte ${px}px : réservé aux labels, jamais au corps (≥ 16px)`, cut)
    }

    // UI-02 — poids 100-300 sous 16 px.
    if (/\bfont-(thin|extralight|light)\b/.test(line) && /\btext-(xs|sm)\b/.test(line))
      fail('UI-02', file, n, 'poids 100-300 sous 16px : illisible', cut)

    // UI-03 — line-height en px : bloque l'override utilisateur (WCAG 1.4.12).
    if (/line-height:\s*[0-9.]+px/.test(line))
      fail('UI-03', file, n, 'line-height en px — doit être sans unité (WCAG 1.4.12)', cut)
    for (const m of line.matchAll(/line-height:\s*([0-9.]+)\s*[;}]/g)) {
      const lh = parseFloat(m[1])
      if (lh > 0 && lh < 1.1) fail('UI-03', file, n, `line-height ${lh} < 1,1`, cut)
    }

    // UI-04 — longueur de ligne bornée.
    for (const m of line.matchAll(/max-w-\[([0-9.]+)ch\]/g)) {
      const ch = parseFloat(m[1])
      if (ch > 80) fail('UI-04', file, n, `prose à ${ch}ch > 80ch (zone retenue : 60-75ch)`, cut)
      else if (ch > 75 || ch < 55) warn('UI-04', file, n, `prose à ${ch}ch hors zone 60-75ch`, cut)
    }

    // ── Espacement ─────────────────────────────────────────

    // UI-05 — valeurs d'espacement arbitraires hors échelle 4/8.
    for (const m of line.matchAll(/\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-\[([0-9.]+)px\]/g)) {
      const px = parseFloat(m[1])
      if (!SPACING_SCALE.has(px)) fail('UI-05', file, n, `espacement ${px}px hors échelle 4/8`, cut)
    }

    // ── UX & accessibilité ─────────────────────────────────

    // UI-06 — durées d'animation hors 100-600 ms.
    if (!inReducedMotion(lines, i)) {
      for (const m of line.matchAll(/\bduration-\[?([0-9]+)m?s?\]?/g)) {
        const ms = parseInt(m[1], 10)
        if (!Number.isFinite(ms) || ms === 0) continue
        if (ms < 100 || ms > 600) fail('UI-06', file, n, `durée ${ms}ms hors 100-600ms`, cut)
      }
      for (const m of line.matchAll(/transition(?:-duration)?:[^;]*?\b([0-9]+)ms/g)) {
        const ms = parseInt(m[1], 10)
        if (ms && (ms < 100 || ms > 600)) fail('UI-06', file, n, `durée ${ms}ms hors 100-600ms`, cut)
      }
    }

    // UI-07 — cible tactile sous 44px sur un élément interactif.
    if (/<(?:button|a)\b/i.test(line)) {
      for (const m of line.matchAll(/\b(?:h|min-h)-\[([0-9.]+)px\]/g)) {
        const px = parseFloat(m[1])
        if (px < 44) warn('UI-07', file, n, `cible interactive ${px}px < 44px (mobile)`, cut)
      }
      if (/\b(?:h|min-h)-(?:6|7|8|9|10)\b/.test(line))
        warn('UI-07', file, n, 'cible interactive < 44px (h-6…h-10) — vérifier le contexte mobile', cut)
    }

    // ── Anti-patterns IA ───────────────────────────────────

    // AIP-01 — le dégradé indigo → violet → rose.
    if (/from-(indigo|violet|purple)-|to-(purple|pink|fuchsia)-|via-(purple|violet|pink)-/.test(line))
      fail('AIP-01', file, n, 'dégradé indigo/violet/rose — le cliché IA n°1', cut)
    if (/#(6366f1|818cf8|8b5cf6|a855f7|c084fc|ec4899|d946ef)\b/i.test(line))
      fail('AIP-01', file, n, 'hex de la palette Tailwind indigo/violet/rose en dur', cut)

    // AIP-04 — emoji en guise d'icône.
    if (!exempt) {
      const emoji = line.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
      if (emoji && /[>\"'`]/.test(line) && !/aria-hidden/.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line))
        fail('AIP-04', file, n, `emoji « ${emoji[0]} » : le lecteur d'écran énonce son nom Unicode — utiliser lucide-react`, cut)
    }

    // AIP-05 — texte justifié.
    if (/text-align:\s*justify|\btext-justify\b/.test(line))
      fail('AIP-05', file, n, 'text-align: justify — rivières, pas de césure en CSS', cut)

    // AIP-06 — capitales sur plus de 3 mots.
    if (/\buppercase\b|text-transform:\s*uppercase/.test(line)) {
      const text = (line.match(/>([^<>{}]{8,})</) ?? [])[1]
      if (text && text.trim().split(/\s+/).length > 3)
        warn('AIP-06', file, n, 'capitales sur plus de 3 mots (lecture ~10 % plus lente)', cut)
    }

    // AIP-07 — preuve sociale fabriquée.
    if (/Trusted by|Rejoignez\s+(?:plus de\s+)?[0-9]|[0-9][0-9\s.,]{2,}\+\s*(?:clients|utilisateurs|users|lecteurs|membres)|★{3,}|note moyenne de [0-9]/i.test(line))
      fail('AIP-07', file, n, 'preuve sociale fabriquée — deceptive pattern, incompatible avec le modèle MENTION', cut)

    // AIP-02 — badge-pill juste au-dessus d'un H1 (kit du hero généré).
    if (/<h1\b/i.test(line)) {
      const before = lines.slice(Math.max(0, i - 6), i).join(' ')
      if (/rounded-full/.test(before) && /text-center|items-center|mx-auto/.test(before + line))
        warn('AIP-02', file, n, "badge-pill au-dessus d'un H1 centré : le kit du hero généré", cut)
    }

    // Recense les ombres pour le comptage global.
    for (const m of line.matchAll(/box-shadow:\s*([^;]+);/g)) {
      const v = m[1].trim()
      shadowValues.set(v, (shadowValues.get(v) ?? 0) + 1)
    }
  }

  // ── Contrôles au niveau du fichier ───────────────────────

  // UI-08 — outline-none sans focus-visible de remplacement (WCAG 2.4.7).
  if (/outline-none|outline:\s*none/.test(raw) && !/focus-visible/.test(raw)) {
    const idx = lines.findIndex((l) => /outline-none|outline:\s*none/.test(l))
    fail('UI-08', file, idx + 1, 'outline supprimé sans focus-visible de remplacement (WCAG 2.4.7)', '')
  }

  // UI-09 — animation sans prefers-reduced-motion (fichiers CSS).
  if (file.endsWith('.css') && /@keyframes|animation:|transition:/.test(raw) && !/prefers-reduced-motion/.test(raw))
    warn('UI-09', file, 1, 'animations sans prise en charge de prefers-reduced-motion', '')

  // UI-10 — CLS : <Image> sans dimensions ni fill ni aspect-ratio.
  for (let i = 0; i < lines.length; i++) {
    if (!/<Image\b/.test(lines[i]) || ignored(lines, i)) continue
    const block = lines.slice(i, i + 10).join(' ')
    if (!/\bfill\b/.test(block) && !/width=/.test(block) && !/aspectRatio|aspect-/.test(block))
      warn('UI-10', file, i + 1, '<Image> sans width/height, fill ni aspect-ratio (CLS)', lines[i].trim().slice(0, 110))
  }

  // UI-11 — prose sans borne de mesure.
  if (/<article\b/.test(raw) && !/max-w-/.test(raw))
    warn('UI-11', file, 1, "<article> sans max-w : la mesure n'est pas bornée (60-75ch)", '')
}

// ─── Contrôles globaux ───────────────────────────────────────

if (fontSizes.size > 10)
  errors.push({ rule: 'UI-12', file: '(global)', line: 0, msg: `${fontSizes.size} tailles de police distinctes > 10 : le système a fui — ${[...fontSizes].sort().join(', ')}`, excerpt: '' })

if (fontFamilies.size > 3)
  errors.push({ rule: 'UI-13', file: '(global)', line: 0, msg: `${fontFamilies.size} familles de polices > 3 — ${[...fontFamilies].join(', ')}`, excerpt: '' })

if (shadowValues.size === 1 && [...shadowValues.values()][0] >= 5)
  warnings.push({ rule: 'AIP-03', file: '(global)', line: 0, msg: `une seule box-shadow réutilisée ${[...shadowValues.values()][0]} fois : une échelle d'élévation tient en 4-6 niveaux`, excerpt: '' })

// AIP-08 — états non-nominaux de l'App Router.
for (const f of ['app/loading.tsx', 'app/error.tsx', 'app/not-found.tsx']) {
  if (!fs.existsSync(path.join(ROOT, f)))
    errors.push({ rule: 'AIP-08', file: f, line: 0, msg: 'absent — aucun état non-nominal traité', excerpt: '' })
}

// ─── Rapport ─────────────────────────────────────────────────

function isConfigured() {
  try {
    const cfg = fs.readFileSync(path.join(ROOT, 'niche.config.ts'), 'utf-8')
    return !(/siteName:\s*'emd-template'/.test(cfg) || /domain:\s*'example\.com'/.test(cfg))
  } catch {
    return true
  }
}

const configured = isConfigured()
const warnOnly = FORCE_WARN_ONLY || (!configured && !STRICT)

function render(list, mark) {
  const byFile = new Map()
  for (const f of list) {
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file).push(f)
  }
  for (const [file, items] of [...byFile.entries()].sort()) {
    console.log(`\n  ${file}`)
    for (const it of items.sort((a, b) => a.line - b.line)) {
      console.log(`    ${mark} ${it.rule}  ${file}:${it.line} — ${it.msg}`)
      if (it.excerpt) console.log(`         ↳ ${it.excerpt}`)
    }
  }
}

console.log(`\ncheck-ui-guards — ${files.length} fichier(s) analysé(s)`)
console.log(`  tailles de police distinctes : ${fontSizes.size} (plafond 10)`)
console.log(`  familles de polices : ${fontFamilies.size} (plafond 3)`)
{
  const debt = warnings.filter((w) => isShared(w.file)).length
  if (debt) console.log(`  dont ${debt} avertissement(s) de dette moteur (fichiers partagés, hors périmètre du fork)`)
}

if (warnings.length) {
  console.log(`\n${warnings.length} avertissement(s) :`)
  render(warnings, '!')
}

if (!errors.length) {
  console.log('\nOK — tous les planchers d\'UI passent.\n')
  process.exit(0)
}

console.log(`\n${errors.length} violation(s) — doctrine : emd-project/emd-methodo · references/design-ux-regles.md`)
render(errors, 'x')

if (warnOnly) {
  if (!configured && !FORCE_WARN_ONLY)
    console.log(
      '\nMode TEMPLATE : niche.config.ts n\'est pas configuré. Le gate est désarmé et\n' +
        's\'armera automatiquement dès que la niche sera renseignée.\n'
    )
  process.exit(0)
}

console.log(
  '\nCorriger le TOKEN, pas l\'occurrence. Un plancher qu\'on assouplit pour faire passer\n' +
    'un build ne vaut plus rien pour aucun site. Échappatoire ponctuelle et justifiée :\n' +
    '`// ui-guard-ignore` sur la ligne concernée.\n'
)
process.exit(1)
