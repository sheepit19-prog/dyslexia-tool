import { describe, it, expect } from 'vitest'
import type { PageViewport } from 'pdfjs-dist'
import { buildReadingParagraphs } from '../reading-text'

// Standard unrotated viewport: y-axis flipped, scale 1.
const viewport = {
  transform: [1, 0, 0, -1, 0, 792],
  width: 612,
  height: 792,
  scale: 1,
} as unknown as PageViewport

/**
 * Build a pdf.js-style TextItem at PDF coordinates (x, yPdf).
 * In viewport space this maps to x, y = 792 - yPdf, width unchanged.
 */
function item(
  str: string,
  x: number,
  yPdf: number,
  { fontSize = 12, width = str.length * 6 }: { fontSize?: number; width?: number } = {},
) {
  return {
    str,
    dir: 'ltr',
    width,
    height: fontSize,
    transform: [fontSize, 0, 0, fontSize, x, yPdf],
    fontName: 'g_f1',
  }
}

describe('buildReadingParagraphs', () => {
  it('returns an empty array for empty content', () => {
    expect(buildReadingParagraphs({ items: [] }, viewport)).toEqual([])
  })

  it('skips marked-content items without a str', () => {
    const content = {
      items: [
        { type: 'beginMarkedContent' },
        item('Hello', 50, 700),
        { type: 'endMarkedContent' },
      ],
    }
    expect(buildReadingParagraphs(content, viewport)).toEqual(['Hello'])
  })

  it('joins items on the same line, inserting a space across a word gap', () => {
    // "Hello" ends at x=80; "World" starts at x=90 → gap 10 > 12*0.25 → space
    const content = {
      items: [item('Hello', 50, 700), item('World', 90, 700)],
    }
    expect(buildReadingParagraphs(content, viewport)).toEqual(['Hello World'])
  })

  it('does not insert a space for a sub-threshold (kerning) gap', () => {
    // "Hello" ends at x=80; next starts at x=81 → gap 1 < 3 → no space
    const content = {
      items: [item('Hello', 50, 700), item('World', 81, 700)],
    }
    expect(buildReadingParagraphs(content, viewport)).toEqual(['HelloWorld'])
  })

  it('merges nearby lines into one paragraph', () => {
    // viewport y: 92 and 106 → delta 14 (< paragraph threshold) → same paragraph
    const content = {
      items: [item('First line', 50, 700), item('second line', 50, 686)],
    }
    expect(buildReadingParagraphs(content, viewport)).toEqual([
      'First line second line',
    ])
  })

  it('splits paragraphs on a large vertical gap', () => {
    // viewport y: 92, 106 (delta 14), 200 (delta 94) → break before line 3
    const content = {
      items: [
        item('Line one', 50, 700),
        item('line two', 50, 686),
        item('Far below', 50, 592),
      ],
    }
    expect(buildReadingParagraphs(content, viewport)).toEqual([
      'Line one line two',
      'Far below',
    ])
  })

  it('orders items top-to-bottom regardless of input order', () => {
    const content = {
      items: [item('Bottom', 50, 592), item('Top', 50, 700)],
    }
    // Top (y=92) is emitted before Bottom (y=200). With only two lines there is
    // a single line gap, so they stay in one paragraph — but in reading order.
    expect(buildReadingParagraphs(content, viewport)).toEqual(['Top Bottom'])
  })
})
