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
  /** True when the PDF is password-protected and needs a password */
  passwordNeeded: boolean
  /** True when an incorrect password was supplied */
  passwordWrong: boolean
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
}

/**
 * Load a PDF document from an ArrayBuffer.
 *
 * Handles lifecycle: cancels loading task on buffer change or unmount,
 * destroys document proxy on cleanup. Optionally accepts a password for
 * encrypted PDFs.
 */
export function usePdfDocument(
  buffer: ArrayBuffer | null,
  password?: string,
): UsePdfDocumentResult {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordNeeded, setPasswordNeeded] = useState(false)
  const [passwordWrong, setPasswordWrong] = useState(false)
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
      setPasswordNeeded(false)
      setPasswordWrong(false)
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

        // Pass password if provided (for encrypted PDFs)
        const params: { data: ArrayBuffer; password?: string } = { data: buffer }
        if (password) {
          params.password = password
        }

        const loadingTask = getDocument(params)
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

        // Check for PasswordException from pdf.js
        const errName = (err as any)?.name
        const errCode = (err as any)?.code

        if (errName === 'PasswordException') {
          if (errCode === 2) {
            // Wrong password
            setPasswordWrong(true)
            setPasswordNeeded(true)
            setError((err as any)?.message || 'Incorrect password')
          } else {
            // Need password (code 1 or other)
            setPasswordNeeded(true)
            setPasswordWrong(false)
            setError((err as any)?.message || 'This PDF is password-protected')
          }
        } else {
          const message =
            err instanceof Error ? err.message : 'Failed to load PDF'
          setError(message)
        }

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
  }, [buffer, password])

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
    passwordNeeded,
    passwordWrong,
    currentPage,
    totalPages,
    setPage,
  }
}
