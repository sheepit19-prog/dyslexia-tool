import { describe, it, expect } from 'vitest'
import {
  generateSpellingSuggestions,
  levenshteinDistance,
  SNOOZE_DURATION,
  PAUSE_THRESHOLD,
  BACKSPACE_THRESHOLD,
} from '../shared/lib/companion-utils'

describe('generateSpellingSuggestions', () => {
  it('returns empty array for empty string', () => {
    expect(generateSpellingSuggestions('')).toEqual([])
  })

  it('returns empty array for single character', () => {
    expect(generateSpellingSuggestions('a')).toEqual([])
  })

  it('returns empty for correctly spelled words', () => {
    expect(generateSpellingSuggestions('apple')).toEqual([])
    expect(generateSpellingSuggestions('green')).toEqual([])
    expect(generateSpellingSuggestions('hello')).toEqual([])
    expect(generateSpellingSuggestions('world')).toEqual([])
  })

  it('returns empty for unknown words', () => {
    expect(generateSpellingSuggestions('xyzzy')).toEqual([])
    expect(generateSpellingSuggestions('asdfg')).toEqual([])
  })

  it('corrects common dyslexic misspellings', () => {
    expect(generateSpellingSuggestions('becuase')).toEqual(['because'])
    expect(generateSpellingSuggestions('recieve')).toEqual(['receive'])
    expect(generateSpellingSuggestions('beleive')).toEqual(['believe'])
    expect(generateSpellingSuggestions('seperate')).toEqual(['separate'])
    expect(generateSpellingSuggestions('definately')).toEqual(['definitely'])
    expect(generateSpellingSuggestions('thier')).toEqual(['their', 'there'])
    expect(generateSpellingSuggestions('freind')).toEqual(['friend'])
  })

  it('corrects transposition errors', () => {
    expect(generateSpellingSuggestions('taht')).toEqual(['that'])
    expect(generateSpellingSuggestions('jsut')).toEqual(['just'])
    expect(generateSpellingSuggestions('hte')).toEqual(['the'])
    expect(generateSpellingSuggestions('adn')).toEqual(['and'])
    expect(generateSpellingSuggestions('btu')).toEqual(['but'])
  })

  it('handles contractions', () => {
    expect(generateSpellingSuggestions('dont')).toEqual(["don't"])
    expect(generateSpellingSuggestions('cant')).toEqual(["can't"])
    expect(generateSpellingSuggestions('wont')).toEqual(["won't"])
  })

  it('suggests multiple options for ambiguous misspellings', () => {
    expect(generateSpellingSuggestions('thier').length).toBeGreaterThan(1)
    expect(generateSpellingSuggestions('form').length).toBeGreaterThan(1)
  })

  it('returns fuzzy matches for near-misses', () => {
    const suggestions = generateSpellingSuggestions('beacuse')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions).toContain('because')
  })

  it('returns fuzzy matches for phonetic misspellings', () => {
    const suggestions = generateSpellingSuggestions('definatly')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions).toContain('definitely')
  })
})

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0)
  })

  it('returns correct distance for single edits', () => {
    expect(levenshteinDistance('hte', 'the')).toBe(2)
    expect(levenshteinDistance('cat', 'car')).toBe(1)
  })

  it('returns correct distance for empty strings', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3)
    expect(levenshteinDistance('abc', '')).toBe(3)
    expect(levenshteinDistance('', '')).toBe(0)
  })

  it('returns correct distance for multi-edit words', () => {
    expect(levenshteinDistance('saturday', 'sunday')).toBe(3)
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
  })
})

describe('Companion constants', () => {
  it('snooze duration is 5 minutes', () => {
    expect(SNOOZE_DURATION).toBe(5 * 60 * 1000)
  })

  it('pause threshold is 10 seconds', () => {
    expect(PAUSE_THRESHOLD).toBe(10000)
  })

  it('backspace threshold is 3', () => {
    expect(BACKSPACE_THRESHOLD).toBe(3)
  })
})
