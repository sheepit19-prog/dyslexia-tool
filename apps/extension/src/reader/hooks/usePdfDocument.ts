import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getDocument,
  type PDFDocumentProxy,
  type PDFDocumentLoadingTask,
} from 'pdfjs-dist'
import { initPdfWorker } from '../../shared/pdf/init'

export interface UsePdfDocumentResult {
  pdf: PDFDocumentProxy | null
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
}

/**
 * Load a PDF document from an ArrayBuffer.
 *
 * Handles lifecycle: cancels loading task on buffer change or unmount,
 * destroys document proxy on cleanup.
 */
export function usePdfDocument(
  buffer: ArrayBuffer | null,
): UsePdfDocumentResult {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)
  const mountedRef = useRef(true)

  // Track mount status for cleanup
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Load PDF when buffer changes
  useEffect(() => {
    if (!buffer) {
      setPdf(null)
      setError(null)
      setLoading(false)
      setTotalPages(0)
      setCurrentPage(1)

      // Destroy previous document if any
      if (pdfRef.current) {
        pdfRef.current.destroy()
        pdfRef.current = null
      }
      return
    }

    // Validate buffer
    if (buffer.byteLength === 0) {
      setError('File is empty')
      setLoading(false)
      return
    }

    let cancelled = false

    const loadPdf = async () => {
      setLoading(true)
      setError(null)

      // Destroy previous document
      if (pdfRef.current) {
        pdfRef.current.destroy()
        pdfRef.current = null
      }
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy()
        loadingTaskRef.current = null
      }

      try {
        initPdfWorker()

        const loadingTask = getDocument({ data: buffer })
        loadingTaskRef.current = loadingTask

        const doc = await loadingTask.promise

        if (cancelled || !mountedRef.current) {
          doc.destroy()
          return
        }

        pdfRef.current = doc
        setPdf(doc)
        setTotalPages(doc.numPages)
        setCurrentPage(1)
        setLoading(false)
      } catch (err: unknown) {
        if (cancelled || !mountedRef.current) return

        const message =
          err instanceof Error ? err.message : 'Failed to load PDF'
        setError(message)
        setPdf(null)
        setTotalPages(0)
        setLoading(false)
      }
    }

    loadPdf()

    return () => {
      cancelled = true
      // Cancel loading task if still in progress
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy()
        loadingTaskRef.current = null
      }
    }
  }, [buffer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfRef.current) {
        pdfRef.current.destroy()
        pdfRef.current = null
      }
    }
  }, [])

  const setPage = useCallback((page: number) => {
    const doc = pdfRef.current
    if (!doc) return

    const clamped = Math.max(1, Math.min(page, doc.numPages))
    setCurrentPage(clamped)
  }, [])

  return {
    pdf,
    loading,
    error,
    currentPage,
    totalPages,
    setPage,
  }
}
