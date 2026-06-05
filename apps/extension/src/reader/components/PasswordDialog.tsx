import { useCallback, useEffect, useRef, useState } from 'react'

export interface PasswordDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Error message to display (e.g. "Incorrect password") */
  error?: string | null
  /** Called when user submits a password */
  onSubmit: (password: string) => void
  /** Called when user cancels / closes the dialog */
  onCancel: () => void
}

/**
 * Modal dialog for entering a PDF password.
 *
 * Auto-focuses the password input when opened. Supports Enter key to submit
 * and Escape key to cancel. Displays an optional error message for failed
 * attempts.
 */
export function PasswordDialog({
  isOpen,
  error,
  onSubmit,
  onCancel,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset password and focus input when opened
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      // Small delay to ensure the modal is rendered before focusing
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  const handleSubmit = useCallback(() => {
    const trimmed = password.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }, [password, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [handleSubmit, onCancel],
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
      data-testid="password-dialog-overlay"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="PDF password dialog"
        data-testid="password-dialog"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Password Required
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This PDF is password-protected. Enter the password to open it.
        </p>

        <div className="mb-4">
          <label htmlFor="pdf-password" className="sr-only">
            PDF Password
          </label>
          <input
            ref={inputRef}
            id="pdf-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
            data-testid="password-dialog-input"
          />
          {error && (
            <p
              className="text-red-500 dark:text-red-400 text-sm mt-2"
              role="alert"
              data-testid="password-dialog-error"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            data-testid="password-dialog-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!password.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="password-dialog-submit"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  )
}
