import { useCallback } from 'react'

export type ErrorType = 'scanned' | 'corrupt' | 'load-failed'

export interface ErrorBannerProps {
  /** The error category that determines the message and styling. */
  type: ErrorType
  /** Optional additional detail message shown below the primary text. */
  detail?: string
  /** Called when the user dismisses the banner. */
  onDismiss?: () => void
}

/** Messages and suggestions for each error type. */
const ERROR_CONFIG: Record<
  ErrorType,
  {
    title: string
    suggestion: string
    icon: string
    bgClass: string
    borderClass: string
    textClass: string
    subtextClass: string
  }
> = {
  scanned: {
    title: 'Scanned PDF detected',
    suggestion:
      'This PDF contains scanned images without a selectable text layer. ' +
      'Dyslexia reading features (font, bionic reading, TTS, ruler) are unavailable.',
    icon: '📄',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    borderClass: 'border-amber-200 dark:border-amber-800',
    textClass: 'text-amber-800 dark:text-amber-200',
    subtextClass: 'text-amber-600 dark:text-amber-300',
  },
  corrupt: {
    title: 'PDF could not be opened',
    suggestion:
      'This file may be corrupted or in an unsupported format. ' +
      'Try opening a different PDF file.',
    icon: '⚠️',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderClass: 'border-red-200 dark:border-red-800',
    textClass: 'text-red-800 dark:text-red-200',
    subtextClass: 'text-red-600 dark:text-red-300',
  },
  'load-failed': {
    title: 'Failed to load PDF',
    suggestion:
      'The file could not be loaded. It may have been moved, deleted, ' +
      'or your browser may be restricting local file access. ' +
      'Try selecting the file again.',
    icon: '❌',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderClass: 'border-red-200 dark:border-red-800',
    textClass: 'text-red-800 dark:text-red-200',
    subtextClass: 'text-red-600 dark:text-red-300',
  },
}

/**
 * A dismissable banner that shows contextual error messages for different
 * PDF-related failure modes.
 *
 * - `scanned`: Image-only PDF with no extractable text.
 * - `corrupt`: Invalid or unparseable PDF file.
 * - `load-failed`: File cannot be accessed or read.
 */
export function ErrorBanner({ type, detail, onDismiss }: ErrorBannerProps) {
  const config = ERROR_CONFIG[type]

  const handleDismiss = useCallback(() => {
    onDismiss?.()
  }, [onDismiss])

  return (
    <div
      className={`border rounded-lg px-4 py-3 mb-4 max-w-xl w-full flex items-start gap-3 ${config.bgClass} ${config.borderClass}`}
      role="alert"
      data-testid={`error-banner-${type}`}
    >
      <span className="text-xl leading-none mt-0.5" aria-hidden="true">
        {config.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${config.textClass}`}>
          {config.title}
        </p>
        <p className={`text-sm mt-1 ${config.subtextClass}`}>
          {config.suggestion}
        </p>
        {detail && (
          <p className={`text-xs mt-1 opacity-75 ${config.subtextClass}`}>
            {detail}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={handleDismiss}
          className={`shrink-0 p-1 rounded hover:opacity-70 transition-opacity ${config.textClass}`}
          aria-label="Dismiss"
          data-testid={`error-dismiss-${type}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
