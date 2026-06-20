/**
 * AISummarize — bloc "En bref" en haut d'article + liens "Résumer avec".
 * Résumé 3–5 bullets fournis dans le frontmatter MDX.
 * Liens vers ChatGPT, Claude, Mistral, Perplexity, Grok avec prompt pré-rempli,
 * rendus en liens texte discrets (pas d'icônes/boutons brandés → évite l'empreinte
 * « widget IA » répétée sur tout le réseau). Tout est token-driven (s'adapte à la DA).
 * Server Component.
 */

import { niche } from '@/niche.config'
import { tl } from '@/lib/i18n'

// ── AI providers — vérifier les URLs périodiquement ──
const AI_PROVIDERS = [
  { name: 'ChatGPT', urlTemplate: 'https://chat.openai.com/?q={PROMPT}' },
  { name: 'Claude', urlTemplate: 'https://claude.ai/new?q={PROMPT}' },
  { name: 'Perplexity', urlTemplate: 'https://www.perplexity.ai/search?q={PROMPT}' },
  { name: 'Mistral', urlTemplate: 'https://chat.mistral.ai/chat?q={PROMPT}' },
  { name: 'Grok', urlTemplate: 'https://grok.com/?q={PROMPT}' },
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

      {/* Ligne discrète « Résumer avec » — liens texte, sans icône ni bouton brandé. */}
      {showAiLinks && (
        <p
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border)',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
          }}
        >
          {tl(locale, 'aiSummary.summarizeWith')}{' '}
          {AI_PROVIDERS.map(({ name, urlTemplate }, i) => (
            <span key={name}>
              <a
                href={urlTemplate.replace('{PROMPT}', encodedPrompt)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="ai-provider-link"
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                {name}
              </a>
              {i < AI_PROVIDERS.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}
    </aside>
  )
}
