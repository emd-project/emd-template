/**
 * HomeRouter — dispatch de la variante home + locale (Server Component).
 * `variant` explicite (routes preview /home-vN) sinon resolveHomeVariant() (config).
 */
import { MagazineHome } from '@/components/home/MagazineHome'
import { ComparateurHome } from '@/components/home/ComparateurHome'
import { MarcheHome } from '@/components/home/MarcheHome'
import { FilHome } from '@/components/home/FilHome'
import { resolveHomeVariant, type HomeVariant } from '@/lib/variants'
import { niche } from '@/niche.config'

export function HomeRouter({ locale = niche.defaultLocale, variant }: { locale?: string; variant?: HomeVariant }) {
  const v = variant ?? resolveHomeVariant()
  if (v === 'comparateur') return <ComparateurHome locale={locale} />
  if (v === 'marche') return <MarcheHome locale={locale} />
  if (v === 'fil') return <FilHome locale={locale} />
  return <MagazineHome locale={locale} />
}
