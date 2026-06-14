import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { ReadingView } from '../components/ReadingView'

function mockPdf(
  textItems: Array<{ str: string; x: number; y: number }>,
): PDFDocumentProxy {
  const textContent = {
    items: textItems.map((it) => ({
      str: it.str,
      dir: 'ltr',
      width: it.str.length * 6,
      height: 12,
      transform: [12, 0, 0, 12, it.x, it.y],
      fontName: 'g_f1',
    })),
  }
  const page = {
    getViewport: vi.fn().mockReturnValue({
      transform: [1, 0, 0, -1, 0, 792],
      width: 612,
      height: 792,
      scale: 1.5,
    }),
    getTextContent: vi.fn().mockResolvedValue(textContent),
  }
  return { getPage: vi.fn().mockResolvedValue(page) } as unknown as PDFDocumentProxy
}

describe('ReadingView', () => {
  it('renders extracted paragraphs as reflowed text', async () => {
    const pdf = mockPdf([
      { str: 'Hello', x: 50, y: 700 },
      { str: 'World', x: 90, y: 700 },
    ])

    const { getByTestId } = render(<ReadingView pdf={pdf} pageNumber={1} />)

    await waitFor(() => {
      expect(getByTestId('reading-view').textContent).toContain('Hello World')
    })
  })

  it('applies the dyslexia font family to the container', async () => {
    const pdf = mockPdf([{ str: 'Sample', x: 50, y: 700 }])

    const { getByTestId } = render(
      <ReadingView pdf={pdf} pageNumber={1} fontFamily="OpenDyslexic" />,
    )

    await waitFor(() => {
      const view = getByTestId('reading-view')
      expect(view.style.fontFamily).toBe('OpenDyslexic')
    })
  })

  it('produces <b> markup when bionic reading is enabled', async () => {
    const pdf = mockPdf([{ str: 'Reading', x: 50, y: 700 }])

    const { getByTestId } = render(
      <ReadingView pdf={pdf} pageNumber={1} bionicEnabled />,
    )

    await waitFor(() => {
      const view = getByTestId('reading-view')
      expect(view.querySelector('b')).not.toBeNull()
      expect(view.textContent).toContain('Reading')
    })
  })

  it('escapes HTML from PDF text (no injection via bionic markup)', async () => {
    const pdf = mockPdf([{ str: '<script>alert(1)</script>', x: 50, y: 700 }])

    const { getByTestId } = render(
      <ReadingView pdf={pdf} pageNumber={1} bionicEnabled />,
    )

    await waitFor(() => {
      const view = getByTestId('reading-view')
      // The literal text is shown; no real <script> element is created.
      expect(view.textContent).toContain('<script>alert(1)</script>')
      expect(view.querySelector('script')).toBeNull()
    })
  })

  it('reports no text for a page with no text items', async () => {
    const pdf = mockPdf([])
    const onTextContentExtracted = vi.fn()

    render(
      <ReadingView
        pdf={pdf}
        pageNumber={1}
        onTextContentExtracted={onTextContentExtracted}
      />,
    )

    await waitFor(() => {
      expect(onTextContentExtracted).toHaveBeenCalledWith(false)
    })
  })

  it('reports text present for a page with text items', async () => {
    const pdf = mockPdf([{ str: 'Content', x: 50, y: 700 }])
    const onTextContentExtracted = vi.fn()

    render(
      <ReadingView
        pdf={pdf}
        pageNumber={1}
        onTextContentExtracted={onTextContentExtracted}
      />,
    )

    await waitFor(() => {
      expect(onTextContentExtracted).toHaveBeenCalledWith(true)
    })
  })
})
