/**
 * HomeRouter — dispatch de la variante home + locale (Server Component).
 * `variant` explicite (routes preview /home-vN) sinon resolveHomeVariant() (config).
 *
 * DEUX SQUELETTES, ET C'EST TOUT (décision du 2026-08-02, cf. lib/variants.ts) :
 *  - `marche`    → MarcheHome (orbites/chips, ticker, tableau du marché, spotlight n°1)
 *                  pour les services souscriptibles (assurance, banque, énergie, télécom)
 *  - `magazine`  → MagazineHome (mosaïque éditoriale) — tout le reste, et repli
 *
 * Retirées : `comparateur`, `fil`, `presse`. La divergence inter-sites passe
 * désormais par la PEAU (palette, typo, permutations shape/border/shadow).
 *
 * La PONDÉRATION et la FAMILLE (secteur) vivent dans `suggestVariants` /
 * `homeFamily` (lib/variants.ts), PAS ici : le routeur reste bête, une variante
 * = un rendu.
 */
import { MagazineHome } from '@/components/home/MagazineHome'
import { MarcheHome } from '@/components/home/MarcheHome'
import { resolveHomeVariant, type HomeVariant } from '@/lib/variants'
import { niche } from '@/niche.config'

export function HomeRouter({ locale = niche.defaultLocale, variant }: { locale?: string; variant?: HomeVariant }) {
  const v = variant ?? resolveHomeVariant()
  if (v === 'marche') return <MarcheHome locale={locale} />
  return <MagazineHome locale={locale} />
}
