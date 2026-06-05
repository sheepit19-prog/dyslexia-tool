import { useCallback, useEffect, useState } from 'react'
import { usePdfDocument } from './hooks/usePdfDocument'
import { PageCanvas } from './components/PageCanvas'

export function App() {
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)

  const { pdf, loading, error, currentPage, totalPages, setPage } =
    usePdfDocument(pdfBuffer)

  // On mount, check for a pending PDF from the popup handoff
  useEffect(() => {
    const checkPendingPdf = async () => {
      try {
        const result = await chrome.storage.session.get('pdfBuffer')
        if (result.pdfBuffer) {
          setPdfBuffer(result.pdfBuffer.buffer ?? result.pdfBuffer)
          setPdfName(result.pdfName ?? null)
          // Clear the session key so stale data doesn't persist
          await chrome.storage.session.remove('pdfBuffer')
        }
      } catch {
        // session storage unavailable or empty — that's fine
      }
    }
    checkPendingPdf()
  }, [])

  const handleFileDrop = useCallback((buffer: ArrayBuffer, name: string) => {
    setPdfBuffer(buffer)
    setPdfName(name)
  }, [])

  const handlePrev = useCallback(() => {
    setPage(currentPage - 1)
  }, [currentPage, setPage])

  const handleNext = useCallback(() => {
    setPage(currentPage + 1)
  }, [currentPage, setPage])

  const handlePageInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const val = parseInt((e.target as HTMLInputElement).value, 10)
        if (!isNaN(val)) {
          setPage(val)
        }
      }
    },
    [setPage],
  )

  const state = pdf
    ? 'ready'
    : loading
      ? 'loading'
      : error
        ? 'error'
        : 'idle'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {pdfName ?? 'PDF Reader'}
        </h1>
        {state === 'ready' && totalPages > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Previous page"
            >
              ‹ Prev
            </button>
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <input
                type="number"
                defaultValue={currentPage}
                key={currentPage}
                onKeyDown={handlePageInput}
                className="w-12 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm px-1 py-0.5"
                min={1}
                max={totalPages}
                aria-label="Page number"
              />
              <span className="whitespace-nowrap">/ {totalPages}</span>
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-40 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Next page"
            >
              Next ›
            </button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-4">
        {state === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 max-w-md w-full"
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  'border-blue-400',
                  'bg-blue-50',
                )
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove(
                  'border-blue-400',
                  'bg-blue-50',
                )
                const file = e.dataTransfer.files?.[0]
                if (file && file.type === 'application/pdf') {
                  const reader = new FileReader()
                  reader.onload = (ev) => {
                    const buffer = ev.target?.result as ArrayBuffer
                    handleFileDrop(buffer, file.name)
                  }
                  reader.readAsArrayBuffer(file)
                }
              }}
            >
              <h2 className="text-2xl font-bold mb-2">PDF Reader</h2>
              <p className="mb-1">Drag and drop a PDF here</p>
              <p className="text-sm opacity-70">or open one from the extension popup</p>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-b-transparent" />
            <p className="text-lg">Loading PDF…</p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
              <p className="text-red-700 dark:text-red-300 font-medium mb-2">
                Failed to load PDF
              </p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {state === 'ready' && pdf && (
          <div className="flex-1 flex items-start justify-center py-4">
            <PageCanvas pdf={pdf} pageNumber={currentPage} />
          </div>
        )}
      </main>
    </div>
  )
}
