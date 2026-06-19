/**
 * ToolCTA — bloc CTA vers un outil interactif du site.
 * Injecté automatiquement selon la catégorie de l'article.
 * Server Component.
 */
import Link from 'next/link'
import { niche, categoryAccent } from '@/niche.config'
import { tl } from '@/lib/i18n'

type Tool = {
  href: string
  label: string
  description: string
  cta: string
  accentVar: string
}

function buildTools(locale: string): Record<string, Tool> {
  const tools: Record<string, Tool> = {}
  niche.categories.forEach((cat, i) => {
    tools[cat.slug] = {
      href: `/comparer/${cat.slug}`,
      label: tl(locale, 'toolCTA.comparator', { label: cat.label }),
      description: tl(locale, 'toolCTA.comparatorDesc', { label: cat.label.toLowerCase() }),
      cta: tl(locale, 'toolCTA.compareNow'),
      accentVar: categoryAccent(i),
    }
  })
  // Default tools
  tools['deals'] = {
    href: '/simulateur',
    label: tl(locale, 'toolCTA.simulator'),
    description: tl(locale, 'toolCTA.simulatorDesc', { entity: niche.entity }),
    cta: tl(locale, 'toolCTA.useSimulator'),
    accentVar: 'var(--accent-1)',
  }
  return tools
}

function buildFallback(locale: string): Tool {
  return {
    href: '/comparer',
    label: tl(locale, 'toolCTA.fallbackLabel'),
    description: tl(locale, 'toolCTA.fallbackDesc', { entities: niche.entities }),
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
