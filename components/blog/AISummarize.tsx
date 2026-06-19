/**
 * AISummarize — bloc "En bref" en haut d'article + liens "Résumer avec IA".
 * Résumé 3–5 bullets fournis dans le frontmatter MDX.
 * Liens vers ChatGPT, Claude, Mistral, Perplexity, Grok avec prompt pré-rempli.
 * DA : border-left 3px --accent-1 (accent primaire du site) · bg --bg-surface ·
 * label Syne smallcaps. Tout est token-driven → s'adapte à la DA de chaque site.
 * Server Component.
 */

import { niche } from '@/niche.config'
import { tl } from '@/lib/i18n'

// ── AI providers — vérifier les URLs périodiquement ──
const AI_PROVIDERS = [
  { name: 'ChatGPT', urlTemplate: 'https://chat.openai.com/?q={PROMPT}', icon: '🤖' },
  { name: 'Claude', urlTemplate: 'https://claude.ai/new?q={PROMPT}', icon: '🟠' },
  { name: 'Perplexity', urlTemplate: 'https://www.perplexity.ai/search?q={PROMPT}', icon: '🔍' },
  { name: 'Mistral', urlTemplate: 'https://chat.mistral.ai/chat?q={PROMPT}', icon: '🌀' },
  { name: 'Grok', urlTemplate: 'https://grok.com/?q={PROMPT}', icon: '⚡' },
] as const

function buildPrompt(title: string, url: string, locale: string): string {
  return tl(locale, 'aiSummary.prompt', { domain: niche.domain, title, url })
}

type AISummarizeProps = {
  points: string[]
  articleTitle?: string
  articleUrl?: string
  /** Locale active (défaut fr). */
  locale?: string
}

export function AISummarize({ points, articleTitle, articleUrl, locale = 'fr' }: AISummarizeProps) {
  if (!points.length) return null

  const showAiLinks = articleTitle && articleUrl
  const prompt = showAiLinks ? buildPrompt(articleTitle, articleUrl, locale) : ''
  const encodedPrompt = encodeURIComponent(prompt)

  return (
    <aside
      aria-label={tl(locale, 'aiSummary.ariaLabel')}
      style={{
        background: 'var(--bg-surface)',
        borderLeft: '3px solid var(--accent-1)',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        padding: 'var(--space-5) var(--space-6)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          fontFamily: 'var(--next-font-display), system-ui, sans-serif',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent-1)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {tl(locale, 'aiSummary.title')}
      </div>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {points.map((point, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            <span
              style={{ color: 'var(--accent-1)', flexShrink: 0, fontWeight: 700 }}
              aria-hidden="true"
            >
              →
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* Liens "Résumer avec IA" */}
      {showAiLinks && (
        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            {tl(locale, 'aiSummary.summarizeWith')}
          </span>
          {AI_PROVIDERS.map(({ name, urlTemplate, icon }) => (
            <a
              key={name}
              href={urlTemplate.replace('{PROMPT}', encodedPrompt)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
              className="ai-provider-link"
            >
              <span style={{ fontSize: '13px' }}>{icon}</span>
              {name}
            </a>
          ))}
        </div>
      )}
    </aside>
  )
}
