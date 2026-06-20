/**
 * AISummarize — bloc "En bref" en haut d'article + liens "Résumer avec".
 * Résumé 3–5 bullets fournis dans le frontmatter MDX.
 * Liens vers ChatGPT, Claude, Mistral, Perplexity, Grok avec prompt pré-rempli,
 * rendus en pastilles outline discrètes (flèche ↗, pas d'icône brandée/emoji →
 * évite l'empreinte « widget IA »). Carte + eyebrow token-driven : s'adapte à la
 * DA de chaque site (couleur d'accent, bordure, radius).
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
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-6) var(--space-7)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 'var(--space-4)' }}>
        {tl(locale, 'aiSummary.title')}
      </div>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {points.map((point, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              fontSize: '15px',
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

      {/* « Résumer avec » — pastilles outline + flèche ↗ (pas d'emoji/brand) */}
      {showAiLinks && (
        <div
          style={{
            marginTop: 'var(--space-5)',
            paddingTop: 'var(--space-4)',
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
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {tl(locale, 'aiSummary.summarizeWith')}
          </span>
          {AI_PROVIDERS.map(({ name, urlTemplate }) => (
            <a
              key={name}
              href={urlTemplate.replace('{PROMPT}', encodedPrompt)}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="ai-provider-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '7px 15px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
            >
              {name}
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.55 }}
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </aside>
  )
}
