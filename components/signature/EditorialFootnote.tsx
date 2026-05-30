type EditorialFootnoteProps = {
  children: string
  label?: string
}

export function EditorialFootnote({ children, label }: EditorialFootnoteProps) {
  return (
    <aside
      className="editorial-footnote"
      role="note"
      style={{
        margin: 'var(--space-6) 0',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '2px solid var(--accent-4)',
        fontSize: '14px',
        lineHeight: 1.65,
        color: 'var(--text-secondary)',
      }}
    >
      {label && (
        <span
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-4)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {label}
        </span>
      )}
      {children}
    </aside>
  )
}
