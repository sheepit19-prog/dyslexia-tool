import { describe, it, expect } from 'vitest'
import { applyBionicReading } from '../bionic-reading'

describe('applyBionicReading', () => {
  it('returns empty string unchanged', () => {
    expect(applyBionicReading('')).toBe('')
  })

  it('returns whitespace-only text unchanged', () => {
    expect(applyBionicReading('   \t\n  ')).toBe('   \t\n  ')
  })

  it('does not modify short words (1–2 characters)', () => {
    expect(applyBionicReading('a')).toBe('a')
    expect(applyBionicReading('to be or if')).toBe('to be or if')
  })

  it('bionic-ifies a single 3-letter word with ratio 0.45', () => {
    // 3 * 0.45 = 1.35 → ceil=2, so first 2 chars bold
    expect(applyBionicReading('the')).toBe('<b>th</b>e')
  })

  it('bionic-ifies a single 4-letter word with ratio 0.45', () => {
    // 4 * 0.45 = 1.8 → ceil=2, first 2 chars bold
    expect(applyBionicReading('this')).toBe('<b>th</b>is')
  })

  it('bionic-ifies a single 5-letter word with ratio 0.45', () => {
    // 5 * 0.45 = 2.25 → ceil=3, first 3 chars bold
    expect(applyBionicReading('quick')).toBe('<b>qui</b>ck')
  })

  it('bionic-ifies a sentence with mixed word lengths', () => {
    const result = applyBionicReading('The quick brown fox')
    expect(result).toBe('<b>Th</b>e <b>qui</b>ck <b>bro</b>wn <b>fo</b>x')
  })

  it('respects custom ratio', () => {
    // ratio=0.3: "reading" length=7, 7*0.3=2.1→ceil=3, first 3 bold
    expect(applyBionicReading('reading', 0.3)).toBe('<b>rea</b>ding')
  })

  it('ratio=1.0 bolds entire word', () => {
    // "hello" length=5, 5*1.0=5→ceil=5, all 5 bold
    expect(applyBionicReading('hello world', 1.0)).toBe('<b>hello</b> <b>world</b>')
  })

  it('preserves existing punctuation', () => {
    const result = applyBionicReading('Hello, world!')
    expect(result).toBe('<b>Hel</b>lo, <b>wor</b>ld!')
  })

  it('preserves newlines and spacing', () => {
    // "Line" (4): 4*0.45=1.8→ceil=2 → <b>Li</b>ne
    // "one" (3):   3*0.45=1.35→ceil=2 → <b>on</b>e
    // "two" (3):   <b>tw</b>o
    // "New" (3):   <b>Ne</b>w
    // "paragraph" (9): 9*0.45=4.05→ceil=5 → <b>parag</b>raph
    const result = applyBionicReading('Line one\nLine two.\n\nNew paragraph.')
    expect(result).toBe('<b>Li</b>ne <b>on</b>e\n<b>Li</b>ne <b>tw</b>o.\n\n<b>Ne</b>w <b>parag</b>raph.')
  })

  it('handles multiple consecutive spaces', () => {
    const result = applyBionicReading('hello    world')
    expect(result).toBe('<b>hel</b>lo    <b>wor</b>ld')
  })

  it('handles text with only short words', () => {
    expect(applyBionicReading('I am to go')).toBe('I am to go')
  })

  it('produces identical output to content script algorithm for common words', () => {
    // The original content script uses the same logic:
    //   splitAt = Math.max(1, Math.ceil(word.length * 0.45))
    // Just with different wrapping.
    const words = [
      'Accessibility',
      'Dyslexic',
      'Readability',
      'Extension',
      'Chrome',
      'PDF',
      'Text',
      'Processing',
    ]
    for (const word of words) {
      const splitAt = Math.max(1, Math.ceil(word.length * 0.45))
      const bold = word.slice(0, splitAt)
      const rest = word.slice(splitAt)
      const expected = `<b>${bold}</b>${rest}`
      expect(applyBionicReading(word)).toBe(expected)
    }
  })
})
