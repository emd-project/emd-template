/**
 * SiteLayout — shell FR. Deux identités possibles :
 *  - standard  : Nav + Footer
 *  - `presse`  : masthead éditorial (wordmark sérif centré + nav catégories sticky)
 *                + footer éditorial + grilles presse. Activée quand
 *                `niche.layouts.home === 'presse'` (familles Beauté & Mode).
 *                Cf. lib/variants.ts (`isPresse`).
 */
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { PresseMasthead } from '@/components/presse/PresseMasthead'
import { PresseFooter } from '@/components/presse/PresseFooter'
import { PresseStyle } from '@/components/presse/PresseStyle'
import { isPresse } from '@/lib/variants'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const presse = isPresse()
  return (
    <>
      {presse && <PresseStyle />}
      {presse ? <PresseMasthead /> : <Nav />}
      {children}
      {presse ? <PresseFooter /> : <Footer />}
    </>
  )
}
