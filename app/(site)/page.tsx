import { MagazineHome } from '@/components/home/MagazineHome'
// import { ComparateurHome } from '@/components/home/ComparateurHome' // archétype comparateur (à venir)
import { niche } from '@/niche.config'

/**
 * Home — par défaut archétype « magazine » (structure Voltéo).
 * L'archétype comparateur (hero split + estimateur + table) arrivera via
 * `niche.style.hero === 'split'` quand ComparateurHome sera porté.
 */
export default function HomePage() {
  // if (niche.style.hero === 'split') return <ComparateurHome />
  void niche
  return <MagazineHome />
}
