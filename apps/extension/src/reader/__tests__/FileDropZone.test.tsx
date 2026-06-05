import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { FileDropZone } from '../components/FileDropZone'

// Setup mock FileReader before tests
const originalFileReader = globalThis.FileReader

function setupMockFileReader(resolveWith: ArrayBuffer | null = new ArrayBuffer(8)) {
  ;(globalThis as any).FileReader = class {
    onload: ((e: any) => void) | null = null
    onerror: (() => void) | null = null
    onabort: (() => void) | null = null
    result: ArrayBuffer | null = null

    readAsArrayBuffer(_file: File) {
      setTimeout(() => {
        if (resolveWith) {
          this.result = resolveWith
          this.onload?.({ target: { result: this.result } })
        } else {
          this.onerror?.()
        }
      }, 0)
    }
  }
}

function restoreFileReader() {
  ;(globalThis as any).FileReader = originalFileReader
}

describe('FileDropZone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMockFileReader(new ArrayBuffer(8))
  })

  afterEach(() => {
    restoreFileReader()
  })

  it('renders with default state showing drop prompt', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId, getByText } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')
    expect(zone).toBeDefined()
    expect(getByText(/drop pdf here or click to browse/i)).toBeDefined()
    expect(getByText(/only .pdf files are accepted/i)).toBeDefined()
  })

  it('has a hidden file input for click-to-browse', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const input = getByTestId('file-drop-input') as HTMLInputElement
    expect(input.type).toBe('file')
    expect(input.accept).toContain('.pdf')
    expect(input.accept).toContain('application/pdf')
  })

  it('shows drag-over visual state on dragover', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId, getByText } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')

    fireEvent.dragOver(zone)
    expect(getByText(/drop to open pdf/i)).toBeDefined()
    expect(zone.className).toContain('border-blue-400')
  })

  it('removes drag-over state on dragleave', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId, getByText } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')

    fireEvent.dragOver(zone)
    fireEvent.dragLeave(zone)

    expect(getByText(/drop pdf here or click to browse/i)).toBeDefined()
    expect(zone.className).toContain('border-gray-300')
  })

  it('accepts a valid PDF file on drop and calls onPdfLoaded', async () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')

    const file = new File(['dummy content'], 'test.pdf', {
      type: 'application/pdf',
    })

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    }

    fireEvent.drop(zone, { dataTransfer })

    await waitFor(() => {
      expect(onPdfLoaded).toHaveBeenCalledTimes(1)
    })

    expect(onPdfLoaded).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      'test.pdf',
    )
  })

  it('accepts a PDF file without MIME type but with .pdf extension', async () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')

    // File with no MIME type (empty string) but valid extension
    const file = new File(['dummy'], 'notes.PDF', {
      type: '',
    })

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    }

    fireEvent.drop(zone, { dataTransfer })

    await waitFor(() => {
      expect(onPdfLoaded).toHaveBeenCalledTimes(1)
    })
  })

  it('rejects a non-PDF file on drop', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId, getByText } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')

    const file = new File(['not a pdf'], 'image.png', {
      type: 'image/png',
    })

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    }

    fireEvent.drop(zone, { dataTransfer })

    expect(onPdfLoaded).not.toHaveBeenCalled()
    expect(getByText(/please drop a pdf file/i)).toBeDefined()
    expect(zone.className).toContain('border-red-400')
  })

  it('rejects a file with wrong extension even if MIME type is missing', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId, getByText } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')

    const file = new File(['content'], 'notes.txt', { type: '' })

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    }

    fireEvent.drop(zone, { dataTransfer })

    expect(onPdfLoaded).not.toHaveBeenCalled()
    expect(getByText(/please drop a pdf file/i)).toBeDefined()
  })

  it('handles empty file drop (no files)', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')

    // Empty file list
    const dataTransfer = {
      files: [] as File[],
      types: ['Files'],
    }

    fireEvent.drop(zone, { dataTransfer })

    expect(onPdfLoaded).not.toHaveBeenCalled()
    // Should remain in default state
    expect(zone.className).not.toContain('border-red-400')
    expect(zone.className).not.toContain('border-blue-400')
  })

  it('does not respond to drag/drop when disabled', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} disabled />,
    )

    const zone = getByTestId('file-drop-zone')

    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf',
    })

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    }

    fireEvent.dragOver(zone)
    fireEvent.drop(zone, { dataTransfer })

    expect(onPdfLoaded).not.toHaveBeenCalled()
    // Border should not turn blue on dragover
    expect(zone.className).toContain('border-gray-300')
  })

  it('triggers click-to-browse on click', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const zone = getByTestId('file-drop-zone')
    const input = getByTestId('file-drop-input') as HTMLInputElement

    const clickSpy = vi.fn()
    input.click = clickSpy

    fireEvent.click(zone)

    expect(clickSpy).toHaveBeenCalled()
  })

  it('accepts a PDF via the file input', async () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const input = getByTestId('file-drop-input') as HTMLInputElement

    const file = new File(['pdf content'], 'document.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onPdfLoaded).toHaveBeenCalledTimes(1)
    })

    expect(onPdfLoaded).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      'document.pdf',
    )
  })

  it('resets file input value after selection', async () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const input = getByTestId('file-drop-input') as HTMLInputElement

    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onPdfLoaded).toHaveBeenCalled()
    })

    // Input value should be reset
    expect(input.value).toBe('')
  })

  it('does not call onPdfLoaded when file input has no file', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone onPdfLoaded={onPdfLoaded} />,
    )

    const input = getByTestId('file-drop-input') as HTMLInputElement

    fireEvent.change(input, { target: { files: [] } })

    expect(onPdfLoaded).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const onPdfLoaded = vi.fn()
    const { getByTestId } = render(
      <FileDropZone
        onPdfLoaded={onPdfLoaded}
        className="my-custom-class"
      />,
    )

    const zone = getByTestId('file-drop-zone')
    expect(zone.className).toContain('my-custom-class')
  })
})
