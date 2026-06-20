import { describe, it, expect } from 'vitest'
import { niche } from '@/niche.config'
import frComparateurs from '@/content/data/comparateurs.json'
import enComparateurs from '@/content/data/comparateurs.en.json'
import frClassements from '@/content/data/classements.json'
import enClassements from '@/content/data/classements.en.json'

/**
 * Parité FR⇄EN des DONNÉES outils.
 *
 * Règle (cf. CLAUDE.md) : si la locale EN est active, les données EN des outils
 * DOIVENT couvrir le FR. Ce test échoue sinon — il fait partie du filtre qualité
 * (`vitest run`), donc un fork qui « oublie » de traduire les données casse la CI.
 */

type WithKeys = Record<string, { specsLabels?: Record<string, string>; modeles?: unknown[]; items?: unknown[]; criteria?: unknown[] }>

const enActive = niche.locales.includes('en')

describe('Parité FR⇄EN — données comparateur', () => {
  const fr = frComparateurs as WithKeys
  const en = enComparateurs as WithKeys
  const frKeys = Object.keys(fr)

  it.skipIf(!enActive || frKeys.length === 0)(
    'comparateurs.en.json couvre comparateurs.json (familles, specs, nb de modèles)',
    () => {
      for (const key of frKeys) {
        expect(en[key], `Famille comparateur "${key}" absente de comparateurs.en.json — TRADUIRE.`).toBeTruthy()
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

describe('Parité FR⇄EN — données classement', () => {
  const fr = frClassements as WithKeys
  const en = enClassements as WithKeys
  const frKeys = Object.keys(fr)

  it.skipIf(!enActive || frKeys.length === 0)(
    'classements.en.json couvre classements.json (familles, nb d\'items)',
    () => {
      for (const key of frKeys) {
        expect(en[key], `Classement "${key}" absent de classements.en.json — TRADUIRE.`).toBeTruthy()
        if (!en[key]) continue
        expect(
          (en[key].items ?? []).length,
          `Le nombre d'items du classement "${key}" diffère entre FR et EN.`
        ).toBe((fr[key].items ?? []).length)
      }
    }
  )
})
