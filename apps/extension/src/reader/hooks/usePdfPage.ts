import { useEffect, useRef, useState } from 'react'
import {
  type PDFDocumentProxy,
  type PDFPageProxy,
  type RenderTask,
} from 'pdfjs-dist'

export interface UsePdfPageResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  page: PDFPageProxy | null
  rendering: boolean
}

/**
 * Render a specific page of a loaded PDF document to a canvas.
 *
 * Handles lifecycle: cancels render task on page change, buffer change,
 * or unmount. Accepts a `null` document (no PDF loaded yet).
 */
export function usePdfPage(
  pdf: PDFDocumentProxy | null,
  pageNumber: number,
  scale: number = 1.5,
): UsePdfPageResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [page, setPage] = useState<PDFPageProxy | null>(null)
  const [rendering, setRendering] = useState(false)

  const renderTaskRef = useRef<RenderTask | null>(null)

  useEffect(() => {
    if (!pdf || pageNumber < 1 || pageNumber > pdf.numPages) {
      setPage(null)
      setRendering(false)
      return
    }

    let cancelled = false

    const renderPage = async () => {
      setRendering(true)

      // Cancel any in-progress render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      try {
        const pdfPage = await pdf.getPage(pageNumber)

        if (cancelled) return

        setPage(pdfPage)

        const canvas = canvasRef.current
        if (!canvas) return

        const viewport = pdfPage.getViewport({ scale })

        // Set canvas dimensions accounting for device pixel ratio
        const pixelRatio = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * pixelRatio)
        canvas.height = Math.floor(viewport.height * pixelRatio)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

        const renderTask = pdfPage.render({
          canvasContext: ctx,
          viewport,
        })
        renderTaskRef.current = renderTask

        await renderTask.promise

        if (!cancelled) {
          setRendering(false)
        }
      } catch (err: unknown) {
        // RenderingCancelledException is expected on cleanup — ignore
        if (
          err instanceof Error &&
          err.name === 'RenderingCancelledException'
        ) {
          return
        }
        if (!cancelled) {
          console.error('[usePdfPage] Render error:', err)
          setRendering(false)
        }
      }
    }

    renderPage()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdf, pageNumber, scale])

  // Cancel render on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [])

  return {
    canvasRef,
    page,
    rendering,
  }
}
