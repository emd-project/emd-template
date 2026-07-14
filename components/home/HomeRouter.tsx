/**
 * HomeRouter — dispatch de la variante home + locale (Server Component).
 * `variant` explicite (routes preview /home-vN) sinon resolveHomeVariant() (config).
 *
 * 5 DESIGNS DISTINCTS (la variété inter-sites prime — anti-empreinte) :
 *  - `magazine`    → MagazineHome
 *  - `marche`      → MarcheHome (orbites/chips, ticker, tableau du marché, spotlight n°1)
 *  - `comparateur` → ComparateurHome (hero split + carte + steps + stats)
 *  - `fil`         → FilHome
 *  - `presse`      → PresseHome (identité éditoriale complète — Beauté & Mode)
 *
 * La PONDÉRATION et la FAMILLE (secteur) vivent dans `suggestVariants` /
 * `homeFamily` (lib/variants.ts), PAS ici : le routeur reste bête, une variante
 * = un rendu.
 */
import { MagazineHome } from '@/components/home/MagazineHome'
import { ComparateurHome } from '@/components/home/ComparateurHome'
import { MarcheHome } from '@/components/home/MarcheHome'
import { FilHome } from '@/components/home/FilHome'
import { PresseHome } from '@/components/presse/PresseHome'
import { resolveHomeVariant, type HomeVariant } from '@/lib/variants'
import { niche } from '@/niche.config'

export function HomeRouter({ locale = niche.defaultLocale, variant }: { locale?: string; variant?: HomeVariant }) {
  const v = variant ?? resolveHomeVariant()
  if (v === 'presse') return <PresseHome locale={locale} />
  if (v === 'comparateur') return <ComparateurHome locale={locale} />
  if (v === 'marche') return <MarcheHome locale={locale} />
  if (v === 'fil') return <FilHome locale={locale} />
  return <MagazineHome locale={locale} />
}
