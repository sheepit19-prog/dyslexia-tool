import { describe, it, expect, beforeEach } from 'vitest'
import { buildTextLayer } from '../text-layer'
import type { PageViewport } from 'pdfjs-dist'

interface TextContent {
  items: Record<string, unknown>[]
  styles?: Record<string, unknown>
}

/**
 * Create a minimal PageViewport mock whose `transform` maps
 * PDF space → viewport space at the given scale.
 *
 * For a standard viewport with scale=1 and no rotation or offset:
 *   transform = [1, 0, 0, -1, 0, height]
 *
 * The y-component is negated because PDF y points up but viewport
 * y points down.
 */
function mockViewport(
  width = 612,
  height = 792,
  scale = 1,
): PageViewport {
  return {
    width: width * scale,
    height: height * scale,
    scale,
    rotation: 0,
    transform: [scale, 0, 0, -scale, 0, height * scale],
  } as PageViewport
}

/** A single horizontal text item (no rotation). */
function textItem(overrides: {
  str?: string
  x?: number
  y?: number
  fontSize?: number
  width?: number
  height?: number
  dir?: string
  fontName?: string
} = {}): TextContent['items'][number] {
  const { str = 'Hello', x = 50, y = 700, fontSize = 12, width = 30, height = 14, dir = 'ltr', fontName = 'g_font_1' } = overrides
  return {
    str,
    dir,
    transform: [fontSize, 0, 0, fontSize, x, y],
    width,
    height,
    fontName,
    hasEOL: false,
  }
}

