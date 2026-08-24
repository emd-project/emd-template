import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'
import type { NicheConfig } from '@/niche.config'

/**
 * tests/unit/niche-l10n.test.tsx — le CONTRAT de lib/niche-l10n.ts.
 *
 * Le premier bloc est un test de NON-RÉGRESSION, et c'est le plus important des
 * deux : le moteur est partagé par tous les forks, dont aucun n'a de bloc
 * `localized` au départ. Sans surcharge, chaque accesseur doit rendre EXACTEMENT
 * la valeur de base — donc exactement ce que le JSX rendait avant l'existence de
 * cette dimension de locale. Aucun avertissement, aucune chaîne vide, aucun
 * comportement conditionné à la locale demandée.
 */

// ─── 1. REPLI — la config réelle du template, qui n'a AUCUN bloc `localized` ───

describe('repli silencieux — sans bloc `localized` (contrat de non-régression)', () => {
  it('le template ne déclare aucune surcharge : c\'est la prémisse du test', async () => {
    const { niche } = await import('@/niche.config')
    expect(niche.localized).toBeUndefined()
  })

  it('nicheL rend la valeur de base pour TOUTE locale, connue ou non', async () => {
    const { niche } = await import('@/niche.config')
    const { nicheL } = await import('@/lib/niche-l10n')
    const keys = ['tagline', 'subtitle', 'heroPrefix', 'heroSuffix', 'entity', 'entities'] as const
    for (const key of keys) {
      for (const locale of ['fr', 'en', 'nl', 'xx', '']) {
        expect(nicheL(locale, key)).toBe(niche[key])
      }
      // Et jamais une chaîne vide là où la base est renseignée.
      expect(nicheL('en', key).length).toBeGreaterThan(0)
    }
  })

  it('rotatingWordsL et ctaTextL retombent aussi sur la base', async () => {
    const { niche } = await import('@/niche.config')
    const { rotatingWordsL, ctaTextL } = await import('@/lib/niche-l10n')
    expect(rotatingWordsL('en')).toEqual(niche.rotatingWords)
    expect(ctaTextL('en', 'ctaPrimary')).toBe(niche.ctaPrimary.text)
    expect(ctaTextL('en', 'ctaSecondary')).toBe(niche.ctaSecondary.text)
  })

  it('categoriesL rend le tableau de base, à l\'identique et sans copie', async () => {
    const { niche } = await import('@/niche.config')
    const { categoriesL } = await import('@/lib/niche-l10n')
    expect(categoriesL('en')).toBe(niche.categories)
    expect(categoriesL('fr')).toBe(niche.categories)
  })

  it('categoryLabelL sur un slug inconnu rend le slug — comportement historique', async () => {
    const { categoryLabelL } = await import('@/lib/niche-l10n')
    expect(categoryLabelL('en', 'slug-absent')).toBe('slug-absent')
    expect(categoryLabelL('fr', 'slug-absent')).toBe('slug-absent')
  })

  it('categoryLabelsL est identique à categoryLabels() de niche.config', async () => {
    const { categoryLabels } = await import('@/niche.config')
    const { categoryLabelsL } = await import('@/lib/niche-l10n')
    expect(categoryLabelsL('en')).toEqual(categoryLabels())
  })

  it('AU RENDU : le Footer EN affiche la tagline de base, pas une chaîne vide', async () => {
    const { niche } = await import('@/niche.config')
    render(<Footer locale="en" />)
    expect(screen.getByText(niche.tagline)).toBeInTheDocument()
  })
})

// ─── 2. SURCHARGE — sur une config injectée, catégories comprises ──────────────

/** Config minimale : seuls les champs lus par lib/niche-l10n.ts comptent ici. */
function fakeNiche(over: Partial<NicheConfig>): NicheConfig {
  const base = {
    defaultLocale: 'fr',
    tagline: 'Tagline FR',
    subtitle: 'Sous-titre FR',
    heroPrefix: 'Préfixe FR',
    heroSuffix: 'Suffixe FR',
    entity: 'entité',
    entities: 'entités',
    rotatingWords: ['un', 'deux'],
    ctaPrimary: { text: 'Comparer', url: '/comparer' },
    ctaSecondary: { text: 'Quiz', url: '/quiz' },
    categories: [
      { slug: 'auto', label: 'Voitures', accent: '#111' },
      { slug: 'moto', label: 'Motos', accent: '#222' },
    ],
    ...over,
  }
  // Le module ne lit que ces champs ; le reste de NicheConfig n'est pas sollicité.
  return base as unknown as NicheConfig
}

