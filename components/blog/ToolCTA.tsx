/**
 * ToolCTA — bloc CTA vers un outil interactif du site.
 * Injecté automatiquement selon la catégorie de l'article.
 * Server Component.
 *
 * ANTI-LIEN-MORT (deux garde-fous) :
 * 1. Le CTA « comparateur » n'est proposé pour une catégorie QUE si un produit
 *    du MÊME slug existe dans `content/data/comparateurs.json` — `/comparer/[produit]`
 *    n'est généré que pour `PRODUIT_SLUGS`, et les catégories (niche.categories)
 *    ne coïncident pas forcément avec les produits comparés. Sinon → repli `/comparer`.
 * 2. Le CTA « simulateur » n'est proposé QUE si `niche.simulator.enabled` est vrai —
 *    la route /simulateur renvoie 404 sinon (désactivée par défaut).
 * Les hrefs sont préfixés par la locale active (`localePath`, no-op en FR).
 *
 * Les libellés viennent de `tl(locale, …)`, mais les VARIABLES qu'on y interpole
 * (libellé de catégorie, entité de la niche) sont du contenu de CONFIG : elles
 * passent donc par lib/niche-l10n.ts, sans quoi une phrase anglaise se retrouvait
 * avec un mot français dedans.
 */
import Link from 'next/link'
import { categoryAccent, localePath, simulatorEnabled } from '@/niche.config'
import { PRODUIT_SLUGS } from '@/lib/comparateur'
import { tl } from '@/lib/i18n'
import { nicheL, categoriesL } from '@/lib/niche-l10n'

type Tool = {
  href: string
  label: string
  description: string
  cta: string
  accentVar: string
}

function buildTools(locale: string): Record<string, Tool> {
  const lp = (href: string) => localePath(locale, href)
  const tools: Record<string, Tool> = {}
  categoriesL(locale).forEach((cat, i) => {
    // Pas d'entrée comparateur pour cette catégorie → pas de CTA (le repli /comparer s'applique).
    if (!PRODUIT_SLUGS.includes(cat.slug)) return
    tools[cat.slug] = {
      href: lp(`/comparer/${cat.slug}`),
      label: tl(locale, 'toolCTA.comparator', { label: cat.label }),
      description: tl(locale, 'toolCTA.comparatorDesc', { label: cat.label.toLowerCase() }),
      cta: tl(locale, 'toolCTA.compareNow'),
      accentVar: categoryAccent(i),
    }
  })
  // Default tools — simulateur seulement si la page existe réellement.
  if (simulatorEnabled()) {
    tools['deals'] = {
      href: lp('/simulateur'),
      label: tl(locale, 'toolCTA.simulator'),
      description: tl(locale, 'toolCTA.simulatorDesc', { entity: nicheL(locale, 'entity') }),
      cta: tl(locale, 'toolCTA.useSimulator'),
      accentVar: 'var(--accent-1)',
    }
  }
  return tools
}

function buildFallback(locale: string): Tool {
  return {
    href: localePath(locale, '/comparer'),
    label: tl(locale, 'toolCTA.fallbackLabel'),
    description: tl(locale, 'toolCTA.fallbackDesc', { entities: nicheL(locale, 'entities') }),
    cta: tl(locale, 'toolCTA.compareNow'),
    accentVar: 'var(--accent-1)',
  }
}

type Props = { categorie: string; locale?: string }

export function ToolCTA({ categorie, locale = 'fr' }: Props) {
  const tools = buildTools(locale)
  const tool = tools[categorie] ?? buildFallback(locale)

  return (
    <Link
      href={tool.href}
      style={{ textDecoration: 'none', display: 'block', margin: 'var(--space-10) 0' }}
    >
      <div
        style={{
          borderLeft: `3px solid ${tool.accentVar}`,
          paddingLeft: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
        className="tool-card"
      >
        <p
          style={{
            fontFamily: 'var(--next-font-display), system-ui, sans-serif',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: tool.accentVar,
            margin: 0,
          }}
        >
          {tool.label}
        </p>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {tool.description}
        </p>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: tool.accentVar,
            margin: 0,
          }}
        >
          {tool.cta}
        </p>
      </div>
    </Link>
  )
}
