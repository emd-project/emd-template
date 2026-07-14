/**
 * HomeRouter — dispatch de la variante home + locale (Server Component).
 * `variant` explicite (routes preview /home-vN) sinon resolveHomeVariant() (config).
 *
 * NOTE — variante « comparateur » = design MARCHÉ (`MarcheHome`, porté de
 * `home-comparateur-marche.html`) : hero à orbites/chips, ticker, tableau du marché
 * (Top du classement), spotlight du n°1. C'est le design de référence des sites
 * comparateurs. L'ancien `ComparateurHome` (hero split + carte facture + steps) est
 * conservé dans le repo mais **n'est plus routé** (jugé trop faible / générique).
 * `marche` reste un alias du même rendu (route preview /home-v3).
 *
 * Le tableau du marché de `MarcheHome` est data-driven (`lib/classement`) et se masque
 * s'il n'y a aucun classement — depuis l'init, un classement seed est toujours écrit,
 * donc il s'affiche par défaut.
 */
import { MagazineHome } from '@/components/home/MagazineHome'
import { MarcheHome } from '@/components/home/MarcheHome'
import { FilHome } from '@/components/home/FilHome'
import { resolveHomeVariant, type HomeVariant } from '@/lib/variants'
import { niche } from '@/niche.config'

export function HomeRouter({ locale = niche.defaultLocale, variant }: { locale?: string; variant?: HomeVariant }) {
  const v = variant ?? resolveHomeVariant()
  if (v === 'comparateur' || v === 'marche') return <MarcheHome locale={locale} />
  if (v === 'fil') return <FilHome locale={locale} />
  return <MagazineHome locale={locale} />
}
