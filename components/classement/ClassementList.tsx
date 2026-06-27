/**
 * ClassementList — listicle « Top N » riche, piloté par la DA (asset GEO).
 * Server Component — 0 JS, tout en HTML rendu serveur (citable + SSR SEO).
 * 100% token-driven (var(--…)). Libellés passés par la page (locale-aware).
 */

import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Classement } from '@/lib/classement'

export type ClassementLabels = {
  tldr: string
  criteria: string
  methodology: string
  sources: string
  bestForPrefix: string
  pros: string
  cons: string
  comparatorCta: string
  quizCta: string
  tableTitle: string
  faqTitle: string
  model: string
  scoreLabel: string
  priceLabel: string
  bestForCol: string
}

type Props = {
  classement: Classement
  labels: ClassementLabels
  comparerHref?: string
  quizHref?: string
}

const card: CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
}

export function ClassementList({ classement, labels, comparerHref, quizHref }: Props) {
  const items = [...classement.items].sort((a, b) => a.rank - b.rank)
  const cols = '64px minmax(0, 1fr)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
      {/* TL;DR */}
      {classement.tldr && classement.tldr.length > 0 && (
        <aside aria-label={labels.tldr} style={{ ...card, padding: 'var(--space-6) var(--space-7)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-4)' }}>{labels.tldr}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {classement.tldr.map((t, i) => (
              <li key={i} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <span aria-hidden="true" style={{ color: 'var(--accent-1)', fontWeight: 700, flexShrink: 0 }}>→</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Liste classée */}
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', counterReset: 'rank' }}>
        {items.map((it) => (
          <li key={it.rank} style={{ ...card, display: 'grid', gridTemplateColumns: cols, overflow: 'hidden' }}>
            <div style={{ display: 'grid', placeItems: 'center', background: it.rank === 1 ? 'var(--accent-1)' : 'var(--bg-surface-2)', color: it.rank === 1 ? 'var(--bg-primary)' : 'var(--text-primary)', fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1 }}>
              {it.rank}
            </div>
            <div style={{ padding: 'var(--space-5) var(--space-6)', minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                {it.badge && (
                  <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--bg-primary)', background: 'var(--accent-1)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>{it.badge}</span>
                )}
                {it.bestFor && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{labels.bestForPrefix} {it.bestFor}</span>
                )}
                {it.score && (
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--next-font-mono), monospace', fontWeight: 700, fontSize: '15px', color: 'var(--accent-1)' }}>{it.score}</span>
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(18px, 2.4vw, 22px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, margin: '0 0 var(--space-2)' }}>
                {it.nom}{it.prix ? <span style={{ fontFamily: 'var(--next-font-mono), monospace', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 'var(--space-3)' }}>{it.prix}</span> : null}
              </h3>
              {it.verdict && <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-3)' }}>{it.verdict}</p>}
              {(it.pros?.length || it.cons?.length) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
                  {it.pros && it.pros.length > 0 && (
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent-3)', marginBottom: '4px' }}>{labels.pros}</div>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {it.pros.map((p, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '14px', position: 'relative' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, color: 'var(--accent-3)' }}>→</span>{p}</li>)}
                      </ul>
                    </div>
                  )}
                  {it.cons && it.cons.length > 0 && (
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent-1)', marginBottom: '4px' }}>{labels.cons}</div>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {it.cons.map((c, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '14px', position: 'relative' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, color: 'var(--accent-1)' }}>×</span>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Analyse long-form (GEO) : H2 en questions, answer-first (≥1000 mots avec intro + FAQ) */}
      {classement.sections && classement.sections.length > 0 && (
        <section aria-label="Analyse détaillée" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          {classement.sections.map((s, i) => (
            <div key={i}>
              <h2 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(18px, 2.4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, margin: '0 0 var(--space-3)' }}>{s.q}</h2>
              {s.body.split('\n\n').map((para, j) => (
                <p key={j} style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 var(--space-3)' }}>{para}</p>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* Tableau comparatif compact */}
      <section aria-label={labels.tableTitle}>
        <h2 style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(18px, 2.4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>{labels.tableTitle}</h2>
        <div style={{ ...card, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,1.4fr) repeat(3, minmax(90px,1fr))', minWidth: '520px' }}>
            {[labels.model, labels.scoreLabel, labels.priceLabel, labels.bestForCol].map((h, i) => (
              <div key={i} style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
            ))}
            {items.map((it) => (
              <div key={it.rank} style={{ display: 'contents' }}>
                <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{it.rank}. {it.nom}</div>
                <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px' }}>{it.score ?? '—'}</div>
                <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px' }}>{it.prix ?? '—'}</div>
                <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px' }}>{it.bestFor ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Méthodologie + critères + sources */}
      {(classement.criteria?.length || classement.methodology || classement.sources?.length) && (
        <section style={{ ...card, padding: 'var(--space-6) var(--space-7)' }}>
          {classement.criteria && classement.criteria.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>{labels.criteria}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {classement.criteria.map((c, i) => (
                  <span key={i} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '5px 13px' }}>{c}</span>
                ))}
              </div>
            </>
          )}
          {classement.methodology && (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{labels.methodology} : </strong>{classement.methodology}
            </p>
          )}
          {classement.sources && classement.sources.length > 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
              {labels.sources} : {classement.sources.map((s, i) => (
                <span key={i}>{i > 0 ? ' · ' : ''}{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>{s.label}</a> : s.label}</span>
              ))}
            </p>
          )}
        </section>
      )}

      {/* Maillage interne : comparateur + quiz */}
      {(comparerHref || quizHref) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {comparerHref && <Link href={comparerHref} className="btn btn-accent">{labels.comparatorCta}</Link>}
          {quizHref && <Link href={quizHref} className="btn btn-ghost">{labels.quizCta}</Link>}
        </div>
      )}

      {/* FAQ */}
      {classement.faq && classement.faq.length > 0 && (
        <section aria-labelledby="clt-faq">
          <h2 id="clt-faq" style={{ fontFamily: 'var(--next-font-display), system-ui, sans-serif', fontSize: 'clamp(18px, 2.4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>{labels.faqTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {classement.faq.map((f, i) => (
              <details key={i} style={{ ...card, padding: 'var(--space-4) var(--space-5)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{f.q}</summary>
                <p style={{ marginTop: 'var(--space-2)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
