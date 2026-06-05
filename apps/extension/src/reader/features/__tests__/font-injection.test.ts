import { describe, it, expect, beforeEach } from 'vitest'
import { applyFontStyles, removeFontStyles } from '../font-injection'

describe('reader font-injection', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
  })

  it('applies font-family to the container', () => {
    applyFontStyles(container, {
      fontFamily: 'OpenDyslexic',
      lineSpacing: 1.6,
      letterSpacing: 0.05,
    })

    expect(container.style.fontFamily).toContain('OpenDyslexic')
  })

  it('applies line-height to the container', () => {
    applyFontStyles(container, {
      fontFamily: 'Arial',
      lineSpacing: 2.0,
      letterSpacing: 0.05,
    })

    expect(container.style.lineHeight).toBe('2')
  })

  it('applies letter-spacing to the container', () => {
    applyFontStyles(container, {
      fontFamily: 'Verdana',
      lineSpacing: 1.6,
      letterSpacing: 0.1,
    })

    expect(container.style.letterSpacing).toBe('0.1em')
  })

  it('marks the container as having fonts applied', () => {
    applyFontStyles(container, {
      fontFamily: 'OpenDyslexic',
      lineSpacing: 1.6,
      letterSpacing: 0.05,
    })

    expect(container.dataset.dyslexiaFontApplied).toBe('true')
  })

  it('skips font-family when "system" is specified', () => {
    applyFontStyles(container, {
      fontFamily: 'system',
      lineSpacing: 1.6,
      letterSpacing: 0.05,
    })

    expect(container.style.fontFamily).toBe('')
  })

  it('removeFontStyles clears all applied properties', () => {
    applyFontStyles(container, {
      fontFamily: 'OpenDyslexic',
      lineSpacing: 1.6,
      letterSpacing: 0.05,
    })

    removeFontStyles(container)

    expect(container.style.fontFamily).toBe('')
    expect(container.style.lineHeight).toBe('')
    expect(container.style.letterSpacing).toBe('')
    expect(container.dataset.dyslexiaFontApplied).toBeUndefined()
  })

  it('removeFontStyles is idempotent on a clean container', () => {
    // Should not throw
    removeFontStyles(container)
  })
})