async function withNiche(over: Partial<NicheConfig>) {
  vi.resetModules()
  vi.doMock('@/niche.config', () => ({ niche: fakeNiche(over) }))
  return import('@/lib/niche-l10n')
}

afterEach(() => {
  vi.doUnmock('@/niche.config')
  vi.resetModules()
})

describe('surcharge par locale', () => {
  it('une surcharge non vide gagne, un champ absent retombe sur la base', async () => {
    const { nicheL } = await withNiche({
      localized: { en: { subtitle: 'EN subtitle' } },
    })
    expect(nicheL('en', 'subtitle')).toBe('EN subtitle')
    expect(nicheL('en', 'tagline')).toBe('Tagline FR')
  })

  it('une chaîne vide ou blanche ne remplace JAMAIS la base', async () => {
    const { nicheL, ctaTextL } = await withNiche({
      localized: { en: { subtitle: '', tagline: '   ', ctaPrimary: { text: '' } } },
    })
    expect(nicheL('en', 'subtitle')).toBe('Sous-titre FR')
    expect(nicheL('en', 'tagline')).toBe('Tagline FR')
    expect(ctaTextL('en', 'ctaPrimary')).toBe('Comparer')
  })

  it('une locale non déclarée retombe entièrement sur la base', async () => {
    const { nicheL, categoriesL } = await withNiche({
      localized: { en: { subtitle: 'EN subtitle' } },
    })
    expect(nicheL('nl', 'subtitle')).toBe('Sous-titre FR')
    expect(categoriesL('nl').map((c) => c.label)).toEqual(['Voitures', 'Motos'])
  })

  it('la locale par défaut IGNORE `localized` — la base reste la seule source FR', async () => {
    const { nicheL, categoryLabelL } = await withNiche({
      localized: { fr: { subtitle: 'NE DOIT PAS SORTIR', categories: { auto: 'NON' } } },
    })
    expect(nicheL('fr', 'subtitle')).toBe('Sous-titre FR')
    expect(categoryLabelL('fr', 'auto')).toBe('Voitures')
  })

  it('rotatingWordsL : liste vide ou n\'ayant que du blanc → base conservée', async () => {
    const empty = await withNiche({ localized: { en: { rotatingWords: [] } } })
    expect(empty.rotatingWordsL('en')).toEqual(['un', 'deux'])
    const blank = await withNiche({ localized: { en: { rotatingWords: ['  ', ''] } } })
    expect(blank.rotatingWordsL('en')).toEqual(['un', 'deux'])
    const real = await withNiche({ localized: { en: { rotatingWords: ['one'] } } })
    expect(real.rotatingWordsL('en')).toEqual(['one'])
  })
})

describe('libellés de catégories — indexés par SLUG, jamais par position', () => {
  const localized = { en: { categories: { auto: 'Cars', moto: 'Motorbikes' } } }

  it('traduit par slug et laisse l\'ordre, les accents et les slugs intacts', async () => {
    const { categoriesL } = await withNiche({ localized })
    expect(categoriesL('en')).toEqual([
      { slug: 'auto', label: 'Cars', accent: '#111' },
      { slug: 'moto', label: 'Motorbikes', accent: '#222' },
    ])
  })

  it('réordonner les catégories ne réaffecte AUCUNE traduction', async () => {
    const { categoryLabelL } = await withNiche({
      // Ordre inversé, même bloc `localized` : c'est le piège qu'un index
      // positionnel ferait passer en silence.
      categories: [
        { slug: 'moto', label: 'Motos', accent: '#222' },
        { slug: 'auto', label: 'Voitures', accent: '#111' },
      ],
      localized,
    })
    expect(categoryLabelL('en', 'moto')).toBe('Motorbikes')
    expect(categoryLabelL('en', 'auto')).toBe('Cars')
  })

  it('une catégorie sans entrée garde son libellé de base', async () => {
    const { categoryLabelL, categoryLabelsL } = await withNiche({
      localized: { en: { categories: { auto: 'Cars' } } },
    })
    expect(categoryLabelL('en', 'moto')).toBe('Motos')
    expect(categoryLabelsL('en')).toEqual({ auto: 'Cars', moto: 'Motos' })
  })
})
