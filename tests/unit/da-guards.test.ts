import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { niche } from '@/niche.config'

/**
 * Garde-fous DA — la version EXÉCUTABLE des règles de docs/AUTO-DESIGN.md.
 *
 * Pourquoi : tous les « = bug d'init » de la doc étaient déclaratifs. Un site
 * pouvait sortir avec le thème par défaut sans que rien ne le signale, et le bug
 * d'inversion de tokens a survécu des mois dans quatre fichiers de layout.
 * `vitest run` étant dans le filtre qualité, ces règles cassent maintenant le build.
 *
 * ⚠️ Les COMMENTAIRES sont exclus de l'analyse : documenter un anti-pattern
 * (« ne jamais écrire --shadow-sm: var(--shadow-sm) ») est légitime et ne doit
 * pas déclencher le lint. Régression vécue : le garde-fou matchait ses propres
 * exemples cités en commentaire dans volteo.css.
 */

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const exists = (p: string) => existsSync(join(ROOT, p))

/**
 * Vide le CONTENU des commentaires CSS en préservant les sauts de ligne
 * (les numéros de ligne rapportés restent exacts).
 */
const stripComments = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ''))

/** Un fork configuré (≠ template vierge) ? Les garde-fous d'init ne valent que là. */
const isConfigured = niche.domain !== 'example.com' && niche.domain !== ''

// ═══════════════════════════════════════════════════════════════════════════
// 1. LINT « PAIRE INVARIANTE » — toujours actif, template compris
// ═══════════════════════════════════════════════════════════════════════════

/**
 * LA RÈGLE : un couple de tokens n'est sûr que si les DEUX s'inversent ensemble.
 *
 *   var(--ink) + var(--bg-primary)      ✅ ils basculent de concert
 *   var(--ink) + un blanc littéral      ❌ --ink bascule, le littéral non
 *   var(--accent-1) + var(--bg-primary) ❌ l'accent ne bascule pas
 *
 * Le second cas se détecte mécaniquement : plus aucun blanc littéral n'a de
 * raison d'exister dans les CSS de layout depuis que `--chrome-*` couvre tous
 * les usages légitimes (chrome sombre, voile photo, texte sur accent).
 */
const LAYOUT_CSS = [
  'app/styles/volteo.css',
  'app/styles/volteo-magazine.css',
  'app/styles/volteo-marche.css',
  'app/styles/volteo-fil.css',
  'app/styles/volteo-hub.css',
  'app/styles/volteo-article.css',
  'app/styles/volteo-comparateur.css',
]

