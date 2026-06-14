import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { buildReadingParagraphs } from '../../shared/pdf/reading-text'
import { ensureFontFaceLoaded } from '../features/font-injection'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * HTML-safe bionic reading: bolds the leading portion of each word while
 * escaping all text. PDF text is untrusted, so we never inject raw markup.
 * Mirrors the split logic of the shared `applyBionicReading` but escapes each
 * fragment (computing the split on the raw word avoids cutting an entity).
 */
function bionicHtml(text: string, ratio = 0.45): string {
  return text.replace(/\S+/g, (word) => {
    if (word.length < 3) return escapeHtml(word)
    const splitAt = Math.max(1, Math.ceil(word.length * ratio))
    return `<b>${escapeHtml(word.slice(0, splitAt))}</b>${escapeHtml(word.slice(splitAt))}`
  })
}

/**
 * Default reading-mode text size, in px. Reflowed text is decoupled from the
 * PDF's original glyph size, so we pick a comfortable reading default rather
 * than inheriting the 16px page base. Tune here (or pass `fontSize`).
 */
export const DEFAULT_READING_FONT_SIZE_PX = 22

export interface ReadingViewProps {
  /** Loaded pdf.js document. */
  pdf: PDFDocumentProxy | null
  /** 1-based page number to display. */
  pageNumber: number
  /** Scale used for the viewport transform (affects coordinate math only). */
  scale?: number
  /** Dyslexia font family; omit/`system` keeps the default font. */
  fontFamily?: string
  /** Line height multiplier. */
  lineSpacing?: number
  /** Letter spacing in em. */
  letterSpacing?: number
  /** Reading text size in px. */
  fontSize?: number
  /** When true, bold the leading portion of each word (bionic reading). */
  bionicEnabled?: boolean
  /** Reports whether the page yielded any readable text. */
  onTextContentExtracted?: (hasText: boolean) => void
}

/**
 * Reading mode: renders a page's extracted text as a clean, single-column
 * reflow where font, spacing, and bionic reading apply correctly.
 *
 * This replaces the canvas + transparent-overlay view when a text feature is
 * active. It does not preserve the original layout or images (by design — it is
 * a reading aid, and the original view remains the default).
 */
export function ReadingView({
  pdf,
  pageNumber,
  scale = 1.5,
  fontFamily,
  lineSpacing = 1.6,
  letterSpacing = 0.05,
  fontSize = DEFAULT_READING_FONT_SIZE_PX,
  bionicEnabled = false,
  onTextContentExtracted,
}: ReadingViewProps) {
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load the OpenDyslexic @font-face once.
  useEffect(() => {
    ensureFontFaceLoaded()
  }, [])

  useEffect(() => {
    if (!pdf) {
      setParagraphs([])
      return
    }

    let cancelled = false

    const extract = async () => {
      setLoading(true)
      setError(null)
      try {
        const page = await pdf.getPage(pageNumber)
        const viewport = page.getViewport({ scale })
        const textContent = await page.getTextContent()
        if (cancelled) return

        const paras = buildReadingParagraphs(textContent, viewport)
        setParagraphs(paras)
        onTextContentExtracted?.(paras.length > 0)
      } catch (err: unknown) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to extract text')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    extract()

    return () => {
      cancelled = true
    }
    // onTextContentExtracted intentionally omitted — mirrors TextLayer; the
    // parent passes a stable useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf, pageNumber, scale])

  const family = fontFamily && fontFamily !== 'system' ? fontFamily : undefined

  if (error) {
    return (
      <div
        role="alert"
        className="max-w-2xl w-full mx-auto px-6 py-4 text-red-700 dark:text-red-300"
        data-testid="reading-view-error"
      >
        {error}
      </div>
    )
  }

  return (
    <div
      className="reading-view max-w-2xl w-full mx-auto px-6 py-4 text-gray-900 dark:text-gray-100"
      data-testid="reading-view"
      style={{
        fontFamily: family,
        fontSize: `${fontSize}px`,
        lineHeight: lineSpacing,
        letterSpacing: `${letterSpacing}em`,
      }}
    >
      {loading && paragraphs.length === 0 && (
        <p className="text-gray-400 dark:text-gray-500">Loading text…</p>
      )}

      {paragraphs.map((para, i) =>
        bionicEnabled ? (
          <p
            key={i}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: bionicHtml(para) }}
          />
        ) : (
          <p key={i} className="mb-4">
            {para}
          </p>
        ),
      )}
    </div>
  )
}
