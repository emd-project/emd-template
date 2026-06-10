import { MagazineHome } from '@/components/home/MagazineHome'
import { ComparateurHome } from '@/components/home/ComparateurHome'
import { niche } from '@/niche.config'

/**
 * Home — archétype piloté par niche.style.hero :
 *  - 'split'            → comparateur (hero split + outils)
 *  - 'centered'/'minimal' (défaut) → magazine (mosaïque éditoriale)
 */
export default function HomePage() {
  return niche.style.hero === 'split' ? <ComparateurHome /> : <MagazineHome />
}
