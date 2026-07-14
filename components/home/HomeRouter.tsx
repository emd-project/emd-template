/**
 * HomeRouter — dispatch de la variante home + locale (Server Component).
 * `variant` explicite (routes preview /home-vN) sinon resolveHomeVariant() (config).
 *
 * 4 DESIGNS RÉELLEMENT DISTINCTS (la variété inter-sites prime — anti-empreinte) :
 *  - `magazine`    → MagazineHome
 *  - `marche`      → MarcheHome (design « Marché », porté de home-comparateur-marche :
 *                    hero à orbites/chips, ticker, tableau du marché, spotlight du n°1)
 *  - `comparateur` → ComparateurHome (hero split + carte + steps + stats)
 *  - `fil`         → FilHome
 *
 * La PONDÉRATION du tirage vit dans `suggestVariants` (lib/variants.ts), PAS ici :
 * `marche` est tiré ~2× plus souvent que `comparateur` (2/3 vs 1/3 entre ces deux-là).
 * Le routeur, lui, reste bête : une variante = un rendu.
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
