#!/usr/bin/env node
/**
 * scripts/check-placeholders.mjs — GARDE-FOU ANTI-PLACEHOLDER.
 *
 * Le template emd-template livre des gabarits (« Modèle A », « Catégorie B »,
 * « À définir », data JSON vides, fichiers `_example.*`…). Ils sont censés être
 * remplacés à l'init. Sur ~20 sites, ils ne l'ont pas été et sont partis en prod.
 *
 * Ce script scanne le repo et SORT EN CODE 1 dès qu'il trouve un placeholder.
 * Il est enchaîné dans `npm run build` → un déploiement Vercel échoue tant qu'il
 * reste un placeholder. Il tourne aussi en CI (.github/workflows/check-placeholders.yml).
 *
 * Usage :
 *   node scripts/check-placeholders.mjs              # gate (exit 1 si détection)
 *   node scripts/check-placeholders.mjs --warn-only  # affiche, n'échoue jamais
 *   EMD_PLACEHOLDER_CHECK=strict node scripts/…      # force le gate même sur le template nu
 *
 * MODE TEMPLATE : tant que `niche.config.ts` n'est pas configuré (siteName
 * 'emd-template' / domain 'example.com'), le gate est DÉSARMÉ (warn-only) — le
 * template lui-même contient des gabarits par construction. Dès que la niche est
 * configurée (donc dès le premier vrai site), le gate S'ARME TOUT SEUL.
 *
 * Node pur — aucune dépendance externe.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const FORCE_WARN_ONLY = args.includes('--warn-only')
const STRICT = process.env.EMD_PLACEHOLDER_CHECK === 'strict'

/** Dossiers jamais scannés (build, deps, docs internes, gabarits de référence). */
const IGNORED_DIRS = new Set([
  'node_modules', '.next', '.git', '.vercel', 'dist', 'build', 'coverage',
  'out', '.turbo', 'public',
  // Non livrés au visiteur : documentation, skills, tests, scripts, imports design.
  'docs', 'skills', 'tests', 'scripts', 'design-incoming', 'tasks', '.github', '.claude',
])

/** Racines scannées (tout ce qui finit réellement devant un lecteur). */
const SCAN_ROOTS = ['app', 'components', 'content', 'lib', 'packages', 'niche.config.ts', 'cms.config.ts', 'middleware.ts']

const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.mdx', '.md', '.yaml', '.yml'])

/** Chaînes-témoins du template. Larges, mais ancrées pour éviter les faux positifs. */
const STRING_PATTERNS = [
  { re: /Mod[èe]le placeholder/i, label: 'Modèle placeholder' },
  { re: /Placeholder model/i, label: 'Placeholder model' },
  { re: /\bMod[èe]le\s+[A-E]\b/, label: 'Modèle A/B/C (gabarit)' },
  { re: /\bCat[ée]gorie\s+[A-E]\b/, label: 'Catégorie A/B/C (gabarit)' },
  { re: /\bCategory\s+[A-E]\b/, label: 'Category A/B/C (gabarit)' },
  { re: /À d[ée]finir/i, label: 'À définir' },
  { re: /placeholder rempla[cç]/i, label: "placeholder remplacé à l'init" },
  { re: /sera personnalis[ée]/i, label: 'sera personnalisé (texte gabarit)' },
  { re: /will be (populated|tailored|replaced)/i, label: 'will be populated by the init prompt' },
  { re: /(comparatif|classement|comparison|ranking)\s+(de\s+)?d[ée]monstration/i, label: 'contenu de démonstration' },
  { re: /(comparatif|classement|produit|article)\s+exemple/i, label: 'contenu « exemple »' },
  { re: /[àa] remplacer [àa] l['’]init/i, label: "à remplacer à l'init" },
  { re: /\bTBD\b/, label: 'TBD' },
  { re: /lorem ipsum/i, label: 'Lorem ipsum' },
  { re: /\bTODO:\s*(remplir|remplacer|à faire)/i, label: 'TODO de contenu' },
]

/** Tableau de données typé, vide, codé en dur dans une page. */
const EMPTY_ARRAY_RE = /const\s+[A-Z][A-Z0-9_]*\s*:\s*[A-Za-z_$][\w$.<>|\s]*\[\]\s*=\s*\[\s*\]/

/** Gabarits qui ne doivent JAMAIS survivre à l'init. */
const TEMPLATE_FILE_RES = [
  { re: /^content\/.*\/_example\.[^/]+$/, label: 'fichier gabarit `_example.*` encore présent' },
  { re: /^content\/_example\.[^/]+$/, label: 'fichier gabarit `_example.*` encore présent' },
  { re: /^content\/.*article-modele\.mdx$/, label: 'article gabarit `article-modele.mdx` encore présent' },
]

const findings = [] // { file, line, label, excerpt }

function add(file, line, label, excerpt = '') {
  findings.push({ file, line, label, excerpt })
}

function walk(dir) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue
      walk(path.join(dir, entry.name))
    } else if (entry.isFile()) {
      const abs = path.join(dir, entry.name)
      if (extOk(abs)) checkFile(abs)
    }
  }
}

function extOk(abs) {
  return SCAN_EXT.has(path.extname(abs))
}

function rel(abs) {
  return path.relative(ROOT, abs).split(path.sep).join('/')
}

