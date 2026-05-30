'use client'

type SeoScoreProps = {
  title: string
  description: string
  body: string
  faq: unknown[]
}

type Check = {
  label: string
  ok: boolean
  detail: string
}

function analyze({ title, description, body, faq }: SeoScoreProps): Check[] {
  const titleLen = title.length
  const descLen = description.length
  const wordCount = body.split(/\s+/).filter(Boolean).length
  const h2Count = (body.match(/^##\s/gm) ?? []).length
  const hasShortcodes = /\[\[/.test(body) || /<[A-Z]/.test(body)
  const faqCount = Array.isArray(faq) ? faq.length : 0

  return [
    {
      label: 'Titre',
      ok: titleLen >= 30 && titleLen <= 65,
      detail: `${titleLen} car. (idéal : 30-65)`,
    },
    {
      label: 'Meta description',
      ok: descLen >= 80 && descLen <= 160,
      detail: `${descLen} car. (idéal : 80-160)`,
    },
    {
      label: 'Longueur contenu',
      ok: wordCount >= 300,
      detail: `${wordCount} mots (min. 300)`,
    },
    {
      label: 'Structure H2',
      ok: h2Count >= 3,
      detail: `${h2Count} sous-titre${h2Count > 1 ? 's' : ''} (min. 3)`,
    },
    {
      label: 'Composants MDX',
      ok: hasShortcodes,
      detail: hasShortcodes ? 'Shortcodes ou composants détectés' : 'Aucun composant interactif',
    },
    {
      label: 'FAQ',
      ok: faqCount >= 3,
      detail: `${faqCount} question${faqCount > 1 ? 's' : ''} (min. 3)`,
    },
  ]
}

export function SeoScore(props: SeoScoreProps) {
  const checks = analyze(props)
  const passed = checks.filter((c) => c.ok).length
  const total = checks.length
  const pct = Math.round((passed / total) * 100)

  const color = pct >= 80 ? '#3DFFC0' : pct >= 50 ? '#FFD23F' : '#FF3D57'

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#aaa' }}>Score SEO</span>
        <span style={{ fontSize: 15, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
      </div>

      <div style={{ height: 4, background: '#1C1C26', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 300ms ease' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {checks.map((check) => (
          <div key={check.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, background: check.ok ? 'rgba(61,255,192,0.12)' : 'rgba(255,61,87,0.12)', color: check.ok ? '#3DFFC0' : '#FF3D57' }}>
              {check.ok ? '✓' : '✗'}
            </span>
            <span style={{ color: '#9090A8', fontWeight: 500 }}>{check.label}</span>
            <span style={{ marginLeft: 'auto', color: '#55556A', fontSize: 11 }}>{check.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
