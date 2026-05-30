import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock niche.config to provide a test tag
vi.mock('@/niche.config', () => ({
  niche: {
    affiliateTag: 'test-tag-21',
    defaultStore: 'Amazon',
  },
}))

// Import after mock
const { addAffiliateTag } = await import('@/lib/utils/affiliate')

const TAG = 'test-tag-21'

describe('addAffiliateTag', () => {
  it('ajoute le tag sur amazon.fr', () => {
    const result = addAffiliateTag('https://www.amazon.fr/dp/B0CHX1W1XY')
    expect(result).toContain(`tag=${TAG}`)
  })

  it('ajoute le tag sur amazon.com', () => {
    const result = addAffiliateTag('https://www.amazon.com/dp/B0CHX1W1XY')
    expect(result).toContain(`tag=${TAG}`)
  })

  it('ajoute le tag sur amazon.co.uk', () => {
    const result = addAffiliateTag('https://www.amazon.co.uk/dp/B0CHX1W1XY')
    expect(result).toContain(`tag=${TAG}`)
  })

  it('ne modifie pas les URLs non-Amazon', () => {
    const url = 'https://example.com/product'
    expect(addAffiliateTag(url)).toBe(url)
  })

  it('remplace un tag existant', () => {
    const url = 'https://www.amazon.fr/dp/B0CHX1W1XY?tag=autre-tag-21'
    const result = addAffiliateTag(url)
    expect(result).toContain(`tag=${TAG}`)
    expect(result).not.toContain('tag=autre-tag-21')
  })

  it('supprime le paramètre ref', () => {
    const url = 'https://www.amazon.fr/dp/B0CHX1W1XY?ref=sr_1_1'
    const result = addAffiliateTag(url)
    expect(result).not.toContain('ref=')
    expect(result).toContain(`tag=${TAG}`)
  })

  it('gère les URLs invalides sans lever d\'erreur', () => {
    expect(addAffiliateTag('pas-une-url')).toBe('pas-une-url')
  })

  it('gère une chaîne vide', () => {
    expect(addAffiliateTag('')).toBe('')
  })

  it('conserve les autres paramètres de l\'URL', () => {
    const url = 'https://www.amazon.fr/dp/B0CHX1W1XY?color=noir&size=128gb'
    const result = addAffiliateTag(url)
    expect(result).toContain('color=noir')
    expect(result).toContain('size=128gb')
    expect(result).toContain(`tag=${TAG}`)
  })
})
