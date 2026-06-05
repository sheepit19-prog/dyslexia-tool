import { useEffect, useRef, useState } from 'react'
import type { PDFPageProxy } from 'pdfjs-dist'
import { buildTextLayer } from '../../shared/pdf/text-layer'

export interface TextLayerProps {
  /** The pdf.js page proxy whose text content will be rendered. */
  page: PDFPageProxy | null
  /** Scale factor matching the canvas rendering scale. */
  scale?: number
  /** Additional CSS class names applied to the container. */
  className?: string
  /** Called after text content extraction completes. `true` if the page has text items. */
  onTextContentExtracted?: (hasText: boolean) => void
  /** Called after the text layer DOM is fully built — safe point for feature (re)application. */
  onReady?: () => void
}

/**
 * Renders an invisible-but-selectable text layer on top of a PDF
 * canvas.
 *
 * Fetches text content from the pdf.js page via `getTextContent()` and
 * delegates DOM construction to the pure `buildTextLayer` helper.
 *
 * The container `<div>` is absolutely positioned and sized to match the
 * viewport so that the caller can stack it directly over a `<canvas>`
 * element.
 */
export function TextLayer({ page, scale = 1.5, className, onTextContentExtracted, onReady }: TextLayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!page) {
      setError(null)
      return
    }

    let cancelled = false

    const build = async () => {
      setError(null)

      try {
        const viewport = page.getViewport({ scale })
        const textContent = await page.getTextContent()

        if (cancelled) return

        const container = containerRef.current
        if (!container) return

        buildTextLayer(textContent, viewport, container)

        // Notify parent whether text was found (for scanned PDF detection)
        const hasText = textContent.items.length > 0
        onTextContentExtracted?.(hasText)

        // Notify parent that the text layer DOM is ready for feature application
        onReady?.()
      } catch (err: unknown) {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Failed to build text layer'
        setError(message)
      }
    }

    build()

    return () => {
      cancelled = true
    }
  }, [page, scale])

  return (
    <div
      ref={containerRef}
      className={`text-layer ${className ?? ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        lineHeight: '1',
      }}
      aria-hidden={error !== null}
    >
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm p-2">
          {error}
        </div>
      )}
    </div>
  )
}
