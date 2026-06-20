import { describe, it, expect } from 'vitest'
import { niche } from '@/niche.config'
import frComparateurs from '@/content/data/comparateurs.json'
import enComparateurs from '@/content/data/comparateurs.en.json'

/**
 * Parité FR⇄EN des DONNÉES outils.
 *
 * Règle (cf. CLAUDE.md) : si la locale EN est active, les données EN des outils
 * DOIVENT couvrir le FR. Ce test échoue sinon — il fait partie du filtre qualité
 * (`vitest run`), donc un fork qui « oublie » de traduire les données casse la CI.
 *
 * À étendre quand de nouvelles données outils localisables apparaissent
 * (quiz.yaml → quiz.en.yaml, produits, etc.).
 */

type Famille = {
  specsLabels?: Record<string, string>
  modeles?: unknown[]
}

const fr = frComparateurs as Record<string, Famille>
const en = enComparateurs as Record<string, Famille>
const enActive = niche.locales.includes('en')
const frKeys = Object.keys(fr)

describe('Parité FR⇄EN — données comparateur', () => {
  it.skipIf(!enActive || frKeys.length === 0)(
    'comparateurs.en.json couvre comparateurs.json (familles, specs, nb de modèles)',
    () => {
      for (const key of frKeys) {
        expect(
          en[key],
          `Famille comparateur "${key}" absente de comparateurs.en.json — TRADUIRE les données EN.`
        ).toBeTruthy()
        if (!en[key]) continue
        expect(
          Object.keys(en[key].specsLabels ?? {}).sort(),
          `Les specsLabels de "${key}" divergent entre FR et EN.`
        ).toEqual(Object.keys(fr[key].specsLabels ?? {}).sort())
        expect(
          (en[key].modeles ?? []).length,
          `Le nombre de modèles de "${key}" diffère entre FR et EN.`
        ).toBe((fr[key].modeles ?? []).length)
      }
    }
  )
})
