/**
 * app/en/layout.tsx — Chrome de la section anglaise (/en/...).
 *
 * BLOC 2a (i18n) : arbre EN frère, disjoint des routes FR (app/(site)/).
 * La balise <html> reste détenue par app/layout.tsx (lang="fr") ; on pose ici
 * lang="en" via un conteneur `display: contents` qui n'introduit aucune boîte.
 *
 * Deux identités possibles, comme côté FR :
 *  - standard : Nav + Footer
 *  - `presse` : masthead + footer éditoriaux (familles Beauté & Mode).
 * Les composants presse déduisent la locale du pathname (usePathname → /en).
 */
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { PresseMasthead } from '@/components/presse/PresseMasthead'
import { PresseFooter } from '@/components/presse/PresseFooter'
import { PresseStyle } from '@/components/presse/PresseStyle'
import { isPresse } from '@/lib/variants'

export default function EnLayout({ children }: { children: React.ReactNode }) {
  const presse = isPresse()
  return (
    <div lang="en" style={{ display: 'contents' }}>
      {presse && <PresseStyle />}
      {presse ? <PresseMasthead /> : <Nav />}
      {children}
      {presse ? <PresseFooter /> : <Footer locale="en" />}
    </div>
  )
}
