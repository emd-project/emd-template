/**
 * app/en/layout.tsx — Chrome de la section anglaise (/en/...).
 *
 * BLOC 2a (i18n) : arbre EN frère, disjoint des routes FR (app/(site)/).
 * Réutilise le MÊME chrome que le FR (Nav + Footer) pour rester additif et
 * compiler sans dette. La balise <html> reste détenue par app/layout.tsx
 * (lang="fr") ; on pose ici lang="en" via un conteneur `display: contents`
 * qui n'introduit aucune boîte dans le flux (le chrome Voltéo reste intact).
 *
 * Libellés EN : la Nav déduit la locale du path (usePathname → /en) ; le Footer
 * est un Server Component, on lui passe donc `locale="en"` EXPLICITEMENT.
 */
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" style={{ display: 'contents' }}>
      <Nav />
      {children}
      <Footer locale="en" />
    </div>
  )
}
