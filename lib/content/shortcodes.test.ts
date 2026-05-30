import { describe, it, expect } from 'vitest'
import { processShortcodes } from './shortcodes'

describe('processShortcodes', () => {
  it('decode JSX encoded by WYSIWYG', () => {
    const input = '&lt;ProConTable pros="a|b" cons="c" /&gt;'
    const out = processShortcodes(input)
    expect(out).toContain('<ProConTable pros="a|b" cons="c" />')
  })

  it('expands shorthand [[product:slug]]', () => {
    const out = processShortcodes('[[product:aspirateur-x1]]')
    expect(out).toBe('<ProductCTA slug="aspirateur-x1" />')
  })

  it('expands inline [[stat …]]', () => {
    const out = processShortcodes('[[stat value="45 min" label="Autonomie"]]')
    expect(out).toBe('<StatCard value="45 min" label="Autonomie" />')
  })

  it('expands block [[tip …]]…[[/tip]]', () => {
    const out = processShortcodes('[[tip title="Conseil"]]\nContenu ici.\n[[/tip]]')
    expect(out).toContain('<Tip title="Conseil">')
    expect(out).toContain('Contenu ici.')
    expect(out).toContain('</Tip>')
  })

  it('expands block [[verdict]]…[[/verdict]]', () => {
    const out = processShortcodes('[[verdict title="Mon avis"]]\nSuper produit.\n[[/verdict]]')
    expect(out).toContain('<Verdict title="Mon avis">')
    expect(out).toContain('</Verdict>')
  })

  it('expands [[procon …]]', () => {
    const out = processShortcodes('[[procon pros="Bon|Pas cher" cons="Bruyant"]]')
    expect(out).toBe('<ProConTable pros="Bon|Pas cher" cons="Bruyant" />')
  })

  it('leaves native JSX untouched', () => {
    const input = '<StatCard value="test" />'
    expect(processShortcodes(input)).toBe(input)
  })

  it('ignores unknown aliases', () => {
    const input = '[[unknown attr="val"]]'
    expect(processShortcodes(input)).toBe(input)
  })

  it('handles multiple shortcodes', () => {
    const input = [
      '[[product:x1]]',
      '',
      '[[tip title="Astuce"]]',
      'Texte.',
      '[[/tip]]',
      '',
      '[[stat value="99%" label="Score"]]',
    ].join('\n')
    const out = processShortcodes(input)
    expect(out).toContain('<ProductCTA slug="x1" />')
    expect(out).toContain('<Tip title="Astuce">')
    expect(out).toContain('<StatCard value="99%" label="Score" />')
  })
})
