import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceTag } from '@/components/ui/PriceTag'

describe('PriceTag', () => {
  it('affiche le prix actuel', () => {
    render(<PriceTag price={899} />)
    expect(screen.getByLabelText(/Prix actuel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prix actuel/).textContent).toContain('899.00€')
  })

  it('affiche le prix barré si fourni', () => {
    render(<PriceTag price={799} priceOriginal={999} />)
    expect(screen.getByLabelText(/Prix habituel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prix habituel/).textContent).toContain('999.00€')
  })

  it('affiche le badge économie avec le bon pourcentage', () => {
    render(<PriceTag price={799} priceOriginal={999} />)
    // 799 vs 999 = ~20% de réduction
    const badge = screen.getByLabelText(/Économie/)
    expect(badge.textContent).toContain('20%')
  })

  it('n\'affiche pas le badge si showBadge=false', () => {
    render(<PriceTag price={799} priceOriginal={999} showBadge={false} />)
    expect(screen.queryByLabelText(/Économie/)).toBeNull()
  })

  it('n\'affiche pas de prix barré si priceOriginal absent', () => {
    render(<PriceTag price={799} />)
    expect(screen.queryByLabelText(/Prix habituel/)).toBeNull()
    expect(screen.queryByLabelText(/Économie/)).toBeNull()
  })

  it('utilise le symbole de devise par défaut €', () => {
    render(<PriceTag price={499} />)
    expect(screen.getByLabelText(/Prix actuel/).textContent).toContain('€')
  })

  it('arrondit correctement le pourcentage d\'économie', () => {
    // 899 vs 1199 = 25% arrondi
    render(<PriceTag price={899} priceOriginal={1199} />)
    const badge = screen.getByLabelText(/Économie/)
    expect(badge.textContent).toContain('25%')
  })
})
