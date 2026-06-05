import { useCallback, useEffect, useRef, useState } from 'react'

export interface PageNavigationProps {
  /** 1-based current page number. */
  currentPage: number
  /** Total number of pages in the document. */
  totalPages: number
  /** Called with the new page number when the user navigates. */
  onPageChange: (page: number) => void
}

/**
 * Page navigation bar with prev/next buttons, page number display, and
 * a direct-entry page input.
 *
 * Handles keyboard shortcuts (ArrowLeft/ArrowRight) and validates page
 * input (clamps out-of-range values, ignores non-numeric input).
 */
export function PageNavigation({
  currentPage,
  totalPages,
  onPageChange,
}: PageNavigationProps) {
  const [inputValue, setInputValue] = useState(String(currentPage))
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input value when currentPage changes externally (e.g. prev/next, keyboard)
  useEffect(() => {
    setInputValue(String(currentPage))
  }, [currentPage])

  // Keyboard shortcuts: ArrowLeft → prev, ArrowRight → next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture shortcuts when the page input is focused
      if (document.activeElement === inputRef.current) return

      if (e.key === 'ArrowLeft' && currentPage > 1) {
        e.preventDefault()
        onPageChange(currentPage - 1)
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        e.preventDefault()
        onPageChange(currentPage + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, onPageChange])

  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }, [currentPage, onPageChange])

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }, [currentPage, totalPages, onPageChange])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow typing freely; validate on Enter/blur
      setInputValue(e.target.value)
    },
    [],
  )

  const commitPageInput = useCallback(() => {
    const val = parseInt(inputValue, 10)
    if (isNaN(val) || val < 1) {
      // Non-numeric or too low → clamp to 1
      setInputValue('1')
      onPageChange(1)
    } else if (val > totalPages) {
      // Too high → clamp to last page
      setInputValue(String(totalPages))
      onPageChange(totalPages)
    } else {
      // Valid
      setInputValue(String(val))
      onPageChange(val)
    }
  }, [inputValue, totalPages, onPageChange])

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commitPageInput()
        inputRef.current?.blur()
      }
    },
    [commitPageInput],
  )

  const handleInputBlur = useCallback(() => {
    commitPageInput()
  }, [commitPageInput])

  return (
    <nav
      className="flex items-center gap-3"
      aria-label="Page navigation"
      data-testid="page-navigation"
    >
      <button
        onClick={handlePrev}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        aria-label="Previous page"
        data-testid="prev-page"
      >
        ← Prev
      </button>

      <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-14 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={1}
          max={totalPages}
          aria-label="Page number"
          data-testid="page-input"
        />
        <span className="whitespace-nowrap">/ {totalPages}</span>
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        aria-label="Next page"
        data-testid="next-page"
      >
        Next →
      </button>
    </nav>
  )
}
