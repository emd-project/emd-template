/**
 * Shortcodes — syntaxe [[…]] pour les rédacteurs non-techniques.
 * Traverse le WYSIWYG sans casse (pas de < > à encoder).
 *
 * Syntaxe :
 *   Inline     : [[stat value="45 min" label="Durée"]]
 *   Bloc       : [[tip title="Conseil"]]Contenu…[[/tip]]
 *
 * MODÈLE MENTION : plus aucun raccourci produit (carte d'achat, carrousel
 * marchand). Les shortcodes restants sont purement éditoriaux.
 *
 * Pipeline : decodeEncodedJsx → expandShorthand → expandBlock → expandInline
 * Appelé AVANT compileMDX sur le contenu brut.
 */

export const SHORTCODE_COMPONENTS: Record<string, string> = {
  stat: 'StatCard',
  statrow: 'StatRow',
  procon: 'ProConTable',
  tip: 'Tip',
  warning: 'Warning',
  verdict: 'Verdict',
  pullquote: 'PullQuote',
  compare: 'CompareBar',
  image: 'ArticleImage',
  summary: 'AISummarize',
}

const BLOCK_ALIASES = new Set(['tip', 'warning', 'verdict', 'pullquote'])

function resolveComponent(alias: string): string {
  const lower = alias.toLowerCase()
  return SHORTCODE_COMPONENTS[lower] ?? alias
}

function decodeEncodedJsx(content: string): string {
  return content.replace(
    /&lt;(\/?[A-Z][a-zA-Z0-9]*(?:\s+[^&]*?)?\/?)&gt;/g,
    (_m, inner) => `<${inner.replace(/&quot;/g, '"')}>`,
  )
}

function expandShorthand(content: string): string {
  return content.replace(
    /\[\[([a-z]+):([^\]\s]+)\]\]/g,
    (match, alias, value) => {
      const lower = String(alias).toLowerCase()
      // Alias inconnu → on laisse le texte brut (aucun composant fantôme dans le MDX).
      if (!SHORTCODE_COMPONENTS[lower]) return match
      const component = resolveComponent(alias)
      return `<${component} slug="${value}" />`
    },
  )
}

function expandBlockShortcodes(content: string): string {
  return content.replace(
    /\[\[([a-z]+)([^\]]*)\]\]([\s\S]*?)\[\[\/\1\]\]/g,
    (match, alias, attrs, body) => {
      if (!BLOCK_ALIASES.has(alias)) return match
      const component = resolveComponent(alias)
      const cleanAttrs = attrs.trim()
      const open = cleanAttrs ? `<${component} ${cleanAttrs}>` : `<${component}>`
      return `${open}\n${body.trim()}\n</${component}>`
    },
  )
}

function expandInlineShortcodes(content: string): string {
  return content.replace(
    /\[\[([a-z]+)(\s+[^\]]*?)?\]\]/g,
    (match, alias, attrs) => {
      const lower = alias.toLowerCase()
      if (BLOCK_ALIASES.has(lower)) return match
      if (!SHORTCODE_COMPONENTS[lower]) return match
      const component = resolveComponent(alias)
      const cleanAttrs = (attrs ?? '').trim()
      return cleanAttrs ? `<${component} ${cleanAttrs} />` : `<${component} />`
    },
  )
}

export function processShortcodes(content: string): string {
  let out = decodeEncodedJsx(content)
  out = expandShorthand(out)
  out = expandBlockShortcodes(out)
  out = expandInlineShortcodes(out)
  return out
}

// ─── Documentation pour /admin/shortcodes ──────────────────────────────

export interface ShortcodeDoc {
  alias: string
  component: string
  description: string
  example: string
  type: 'shorthand' | 'inline' | 'block'
}

export const SHORTCODE_DOCS: ShortcodeDoc[] = [
  {
    alias: 'stat',
    component: 'StatCard',
    description: 'Carte statistique — valeur mise en avant avec label et sous-texte.',
    example: '[[stat value="45 min" label="Autonomie" sub="Navigation laser"]]',
    type: 'inline',
  },
  {
    alias: 'statrow',
    component: 'StatRow',
    description: 'Ligne de stats côte à côte — pour les fiches techniques.',
    example: '[[statrow items="Poids|2.3 kg---Autonomie|180 min---Bruit|65 dB"]]',
    type: 'inline',
  },
  {
    alias: 'procon',
    component: 'ProConTable',
    description: 'Tableau points forts / points faibles — items séparés par |.',
    example: '[[procon pros="Bon rapport qualité-prix|Silencieux" cons="Pas de wifi|Bac petit"]]',
    type: 'inline',
  },
  {
    alias: 'compare',
    component: 'CompareBar',
    description: 'Barre de comparaison entre deux modèles, notée sur 10.',
    example: '[[compare label="Photo" left="88" right="95" leftName="Modèle A" rightName="Modèle B"]]',
    type: 'inline',
  },
  {
    alias: 'image',
    component: 'ArticleImage',
    description: 'Image éditoriale avec alt et caption optionnelle.',
    example: '[[image src="/images/test.webp" alt="Photo du produit" caption="Test en conditions réelles"]]',
    type: 'inline',
  },
  {
    alias: 'summary',
    component: 'AISummarize',
    description: 'Bloc résumé IA avec liens vers les LLM (ChatGPT, Claude, etc.).',
    example: '[[summary question="Quel produit choisir ?" points="Point 1|Point 2|Point 3"]]',
    type: 'inline',
  },
  {
    alias: 'tip',
    component: 'Tip',
    description: 'Encart conseil éditorial — voix de la rédaction.',
    example: '[[tip title="Le vrai conseil"]]\nContenu du conseil ici.\n[[/tip]]',
    type: 'block',
  },
  {
    alias: 'warning',
    component: 'Warning',
    description: 'Encart avertissement — prix, mises à jour, précautions.',
    example: '[[warning title="Prix vérifiés en avril 2026"]]\nLes prix peuvent varier.\n[[/warning]]',
    type: 'block',
  },
  {
    alias: 'verdict',
    component: 'Verdict',
    description: 'Verdict éditorial — conclusion d\'une section produit.',
    example: '[[verdict title="Notre verdict"]]\nLe meilleur choix à ce prix.\n[[/verdict]]',
    type: 'block',
  },
  {
    alias: 'pullquote',
    component: 'PullQuote',
    description: 'Citation mise en avant — grande typographie éditoriale.',
    example: '[[pullquote]]\nUne citation percutante ici.\n[[/pullquote]]',
    type: 'block',
  },
]
