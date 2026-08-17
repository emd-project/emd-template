/**
 * PermutationStyle — permutations structurelles (anti-empreinte) par SURCHARGE DE
 * TOKENS. Server Component, zéro JS. Monté dans <head>. N'écrit JAMAIS de valeur
 * dans volteo.css : il injecte des overrides de variables globales en !important
 * (donc gagne quel que soit l'ordre/spécificité), theme-safe (light + dark).
 *
 *  - shape   : --radius-* (rounded défaut | soft | sharp)
 *  - border  : --border / --border-strong (standard défaut | hairline | bold)
 *  - shadow  : --shadow-* (standard défaut | flat | deep)
 *  - effects : --fx-aurora (aurora défaut | subtle | none)
 *  - cards   : --card-bg / --card-border-width (bordered défaut | filled | minimal)
 *
 * 'rounded'/'standard'/'aurora'/'bordered' = aucun override → look historique
 * inchangé, au caractère près : la valeur par défaut est portée par globals.css,
 * pas par ce composant.
 *
 * effects & cards passent par le MÊME mécanisme que les trois autres — un token,
 * jamais une branche de rendu. `--fx-aurora` est un nombre sans unité et
 * `--card-bg` une référence à un token de fond : les deux sont indépendants du
 * thème, donc émis en `:root` simple, comme shape, et non via themed().
 */
import {
  resolveShape,
  resolveBorder,
  resolveShadow,
  resolveEffects,
  resolveCards,
  type Shape,
  type Border,
  type Shadow,
  type Effects,
  type Cards,
} from '@/lib/variants'

const RADIUS: Record<Exclude<Shape, 'rounded'>, string> = {
  soft: '--radius-sm:5px!important;--radius-md:9px!important;--radius-lg:13px!important;--radius-xl:18px!important',
  sharp: '--radius-sm:0!important;--radius-md:0!important;--radius-lg:0!important;--radius-xl:2px!important',
}

const BORDER: Record<Exclude<Border, 'standard'>, { light: string; dark: string }> = {
  hairline: {
    light: '--border:rgba(0,0,0,.05)!important;--border-strong:rgba(0,0,0,.10)!important',
    dark: '--border:rgba(255,255,255,.05)!important;--border-strong:rgba(255,255,255,.10)!important',
  },
  bold: {
    light: '--border:rgba(0,0,0,.16)!important;--border-strong:rgba(0,0,0,.30)!important',
    dark: '--border:rgba(255,255,255,.16)!important;--border-strong:rgba(255,255,255,.28)!important',
  },
}

const SHADOW: Record<Exclude<Shadow, 'standard'>, { light: string; dark: string }> = {
  flat: {
    light: '--shadow-sm:0 1px 2px rgba(0,0,0,.05)!important;--shadow-md:0 2px 8px rgba(0,0,0,.06)!important;--shadow-lg:0 6px 18px rgba(0,0,0,.08)!important',
    dark: '--shadow-sm:0 1px 2px rgba(0,0,0,.3)!important;--shadow-md:0 2px 8px rgba(0,0,0,.34)!important;--shadow-lg:0 6px 18px rgba(0,0,0,.4)!important',
  },
  deep: {
    light: '--shadow-sm:0 2px 6px rgba(0,0,0,.12)!important;--shadow-md:0 12px 30px rgba(0,0,0,.16)!important;--shadow-lg:0 26px 60px rgba(0,0,0,.22)!important',
    dark: '--shadow-sm:0 2px 6px rgba(0,0,0,.5)!important;--shadow-md:0 14px 34px rgba(0,0,0,.6)!important;--shadow-lg:0 30px 70px rgba(0,0,0,.7)!important',
  },
}

/**
 * Intensité des dégradés. `subtle` = nettement atténué mais encore lisible,
 * `none` = 0, aucun dégradé visible. Aucune position, aucune taille, aucun
 * layout : les règles de globals.css multiplient leurs propres pourcentages par
 * ce nombre.
 */
const FX: Record<Exclude<Effects, 'aurora'>, string> = {
  subtle: '--fx-aurora:0.35!important',
  none: '--fx-aurora:0!important',
}

/**
 * Surface de carte. `filled` = fond de surface plein et filet à 0, `minimal` =
 * ni fond ni filet (l'espacement des grilles porte seul la séparation).
 * Uniquement des tokens de palette — jamais une couleur en dur.
 */
const CARD: Record<Exclude<Cards, 'bordered'>, string> = {
  filled: '--card-bg:var(--bg-surface-2)!important;--card-border-width:0!important',
  minimal: '--card-bg:transparent!important;--card-border-width:0!important',
}

/** Émet les 3 contextes de thème pour des valeurs light/dark données. */
function themed(light: string, dark: string): string {
  return [
    `:root,html[data-theme="dark"]{${dark}}`,
    `html[data-theme="light"]{${light}}`,
    `@media(prefers-color-scheme:light){html:not([data-theme="dark"]){${light}}}`,
  ].join('')
}

export function PermutationStyle() {
  const shape = resolveShape()
  const border = resolveBorder()
  const shadow = resolveShadow()
  const effects = resolveEffects()
  const cards = resolveCards()

  let css = ''
  if (shape !== 'rounded') css += `:root{${RADIUS[shape]}}`
  if (border !== 'standard') css += themed(BORDER[border].light, BORDER[border].dark)
  if (shadow !== 'standard') css += themed(SHADOW[shadow].light, SHADOW[shadow].dark)
  if (effects !== 'aurora') css += `:root{${FX[effects]}}`
  if (cards !== 'bordered') css += `:root{${CARD[cards]}}`

  if (!css) return null
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
