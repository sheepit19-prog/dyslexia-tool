import { describe, it, expect, beforeEach } from 'vitest'
import { applyBionicToLayer, removeBionicFromLayer } from '../bionic-reading'

/**
 * Creates a text layer container with span children that simulate
 * the output of `buildTextLayer` from U3.
 */
function makeTextLayerContainer(
  spans: Array<{ text: string; attrs?: Record<string, string> }>,
): HTMLDivElement {
  const container = document.createElement('div')
  for (const { text, attrs } of spans) {
    const span = document.createElement('span')
    span.textContent = text
    span.style.color = 'transparent' // default from U3
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        span.setAttribute(key, value)
      }
    }
    container.appendChild(span)
  }
  return container
}

describe('reader bionic-reading', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = makeTextLayerContainer([
      { text: 'The quick brown fox' },
      { text: 'jumps over the lazy dog' },
    ])
  })

  it('applies bionic reading bold markup to all spans', () => {
    // "The" (3): 3*0.45=1.35→ceil=2 → <b>Th</b>e
    // "quick" (5): 5*0.45=2.25→ceil=3 → <b>qui</b>ck
    // "brown" (5): <b>bro</b>wn
    // "fox" (3):   <b>fo</b>x
    // "jumps" (5): <b>jum</b>ps
    // "over" (4):  4*0.45=1.8→ceil=2 → <b>ov</b>er
    // "the" (3):   <b>th</b>e
    // "lazy" (4):  <b>la</b>zy
    // "dog" (3):   <b>do</b>g
    applyBionicToLayer(container)

    const spans = container.querySelectorAll<HTMLSpanElement>('span')
    expect(spans[0].innerHTML).toBe('<b>Th</b>e <b>qui</b>ck <b>bro</b>wn <b>fo</b>x')
    expect(spans[1].innerHTML).toBe('<b>jum</b>ps <b>ov</b>er <b>th</b>e <b>la</b>zy <b>do</b>g')
  })

  it('makes spans visible by setting explicit color', () => {
    applyBionicToLayer(container)

    const spans = container.querySelectorAll<HTMLSpanElement>('span')
    for (const span of spans) {
      expect(span.style.color).toBe('rgb(0, 0, 0)')
    }
  })

  it('marks each span as bionic-applied', () => {
    applyBionicToLayer(container)

    const spans = container.querySelectorAll<HTMLSpanElement>('span')
    for (const span of spans) {
      expect(span.dataset.dyslexiaBionicApplied).toBe('true')
    }
  })

  it('stores original text in a data attribute', () => {
    applyBionicToLayer(container)

    const spans = container.querySelectorAll<HTMLSpanElement>('span')
    expect(spans[0].dataset.dyslexiaBionicOriginal).toBe('The quick brown fox')
    expect(spans[1].dataset.dyslexiaBionicOriginal).toBe('jumps over the lazy dog')
  })

  it('removeBionicFromLayer restores original text content', () => {
    applyBionicToLayer(container)
    removeBionicFromLayer(container)

    const spans = container.querySelectorAll<HTMLSpanElement>('span')
    expect(spans[0].textContent).toBe('The quick brown fox')
    expect(spans[1].textContent).toBe('jumps over the lazy dog')
  })

  it('removeBionicFromLayer resets color to transparent', () => {
    applyBionicToLayer(container)
    removeBionicFromLayer(container)

    const spans = container.querySelectorAll<HTMLSpanElement>('span')
    for (const span of spans) {
      expect(span.style.color).toBe('transparent')
    }
  })

  it('removeBionicFromLayer clears data attributes', () => {
    applyBionicToLayer(container)
    removeBionicFromLayer(container)

    const spans = container.querySelectorAll<HTMLSpanElement>('span')
    for (const span of spans) {
      expect(span.dataset.dyslexiaBionicApplied).toBeUndefined()
      expect(span.dataset.dyslexiaBionicOriginal).toBeUndefined()
    }
  })

  it('applyBionicToLayer is idempotent', () => {
    applyBionicToLayer(container)
    const afterFirst = container.querySelector('span')!.innerHTML

    applyBionicToLayer(container)
    const afterSecond = container.querySelector('span')!.innerHTML

    expect(afterSecond).toBe(afterFirst)
  })

  it('handles empty container gracefully', () => {
    const empty = document.createElement('div')
    expect(() => applyBionicToLayer(empty)).not.toThrow()
    expect(() => removeBionicFromLayer(empty)).not.toThrow()
  })

  it('passes custom ratio through to the shared function', () => {
    // ratio=0.5: "quick" length=5, 5*0.5=2.5→ceil=3, first 3 bold
    applyBionicToLayer(container, 0.5)

    const firstSpan = container.querySelector<HTMLSpanElement>('span')!
    expect(firstSpan.innerHTML).toBe('<b>Th</b>e <b>qui</b>ck <b>bro</b>wn <b>fo</b>x')
  })

  it('span with only short words is unchanged but still made visible', () => {
    const short = makeTextLayerContainer([{ text: 'a b c' }])
    applyBionicToLayer(short)

    const span = short.querySelector<HTMLSpanElement>('span')!
    expect(span.textContent).toBe('a b c')
    expect(span.style.color).toBe('rgb(0, 0, 0)')
    expect(span.dataset.dyslexiaBionicApplied).toBe('true')
  })

  it('removeBionicFromLayer only affects bionic-applied spans', () => {
    // Apply bionic to the container first
    applyBionicToLayer(container)

    // Add a non-bionic span AFTER bionic was applied
    const extraSpan = document.createElement('span')
    extraSpan.textContent = 'untouched'
    extraSpan.style.color = 'green'
    container.appendChild(extraSpan)

    // remove should only touch spans with the bionic data attribute
    removeBionicFromLayer(container)

    expect(extraSpan.style.color).toBe('green')
    expect(extraSpan.dataset.dyslexiaBionicApplied).toBeUndefined()
  })
})
