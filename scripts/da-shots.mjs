#!/usr/bin/env node
/**
 * scripts/da-shots.mjs — BOUCLE DE RETOUR VISUELLE
 *
 * ┌─ LE PROBLÈME QU'IL RÉSOUT ────────────────────────────────────────────────┐
 * │ La DA est écrite À L'AVEUGLE. Rien dans le pipeline ne rend jamais une     │
 * │ page : un bug de contraste survit jusqu'à ce qu'un humain ouvre le site     │
 * │ dans le mauvais mode. C'est exactement comme ça que                        │
 * │ `background: var(--ink)` + `color: #fff` a vécu dans QUATRE fichiers de     │
 * │ layout — correct en clair, invisible en sombre, et aucune étape de l'init  │
 * │ ne pouvait faire la différence.                                            │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * Capture chaque route à deux tailles, dans les DEUX thèmes, et écrit le tout
 * dans `.da-shots/` avec un index. Un agent qui a accès au disque LIT ensuite
 * les PNG (l'outil Read affiche les images) → la boucle devient :
 *
 *      écrire du CSS → shooter → REGARDER → corriger
 *
 * au lieu de : écrire du CSS → espérer.
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *   npm run dev                       # dans un terminal
 *   node scripts/da-shots.mjs         # dans un autre
 *   node scripts/da-shots.mjs --url http://localhost:3001
 *   node scripts/da-shots.mjs --routes /,/blog,/home-v3
 *
 * Puis dérouler `docs/DA-REVIEW.md` sur le contenu de `.da-shots/`.
 *
 * ⚠️ Playwright n'est PAS dans package.json (cf. le commit qui ajoute ce
 * fichier). Installer avec :  npm i -D @playwright/test && npx playwright install chromium
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = '.da-shots'

/** Routes par défaut : l'actif + les previews (utiles AVANT dépublication). */
const DEFAULT_ROUTES = [
  '/',
  '/blog',
  '/home-v1', '/home-v2', '/home-v3', '/home-v4', '/home-v5',
  '/cat-v1', '/cat-v2', '/cat-v3',
  '/art-v1', '/art-v2',
]

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900, fullPage: true },
  { name: 'mobile', width: 390, height: 844, fullPage: false },
]

/**
 * Les DEUX thèmes, toujours. Ce n'est pas un confort : chaque bug trouvé en
 * passe 0 était invisible dans un mode et fatal dans l'autre.
 */
const THEMES = ['light', 'dark']

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const BASE = arg('--url', 'http://localhost:3000').replace(/\/$/, '')
const ROUTES = arg('--routes', '').split(',').filter(Boolean)
const routes = ROUTES.length ? ROUTES : DEFAULT_ROUTES

let chromium
try {
  ;({ chromium } = await import('@playwright/test'))
} catch {
  console.error(
    '\n  Playwright absent.\n\n' +
      '  Il figure dans .gitignore, dans vitest.config.mts et dans le script\n' +
      '  `test:e2e`, mais dans AUCUNE dépendance — scaffolding jamais branché.\n' +
      '  Il n\'est pas ajouté automatiquement : modifier package.json sans\n' +
      '  régénérer package-lock.json casserait `npm ci`, donc les déploiements.\n\n' +
      '    npm i -D @playwright/test && npx playwright install chromium\n'
  )
  process.exit(1)
}

const slug = (r) => (r === '/' ? 'home' : r.replace(/^\//, '').replace(/\//g, '-'))

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

console.log(`\n  ${BASE} → ${OUT}/\n`)

const browser = await chromium.launch()
const captured = []
const skipped = []

for (const theme of THEMES) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: theme,
      // Captures stables : on fige les animations d'entrée au scroll.
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    })

    // Force le thème AVANT le premier rendu, par le même chemin que le script
    // inline de app/layout.tsx (localStorage → data-theme). On teste donc le
    // vrai toggle, pas une émulation.
    await context.addInitScript((t) => {
      try {
        localStorage.setItem('theme', t)
      } catch {}
    }, theme)

    const page = await context.newPage()

    for (const route of routes) {
      const name = `${slug(route)}--${vp.name}--${theme}.png`
      try {
        const res = await page.goto(BASE + route, {
          waitUntil: 'networkidle',
          timeout: 20000,
        })
        if (!res || res.status() >= 400) {
          skipped.push(`${route} (${res ? res.status() : 'no response'})`)
          continue
        }
        // Laisse les webfonts se poser : une capture en fallback fausse le
        // jugement typographique, qui est justement ce qu'on vient regarder.
        await page.evaluate(() => document.fonts?.ready)
        await page.waitForTimeout(250)

        await page.screenshot({ path: join(OUT, name), fullPage: vp.fullPage })
        captured.push({ route, viewport: vp.name, theme, file: name })
        console.log(`  ✓ ${name}`)
      } catch (err) {
        skipped.push(`${route} [${vp.name}/${theme}] — ${err.message.split('\n')[0]}`)
      }
    }

    await context.close()
  }
}

await browser.close()

// ── Index : de quoi regarder les paires clair/sombre côte à côte ────────────
const byRoute = new Map()
for (const c of captured) {
  if (!byRoute.has(c.route)) byRoute.set(c.route, [])
  byRoute.get(c.route).push(c)
}

const lines = [
  '# Captures DA',
  '',
  `Base : \`${BASE}\` · ${captured.length} captures · ${skipped.length} ignorées`,
  '',
  '> Dérouler **[`docs/DA-REVIEW.md`](../docs/DA-REVIEW.md)** sur ces images.',
  '> Comparer TOUJOURS la paire clair/sombre : les bugs de contraste ne sont',
  '> visibles que dans un des deux modes.',
  '',
  '| Route | desktop clair | desktop sombre | mobile clair | mobile sombre |',
  '|---|---|---|---|---|',
]

for (const [route, shots] of byRoute) {
  const cell = (vp, th) => {
    const s = shots.find((x) => x.viewport === vp && x.theme === th)
    return s ? `[▢](${s.file})` : '—'
  }
  lines.push(
    `| \`${route}\` | ${cell('desktop', 'light')} | ${cell('desktop', 'dark')} | ` +
      `${cell('mobile', 'light')} | ${cell('mobile', 'dark')} |`
  )
}

if (skipped.length) {
  lines.push('', '## Ignorées', '', ...skipped.map((s) => `- ${s}`))
}

writeFileSync(join(OUT, 'index.md'), lines.join('\n') + '\n')

console.log(`\n  ${captured.length} captures · ${skipped.length} ignorées`)
console.log(`  → ${OUT}/index.md\n`)

if (!captured.length) {
  console.error('  Aucune capture. Le serveur tourne-t-il ? (npm run dev)\n')
  process.exit(1)
}