/** Blancs littéraux. `#000` est toléré : il ne sert qu'aux masques (mask-image). */
const WHITE_LITERAL = /(#fff\b|#ffffff\b|rgba\(\s*255\s*,\s*255\s*,\s*255)/i

/**
 * `color-mix()` est le cas LÉGITIME : `color-mix(in srgb, var(--cat-1) 15%, #fff)`
 * dérive une nuance claire, ce n'est pas du texte posé sur un fond figé.
 * volteo.css en compte une douzaine. On saute donc ces lignes — quitte à rater
 * un vrai littéral qui cohabiterait avec un color-mix sur la même ligne :
 * mieux vaut un faux négatif qu'un build bloqué sur du code correct.
 */
const isDerivation = (line: string) => line.includes('color-mix')

describe('DA — aucun blanc littéral dans les CSS de layout', () => {
  for (const file of LAYOUT_CSS) {
    it(`${file} n'utilise que les tokens --chrome-*`, () => {
      const offenders = stripComments(read(file))
        .split('\n')
        .map((raw, i) => ({ line: raw.trim(), n: i + 1 }))
        .filter(({ line }) => WHITE_LITERAL.test(line) && !isDerivation(line))

      expect(
        offenders.map((o) => `${file}:${o.n}  ${o.line}`),
        'Un blanc littéral posé sur un fond piloté par --ink/--accent devient ' +
          'invisible dans un des deux modes. Utiliser --chrome-text / --on-accent ' +
          '(app/styles/volteo-chrome.css).'
      ).toEqual([])
    })
  }
})

describe('DA — les voiles photo passent par les tokens de scrim', () => {
  it('aucun littéral rgba(8,12,22,…) hors volteo-chrome.css', () => {
    const offenders = LAYOUT_CSS.filter((f) =>
      /rgba\(\s*8\s*,\s*12\s*,\s*22/.test(stripComments(read(f)))
    )
    expect(offenders, 'Utiliser --scrim-soft / --scrim-strong.').toEqual([])
  })
})

describe('DA — volteo-chrome.css est bien la seule source des invariants', () => {
  it('existe et est chargé par app/layout.tsx', () => {
    expect(exists('app/styles/volteo-chrome.css')).toBe(true)
    expect(read('app/layout.tsx')).toContain('volteo-chrome.css')
  })

  it('ses tokens ne sont JAMAIS redéfinis dans un bloc de thème', () => {
    // Leur invariance est tout l'intérêt : les redéfinir par thème réintroduit
    // exactement le bug qu'ils corrigent.
    const themed = LAYOUT_CSS.concat(['app/globals.css'])
      .filter((f) => /--chrome-[a-z0-9-]+\s*:/.test(stripComments(read(f))))
    expect(themed, 'Les --chrome-* ne se déclarent que dans volteo-chrome.css.').toEqual([])
  })
})

describe("DA — volteo.css reste une couche d'ALIAS", () => {
  it('aucune couleur littérale dans son :root', () => {
    const root = stripComments(read('app/styles/volteo.css')).split(/^\}/m)[0] ?? ''
    const hexes = root.match(/#[0-9a-f]{3,8}\b/gi) ?? []
    // `#000` / `#fff` restent admis : ils ne servent qu'à dériver des nuances
    // via color-mix (--primary-d, --primary-soft, --cat-N-soft…).
    const bare = hexes.filter((h) => !/^#(000|fff)$/i.test(h))
    expect(
      bare,
      'La DA passe par niche.config.palette → globals.css. Une valeur ici ' +
        'désynchronise la source unique.'
    ).toEqual([])
  })

  it('ne ré-aliase pas --shadow-sm / --shadow-lg sur eux-mêmes', () => {
    // Régression 3acabdb : l'auto-référence gagnait la cascade sur globals.css
    // → cycle → propriété invalide → toutes les box-shadow tombaient à rien.
    // (Commentaires exclus : volteo.css DOCUMENTE cet anti-pattern en toutes
    // lettres — c'est le code qui est interdit, pas sa description.)
    const css = stripComments(read('app/styles/volteo.css'))
    expect(css).not.toMatch(/--shadow-sm:\s*var\(--shadow-sm\)/)
    expect(css).not.toMatch(/--shadow-lg:\s*var\(--shadow-lg\)/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. COMPLÉTUDE D'INIT — ne s'active que sur un fork configuré
// ═══════════════════════════════════════════════════════════════════════════

describe.runIf(isConfigured)("DA — l'init a bien tourné", () => {
  it('les fonts par défaut ont été remplacées dans layout.tsx', () => {
    // Piège n°1 : écrire niche.config.fonts sans toucher layout.tsx ne change
    // RIEN au rendu — rien ne lit niche.config.fonts.
    const layout = read('app/layout.tsx')
    const stillDefault =
      layout.includes('Bricolage_Grotesque') && layout.includes('Hanken_Grotesk')
    expect(
      stillDefault,
      `${niche.domain} utilise encore la paire par défaut. Écrire la paire de ` +
        'suggestFonts(niche.domain, home) dans app/layout.tsx.'
    ).toBe(false)
  })

  it('la palette du template a disparu de globals.css', () => {
    const css = stripComments(read('app/globals.css')).toUpperCase()
    const leftovers = ['#FF3D57', '#C8001F', '#3DFFC0', '#7B61FF'].filter((hex) =>
      css.includes(hex)
    )
    expect(
      leftovers,
      'Accents du template encore présents. globals.css contient PLUSIEURS ' +
        'blocs de palette (@theme, :root, media light, data-theme light, ' +
        'data-theme dark) : les traiter TOUS, sinon tous les sites sont ' +
        'identiques en mode clair.'
    ).toEqual([])
  })

  it('une variante a été choisie', () => {
    expect(
      niche.layouts?.home,
      "niche.config.layouts.home absent → la sélection auto n'a pas tourné " +
        '(le resolver retombe silencieusement sur magazine).'
    ).toBeTruthy()
  })

  it('les routes preview ont été dépubliées', () => {
    const dirs = ['app/(site)', 'app/en']
      .filter((d) => exists(d))
      .flatMap((d) => readdirSync(join(ROOT, d)).map((name) => `${d}/${name}`))
      .filter((p) => /\/(home-v\d|cat-v\d|art-v\d)$/.test(p))
    expect(dirs, 'Une preview en prod = empreinte réseau détectable.').toEqual([])
  })

  it('niche.config.fonts est cohérent avec layout.tsx', () => {
    // fonts n'est pas lu par le runtime, mais il sert de trace : s'il ment,
    // il induit en erreur toute intervention ultérieure.
    const layout = read('app/layout.tsx')
    for (const family of [niche.fonts.display, niche.fonts.body]) {
      const importName = family.replace(/\s+/g, '_')
      expect(layout, `niche.config.fonts annonce « ${family} », absent de layout.tsx.`)
        .toContain(importName)
    }
  })
})
