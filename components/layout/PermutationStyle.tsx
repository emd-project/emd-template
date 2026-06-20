/**
 * PermutationStyle — permutations structurelles (anti-empreinte) par SURCHARGE DE
 * TOKENS. Server Component, zéro JS. Monté dans <head>. N'écrit JAMAIS de valeur
 * dans volteo.css : il injecte des overrides de variables globales en !important
 * (donc gagne quel que soit l'ordre/spécificité), theme-safe (light + dark).
 *
 *  - shape  : --radius-* (rounded défaut | soft | sharp)
 *  - border : --border / --border-strong (standard défaut | hairline | bold)
 *  - shadow : --shadow-* (standard défaut | flat | deep)
 *
 * 'rounded'/'standard' = aucun override → look historique inchangé.
 */
import { resolveShape, resolveBorder, resolveShadow, type Shape, type Border, type Shadow } from '@/lib/variants'

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

  let css = ''
  if (shape !== 'rounded') css += `:root{${RADIUS[shape]}}`
  if (border !== 'standard') css += themed(BORDER[border].light, BORDER[border].dark)
  if (shadow !== 'standard') css += themed(SHADOW[shadow].light, SHADOW[shadow].dark)

  if (!css) return null
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
