import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { PageCanvas } from '../components/PageCanvas'

// Mock usePdfPage to avoid real pdf.js rendering
const mockCanvasRef = { current: null as HTMLCanvasElement | null }

vi.mock('../hooks/usePdfPage', () => ({
  usePdfPage: vi.fn(() => ({
    canvasRef: mockCanvasRef,
    page: { pageIndex: 0 },
    rendering: false,
  })),
}))

import { usePdfPage } from '../hooks/usePdfPage'

const mockUsePdfPage = usePdfPage as ReturnType<typeof vi.fn>

// Minimal mock PDFDocumentProxy
function mockPdf() {
  return {
    numPages: 1,
    destroy: vi.fn(),
    getPage: vi.fn(),
    getData: vi.fn(),
    getDownloadInfo: vi.fn(),
    getMetadata: vi.fn(),
    getOutline: vi.fn(),
    getPermissions: vi.fn(),
    getJavaScript: vi.fn(),
    getAttachments: vi.fn(),
    getDestinations: vi.fn(),
    saveDocument: vi.fn(),
  } as any
}

describe('PageCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePdfPage.mockReturnValue({
      canvasRef: mockCanvasRef,
      page: { pageIndex: 0 },
      rendering: false,
    })
  })

  it('renders a canvas element', () => {
    render(<PageCanvas pdf={mockPdf()} pageNumber={1} />)

    // jsdom does not assign an implicit ARIA role to canvas elements
    const canvas = document.querySelector('canvas')
    expect(canvas).not.toBeNull()
  })

  it('passes pdf and pageNumber to usePdfPage', () => {
    const pdf = mockPdf()
    render(<PageCanvas pdf={pdf} pageNumber={2} scale={2.0} />)

    expect(mockUsePdfPage).toHaveBeenCalledWith(pdf, 2, 2.0)
  })

  it('defaults scale to 1.5 when not provided', () => {
    const pdf = mockPdf()

    // Minimal render to just check the hook args
    render(<PageCanvas pdf={pdf} pageNumber={1} />)

    expect(mockUsePdfPage).toHaveBeenCalledWith(pdf, 1, 1.5)
  })

  it('shows spinner overlay when rendering', () => {
    mockUsePdfPage.mockReturnValue({
      canvasRef: mockCanvasRef,
      page: { pageIndex: 0 },
      rendering: true,
    })

    const pdf = mockPdf()
    render(<PageCanvas pdf={pdf} pageNumber={1} />)

    // The rendering overlay should be present
    const overlay = document.querySelector('[aria-label="Rendering page"]')
    expect(overlay).not.toBeNull()
  })

  it('does not show spinner when not rendering', () => {
    mockUsePdfPage.mockReturnValue({
      canvasRef: mockCanvasRef,
      page: null,
      rendering: false,
    })

    const pdf = mockPdf()
    render(<PageCanvas pdf={pdf} pageNumber={1} />)

    const overlay = document.querySelector('[aria-label="Rendering page"]')
    expect(overlay).toBeNull()
  })

  it('handles null pdf gracefully', () => {
    mockUsePdfPage.mockReturnValue({
      canvasRef: mockCanvasRef,
      page: null,
      rendering: false,
    })

    render(<PageCanvas pdf={null} pageNumber={1} />)

    expect(mockUsePdfPage).toHaveBeenCalledWith(null, 1, 1.5)
  })
})
