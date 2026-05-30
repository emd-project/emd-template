import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthorByline } from '@/components/ui/AuthorByline'

describe('AuthorByline', () => {
  const baseProps = {
    authorSlug: 'test-author',
    authorName: 'Test Author',
    publishedAt: '2026-03-23',
  }

  it('affiche le nom de l\'auteur', () => {
    render(<AuthorByline {...baseProps} />)
    expect(screen.getByText('Test Author')).toBeInTheDocument()
  })

  it('le nom est un lien vers la page auteur', () => {
    render(<AuthorByline {...baseProps} />)
    const link = screen.getByRole('link', { name: 'Test Author' })
    expect(link.getAttribute('href')).toBe('/auteurs/test-author')
  })

  it('affiche la date de publication formatée en FR', () => {
    render(<AuthorByline {...baseProps} />)
    const time = document.querySelector('time')
    expect(time).toBeInTheDocument()
    expect(time?.getAttribute('datetime')).toBe('2026-03-23')
  })

  it('affiche le temps de lecture si fourni', () => {
    render(<AuthorByline {...baseProps} readingTimeMin={5} />)
    expect(screen.getByText('5 min de lecture')).toBeInTheDocument()
  })

  it('n\'affiche pas le temps de lecture si non fourni', () => {
    render(<AuthorByline {...baseProps} />)
    expect(screen.queryByText(/min de lecture/)).toBeNull()
  })

  it('affiche "Màj le" si updatedAt est différent de publishedAt', () => {
    render(
      <AuthorByline
        {...baseProps}
        updatedAt="2026-04-01"
      />
    )
    expect(screen.getByText(/Màj le/)).toBeInTheDocument()
  })

  it('accepte un nom d\'auteur personnalisé', () => {
    render(<AuthorByline {...baseProps} authorName="Jean" />)
    expect(screen.getByText('Jean')).toBeInTheDocument()
  })
})