function checkFile(abs) {
  const file = rel(abs)
  let raw
  try {
    raw = fs.readFileSync(abs, 'utf-8')
  } catch {
    return
  }

  // 1. Chaînes-témoins, ligne par ligne.
  const lines = raw.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const { re, label } of STRING_PATTERNS) {
      if (re.test(line)) add(file, i + 1, label, line.trim().slice(0, 100))
    }
  })

  // 2. Tableau de data typé vide en dur dans une page/composant.
  if (/\.(tsx|ts)$/.test(file)) {
    lines.forEach((line, i) => {
      if (EMPTY_ARRAY_RE.test(line)) {
        add(file, i + 1, "tableau de données vide en dur (jamais rempli à l'init)", line.trim().slice(0, 100))
      }
    })
  }

  // 3. JSON de data vide.
  if (/^content\/data\/[^/]+\.json$/.test(file)) {
    try {
      const parsed = JSON.parse(raw)
      const empty =
        (Array.isArray(parsed) && parsed.length === 0) ||
        (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0)
      if (empty) add(file, 1, 'JSON de données vide ({} ou []) — la section ne sortira jamais')
    } catch {
      add(file, 1, 'JSON de données illisible')
    }
  }

  // 4. Fichiers gabarits.
  for (const { re, label } of TEMPLATE_FILE_RES) {
    if (re.test(file)) add(file, 1, label)
  }

  // 5. Quiz activé mais sans questions → /quiz renverrait 404 (et le sitemap l'annonce).
  if (/^content\/pages\/quiz(\.[a-z]{2})?\.yaml$/.test(file) && quizEnabled()) {
    if (!/^\s*-\s*id:/m.test(raw)) {
      add(file, 1, 'quiz activé (niche.quiz.enabled) mais `steps` vide — renseignez les questions ou passez quiz.enabled à false')
    }
  }
}

let _quizEnabled = null
function quizEnabled() {
  if (_quizEnabled === null) {
    try {
      const cfg = fs.readFileSync(path.join(ROOT, 'niche.config.ts'), 'utf-8')
      _quizEnabled = /quiz:\s*\{[^}]*enabled:\s*true/.test(cfg)
    } catch {
      _quizEnabled = false
    }
  }
  return _quizEnabled
}

/** Le site est-il configuré ? (sinon = template nu → gate désarmé) */
function isConfigured() {
  try {
    const cfg = fs.readFileSync(path.join(ROOT, 'niche.config.ts'), 'utf-8')
    const stillTemplate =
      /siteName:\s*'emd-template'/.test(cfg) || /domain:\s*'example\.com'/.test(cfg)
    return !stillTemplate
  } catch {
    return true // pas de niche.config → on ne relâche rien
  }
}

// ─── Exécution ────────────────────────────────────────────────
for (const root of SCAN_ROOTS) {
  const abs = path.join(ROOT, root)
  if (!fs.existsSync(abs)) continue
  if (fs.statSync(abs).isDirectory()) walk(abs)
  else if (extOk(abs)) checkFile(abs)
}

const configured = isConfigured()
const warnOnly = FORCE_WARN_ONLY || (!configured && !STRICT)

const byFile = new Map()
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, [])
  byFile.get(f.file).push(f)
}

if (findings.length === 0) {
  console.log('✅ check-placeholders — aucun placeholder détecté.')
  process.exit(0)
}

const head = warnOnly ? '⚠️  PLACEHOLDERS DÉTECTÉS (warn-only)' : '❌ PLACEHOLDERS DÉTECTÉS'
console.log(`\n${head}\n${'─'.repeat(60)}`)

for (const [file, items] of [...byFile.entries()].sort()) {
  console.log(`\n  ${file}`)
  for (const it of items.sort((a, b) => a.line - b.line)) {
    console.log(`    ${file}:${it.line} — ${it.label}`)
    if (it.excerpt) console.log(`      ↳ ${it.excerpt}`)
  }
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`${findings.length} placeholder(s) détecté(s) dans ${byFile.size} fichier(s).`)

if (warnOnly) {
  if (!configured && !FORCE_WARN_ONLY) {
    console.log(
      '\nℹ️  Mode TEMPLATE : niche.config.ts n\'est pas configuré (siteName « emd-template » /\n' +
      '   domain « example.com »). Le gate est désarmé. Il s\'armera automatiquement dès que\n' +
      '   la niche sera renseignée — c\'est-à-dire dès le premier vrai site.'
    )
  }
  process.exit(0)
}

console.log(
  '\nÀ FAIRE — remplacer, pas masquer :\n' +
  '  · content/data/*.json vides ou « Modèle A/B/C » → vraies données de la niche.\n' +
  '  · const DEALS/CYCLES: …[] = []  → vraies données, ou supprimer la page.\n' +
  '  · content/**/_example.* et article-modele.mdx → SUPPRIMER.\n' +
  '  · Quiz : renseigner les `steps` (CMS /admin → page quiz) ou désactiver le quiz.\n' +
  '\nUne section absente vaut mieux qu\'une section « Modèle A ».\n' +
  'Contournement ponctuel : npm run check:placeholders -- --warn-only (ne débloque PAS le build).\n'
)
process.exit(1)
