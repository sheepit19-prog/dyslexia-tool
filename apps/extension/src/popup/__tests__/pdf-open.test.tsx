import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'

// Mock the background storage module before importing App
vi.mock('../background/storage', () => ({
  getNotes: vi.fn().mockResolvedValue([]),
  addNote: vi.fn(),
  deleteNote: vi.fn(),
  getNoteAudio: vi.fn(),
  getNotesCount: vi.fn().mockResolvedValue(0),
}))

// Mock the messages module
vi.mock('../shared/types/messages', () => ({
  sendTabMessage: vi.fn().mockResolvedValue(undefined),
  sendMessage: vi.fn().mockResolvedValue(undefined),
}))

// Mock the Onboarding component to simplify test (skip onboarding screen)
vi.mock('./Onboarding', () => ({
  Onboarding: ({ onComplete }: { onComplete: () => void }) => {
    // Immediately complete onboarding to render main UI
    onComplete()
    return null
  },
}))

// Setup mock FileReader for the popup test
const originalFileReader = globalThis.FileReader

function setupFileReader(resolves = true) {
  ;(globalThis as any).FileReader = class {
    onload: ((e: any) => void) | null = null
    onerror: (() => void) | null = null
    result: ArrayBuffer | null = null

    readAsArrayBuffer(_file: File) {
      setTimeout(() => {
        if (resolves) {
          this.result = new ArrayBuffer(8)
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

import { App } from '../App'

describe('Popup PDF open flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: onboarding already complete, settings loaded
    ;(chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (key: string | string[] | Record<string, any>) => {
        const keys = Array.isArray(key) ? key : [key]
        const result: Record<string, any> = {}
        if (keys.includes('settings')) {
          result.settings = {
            id: 'global',
            fontEnabled: false,
            fontFamily: 'OpenDyslexic',
            lineSpacing: 1.6,
            letterSpacing: 0.05,
            bionicReadingEnabled: false,
            spellingEnabled: false,
            theme: 'light',
            accentColor: '#3B82F6',
            ttsSpeed: 1.0,
            analyticsEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }
        if (keys.includes('onboardingComplete')) {
          result.onboardingComplete = true
        }
        return Promise.resolve(result)
      },
    )

    // Mock session storage
    ;(chrome.storage.session.set as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    )
    ;(chrome.storage.session.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      {},
    )
    ;(
      chrome.storage.session.remove as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined)

    // Mock tabs.create
    ;(chrome.tabs.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 999,
    })

    // Mock runtime.getURL
    ;(chrome.runtime.getURL as ReturnType<typeof vi.fn>).mockReturnValue(
      'chrome-extension://test-id/reader/index.html',
    )

    setupFileReader(true)
  })

  afterEach(() => {
    restoreFileReader()
  })

  it('renders the "Open PDF" button in the main popup UI', async () => {
    const { getByLabelText, queryByTestId } = render(<App />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByTestId('onboarding')).toBeNull()
    })

    const openButton = getByLabelText('Open PDF file')
    expect(openButton).toBeDefined()
    expect(openButton.textContent).toBe('Open PDF')
  })

  it('renders a hidden file input for PDF selection', async () => {
    const { container } = render(<App />)

    await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="file"]')
      expect(inputs.length).toBeGreaterThan(0)
    })

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    expect(fileInput.accept).toContain('.pdf')
    expect(fileInput.accept).toContain('application/pdf')
  })

  it('opens file picker when "Open PDF" button is clicked', async () => {
    const { getByLabelText, container } = render(<App />)

    await waitFor(() => {
      const button = getByLabelText('Open PDF file')
      expect(button).toBeDefined()
    })

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    const clickSpy = vi.fn()
    fileInput.click = clickSpy

    fireEvent.click(getByLabelText('Open PDF file'))

    expect(clickSpy).toHaveBeenCalled()
  })

  it('stores file in session storage and opens reader tab on file selection', async () => {
    const { getByLabelText, container } = render(<App />)

    await waitFor(() => {
      const button = getByLabelText('Open PDF file')
      expect(button).toBeDefined()
    })

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    const file = new File(['pdf content bytes'], 'my-document.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(fileInput, { target: { files: [file] } })

    // Wait for the async file reading and storage operations
    await waitFor(() => {
      expect(chrome.storage.session.set).toHaveBeenCalledWith(
        expect.objectContaining({
          pdfBuffer: expect.any(ArrayBuffer),
          pdfName: 'my-document.pdf',
        }),
      )
    })

    expect(chrome.runtime.getURL).toHaveBeenCalledWith('reader/index.html')
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test-id/reader/index.html',
    })
  })

  it('resets file input value after selection', async () => {
    const { getByLabelText, container } = render(<App />)

    await waitFor(() => {
      const button = getByLabelText('Open PDF file')
      expect(button).toBeDefined()
    })

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(chrome.storage.session.set).toHaveBeenCalled()
    })

    expect(fileInput.value).toBe('')
  })

  it('does not open reader tab when file picker is cancelled (no file)', () => {
    const { getByLabelText, container } = render(<App />)

    return waitFor(() => {
      const button = getByLabelText('Open PDF file')
      expect(button).toBeDefined()
    }).then(() => {
      const fileInput = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement

      // Cancel — no file selected
      fireEvent.change(fileInput, { target: { files: [] } })

      expect(chrome.storage.session.set).not.toHaveBeenCalled()
      expect(chrome.tabs.create).not.toHaveBeenCalled()
    })
  })

  it('renders the main popup UI (onboarding skipped)', async () => {
    const { getByText } = render(<App />)

    // Wait for the main UI to render
    await waitFor(() => {
      expect(getByText('Dyslexia Tool')).toBeDefined()
    })
  })
})
