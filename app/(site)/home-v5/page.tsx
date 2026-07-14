import type { Metadata } from 'next'
import { HomeRouter } from '@/components/home/HomeRouter'
import { PresseStyle } from '@/components/presse/PresseStyle'

/**
 * Preview variante home « Presse » (identité éditoriale). noindex — supprimé à
 * l'init du site.
 *
 * `PresseStyle` est monté ICI : sur un site NON-presse, le layout ne l'injecte pas
 * et les grilles (.presse-une, .presse-body…) n'existeraient pas → la preview
 * s'afficherait à plat. Le <style> est idempotent si le layout l'a déjà monté.
 */
export const metadata: Metadata = {
  title: 'Preview — Home Presse',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV5() {
  return (
    <>
      <PresseStyle />
      <HomeRouter locale="fr" variant="presse" />
    </>
  )
}
