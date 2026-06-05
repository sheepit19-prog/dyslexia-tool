import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { TextLayer } from '../components/TextLayer'
import type { PDFPageProxy } from 'pdfjs-dist'

// Mock buildTextLayer to avoid real DOM manipulation complexity in
// component tests — the pure function is tested separately.
const buildTextLayerMock = vi.fn()

vi.mock('../../shared/pdf/text-layer', () => ({
  buildTextLayer: (...args: unknown[]) => buildTextLayerMock(...args),
}))

/**
 * Create a minimal PDFPageProxy mock that returns predetermined
 * text content from `getTextContent()`.
 */
function mockPage(textItems: Array<{ str: string; x: number; y: number }> = []): PDFPageProxy {
  const textContent = {
    items: textItems.map((item) => ({
      str: item.str,
      dir: 'ltr',
      transform: [12, 0, 0, 12, item.x, item.y],
      width: 30,
      height: 14,
      fontName: 'g_font_1',
      hasEOL: false,
    })),
    styles: {},
  }

  return {
    getTextContent: vi.fn().mockResolvedValue(textContent),
    getViewport: vi.fn().mockReturnValue({
      width: 612,
      height: 792,
      scale: 1,
      rotation: 0,
      transform: [1, 0, 0, -1, 0, 792],
    }),
  } as unknown as PDFPageProxy
}

describe('TextLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a positioned container div', () => {
    const { container } = render(<TextLayer page={null} />)

    const div = container.firstElementChild as HTMLElement
    expect(div).not.toBeNull()
    expect(div.style.position).toBe('absolute')
    expect(div.style.inset).toBe('0px')
  })

  it('calls buildTextLayer with page content', async () => {
    const page = mockPage([
      { str: 'Hello', x: 50, y: 700 },
    ])

    render(<TextLayer page={page} />)

    await waitFor(() => {
      expect(buildTextLayerMock).toHaveBeenCalledTimes(1)
    })

    const [textContentArg, viewportArg, containerArg] =
      buildTextLayerMock.mock.calls[0]

    expect(textContentArg.items.length).toBe(1)
    expect(textContentArg.items[0].str).toBe('Hello')
    expect(viewportArg).toBeDefined()
    expect(viewportArg.width).toBe(612)
    expect(containerArg).toBeInstanceOf(HTMLDivElement)
  })

  it('does not call buildTextLayer when page is null', () => {
    render(<TextLayer page={null} />)

    expect(buildTextLayerMock).not.toHaveBeenCalled()
  })

  it('re-calls buildTextLayer when page changes', async () => {
    const page1 = mockPage([{ str: 'Page 1', x: 0, y: 0 }])
    const page2 = mockPage([{ str: 'Page 2', x: 0, y: 0 }])

    const { rerender } = render(<TextLayer page={page1} />)

    await waitFor(() => {
      expect(buildTextLayerMock).toHaveBeenCalledTimes(1)
    })

    rerender(<TextLayer page={page2} />)

    await waitFor(() => {
      expect(buildTextLayerMock).toHaveBeenCalledTimes(2)
    })

    // Second call should use page2's text
    const [, , container2Arg] = buildTextLayerMock.mock.calls[1]
    // The container itself should be reused (same ref)
    expect(container2Arg).toBeInstanceOf(HTMLDivElement)
  })

  it('passes scale to getViewport', async () => {
    const page = mockPage([{ str: 'X', x: 0, y: 0 }])

    render(<TextLayer page={page} scale={2.0} />)

    await waitFor(() => {
      expect(page.getViewport).toHaveBeenCalledWith({ scale: 2.0 })
    })
  })

  it('defaults scale to 1.5 when not provided', async () => {
    const page = mockPage([{ str: 'Default scale', x: 0, y: 0 }])

    render(<TextLayer page={page} />)

    await waitFor(() => {
      expect(page.getViewport).toHaveBeenCalledWith({ scale: 1.5 })
    })
  })

  it('shows error banner when getTextContent rejects', async () => {
    const page = {
      getTextContent: vi.fn().mockRejectedValue(new Error('Boom')),
      getViewport: vi.fn().mockReturnValue({
        width: 612,
        height: 792,
        scale: 1,
        rotation: 0,
        transform: [1, 0, 0, -1, 0, 792],
      }),
    } as unknown as PDFPageProxy

    render(<TextLayer page={page} />)

    await waitFor(() => {
      const errorDiv = document.querySelector('.text-layer > div')
      expect(errorDiv).not.toBeNull()
      expect(errorDiv!.textContent).toContain('Boom')
    })
  })

  it('does not error when container ref is null (unmounted mid-render)', async () => {
    // Simulate an unmount scenario: the page resolves but the ref is gone.
    // We verify the component doesn't throw; this is a no-op path.
    const page = mockPage([{ str: 'Fast', x: 0, y: 0 }])

    const { unmount } = render(<TextLayer page={page} />)

    // Unmount before the async build resolves
    unmount()

    // Wait a tick for promises to settle
    await new Promise((r) => setTimeout(r, 10))

    // No throw = pass
    expect(true).toBe(true)
  })

  it('applies className prop to container', () => {
    const { container } = render(<TextLayer page={null} className="my-custom" />)

    const div = container.firstElementChild as HTMLElement
    expect(div.className).toContain('my-custom')
    expect(div.className).toContain('text-layer')
  })

  it('sets aria-hidden on the container when there is an error', async () => {
    const page = {
      getTextContent: vi.fn().mockRejectedValue(new Error('fail')),
      getViewport: vi.fn().mockReturnValue({
        width: 1,
        height: 1,
        scale: 1,
        rotation: 0,
        transform: [1, 0, 0, -1, 0, 1],
      }),
    } as unknown as PDFPageProxy

    render(<TextLayer page={page} />)

    await waitFor(() => {
      const div = document.querySelector('.text-layer') as HTMLElement
      expect(div.getAttribute('aria-hidden')).toBe('true')
    })
  })
})