describe('buildTextLayer', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
  })

  it('clears container and sets dimensions from viewport', () => {
    const vp = mockViewport(612, 792, 1)
    const tc: TextContent = {
      items: [textItem({ str: 'Hi', x: 10, y: 780 })],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    expect(container.style.width).toBe('612px')
    expect(container.style.height).toBe('792px')
    expect(container.children.length).toBe(1)
  })

  it('creates a span for each TextItem with correct text content', () => {
    const vp = mockViewport(612, 792, 1)
    const tc: TextContent = {
      items: [
        textItem({ str: 'Hello', x: 50, y: 700 }),
        textItem({ str: 'World', x: 100, y: 700 }),
      ],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    expect(container.children.length).toBe(2)
    const spans = container.querySelectorAll('span')
    expect(spans[0].textContent).toBe('Hello')
    expect(spans[1].textContent).toBe('World')
  })

  it('positions spans absolutely with correct left/top values', () => {
    const vp = mockViewport(612, 792, 1)
    // At scale=1, x=50 stays 50. y=700 (PDF coords) → viewport y = 792 - 700 = 92.
    // But top = f - fontSize where f = vt[1]*x + vt[3]*y + vt[5]
    // = 0*50 + (-1)*700 + 792 = 92.
    // And fontSize = sqrt(c² + d²) = sqrt(0² + (-12)²) = 12.
    // So top = 92 - 12 = 80.
    const tc: TextContent = {
      items: [textItem({ str: 'Test', x: 50, y: 700, fontSize: 12, height: 14 })],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    const span = container.querySelector('span')!
    expect(span.style.position).toBe('absolute')
    expect(span.style.left).toBe('50px')
    // top = f - fontSize: f = 92, fontSize = 12 → top = 80
    expect(span.style.top).toBe('80px')
    expect(span.style.fontSize).toBe('12px')
  })

  it('scales positions correctly with viewport scale=1.5', () => {
    const vp = mockViewport(612, 792, 1.5)
    // At scale=1.5: left = scale * x = 1.5 * 50 = 75
    // f = -1.5 * 700 + (792 * 1.5) = -1050 + 1188 = 138
    // fontSize = | -1.5 * 12 | = 18
    // top = 138 - 18 = 120
    const tc: TextContent = {
      items: [textItem({ str: 'Scaled', x: 50, y: 700, fontSize: 12, height: 14 })],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    const span = container.querySelector('span')!
    expect(span.style.left).toBe('75px')
    expect(span.style.top).toBe('120px')
    expect(span.style.fontSize).toBe('18px')
  })

  it('renders text invisible but selectable', () => {
    const vp = mockViewport()
    const tc: TextContent = {
      items: [textItem({ str: 'Select me' })],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    const span = container.querySelector('span')!
    expect(span.style.color).toBe('transparent')
    expect(span.style.pointerEvents).toBe('auto')
    // Text should be in the DOM and therefore selectable
    expect(span.textContent).toBe('Select me')
  })

  it('handles rotated text via CSS transform: rotate()', () => {
    const vp = mockViewport(612, 792, 1)
    // A rotation of ~30°: [cos30*12, sin30*12, -sin30*12, cos30*12, 50, 700]
    const cos30 = Math.cos(Math.PI / 6)
    const sin30 = Math.sin(Math.PI / 6)
    const fs = 12
    const tc: TextContent = {
      items: [
        {
          str: 'Rotated',
          dir: 'ltr',
          transform: [cos30 * fs, sin30 * fs, -sin30 * fs, cos30 * fs, 50, 700],
          width: 30,
          height: 14,
          fontName: 'g_font_1',
          hasEOL: false,
        },
      ],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    const span = container.querySelector('span')!
    expect(span.style.transform).toContain('rotate(')
    // Rotation angle should be approx -30° (-π/6 radians).
    // The sign is flipped because the viewport transform negates the
    // y axis (PDF y-up → viewport y-down).
    const match = span.style.transform.match(/rotate\(([-\d.]+)rad\)/)
    expect(match).not.toBeNull()
    const angle = parseFloat(match![1])
    expect(angle).toBeCloseTo(-Math.PI / 6, 1)
  })

  it('skips TextMarkedContent items', () => {
    const vp = mockViewport()
    const tc: TextContent = {
      items: [
        // TextMarkedContent — no `str` property
        { type: 'beginMarkedContent', tag: 'Artifact' } as any,
        textItem({ str: 'Visible text' }),
      ],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    expect(container.children.length).toBe(1)
    expect(container.querySelector('span')!.textContent).toBe('Visible text')
  })

  it('skips empty or whitespace-only text items', () => {
    const vp = mockViewport()
    const tc: TextContent = {
      items: [
        textItem({ str: '' }),
        textItem({ str: '   ' }),
        textItem({ str: 'Real' }),
      ],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    expect(container.children.length).toBe(1)
    expect(container.querySelector('span')!.textContent).toBe('Real')
  })

  it('renders empty container for zero text items', () => {
    const vp = mockViewport()
    const tc: TextContent = { items: [], styles: {} }

    buildTextLayer(tc, vp, container)

    expect(container.children.length).toBe(0)
    // Container dimensions should still be set
    expect(container.style.width).toBe('612px')
    expect(container.style.height).toBe('792px')
  })

  it('preserves text direction on spans', () => {
    const vp = mockViewport()
    const tc: TextContent = {
      items: [
        textItem({ str: 'LTR text', dir: 'ltr' }),
        textItem({ str: 'RTL text', dir: 'rtl' }),
      ],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    const spans = container.querySelectorAll('span')
    expect(spans[0].dir).toBe('ltr')
    expect(spans[1].dir).toBe('rtl')
  })

  it('uses fontName for fontFamily style', () => {
    const vp = mockViewport()
    const tc: TextContent = {
      items: [textItem({ str: 'Styled', fontName: 'TimesNewRoman' })],
      styles: {},
    }

    buildTextLayer(tc, vp, container)

    const span = container.querySelector('span')!
    expect(span.style.fontFamily).toBe('TimesNewRoman')
  })

  it('replaces children on subsequent calls', () => {
    const vp = mockViewport()
    const tc1: TextContent = {
      items: [textItem({ str: 'First' })],
      styles: {},
    }
    const tc2: TextContent = {
      items: [textItem({ str: 'Second' }), textItem({ str: 'Third' })],
      styles: {},
    }

    buildTextLayer(tc1, vp, container)
    expect(container.children.length).toBe(1)

    buildTextLayer(tc2, vp, container)
    expect(container.children.length).toBe(2)
    expect(container.querySelectorAll('span')[0].textContent).toBe('Second')
  })
})
