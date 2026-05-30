import { getSession } from '@/packages/cms/lib/get-session'
import { redirect } from 'next/navigation'
import { SHORTCODE_DOCS } from '@/lib/content/shortcodes'
import { ShortcodesReference } from '@/packages/cms/components/ShortcodesReference'

export default async function ShortcodesPage() {
  const session = await getSession()
  if (!session) redirect('/admin')

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Référence
        </p>
        <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Shortcodes disponibles
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '62ch', lineHeight: 1.6 }}>
          Copiez-collez ces blocs dans vos articles pour intégrer produits, encarts et tableaux sans écrire de JSX.
        </p>
      </header>

      <ShortcodesReference docs={SHORTCODE_DOCS} />
    </div>
  )
}
