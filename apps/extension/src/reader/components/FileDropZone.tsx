import { useCallback, useRef, useState } from 'react'

export interface FileDropZoneProps {
  /** Called when a valid PDF file is loaded as an ArrayBuffer */
  onPdfLoaded: (buffer: ArrayBuffer, name: string) => void
  /** When true, the drop zone shows disabled styling and ignores interactions */
  disabled?: boolean
  /** Optional additional className for the container */
  className?: string
}

/**
 * Drop zone for PDF files with drag-and-drop and click-to-browse support.
 *
 * Validates file extension (.pdf) and MIME type (application/pdf) before
 * reading the file as an ArrayBuffer and calling `onPdfLoaded`.
 * Shows visual feedback during drag-over and on invalid file types.
 */
export function FileDropZone({
  onPdfLoaded,
  disabled = false,
  className = '',
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [rejected, setRejected] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return
      setIsDragOver(true)
      setRejected(false)
    },
    [disabled],
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      setRejected(false)
    },
    [],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const file = e.dataTransfer.files?.[0]
      if (!file) return

      const isValid =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')

      if (!isValid) {
        setRejected(true)
        // Auto-clear rejection feedback after 2 seconds
        setTimeout(() => setRejected(false), 2000)
        return
      }

      readFile(file)
    },
    [disabled],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      readFile(file)
      // Reset so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [],
  )

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer
        onPdfLoaded(buffer, file.name)
      }
      reader.onerror = () => {
        setRejected(true)
        setTimeout(() => setRejected(false), 2000)
      }
      reader.readAsArrayBuffer(file)
    },
    [onPdfLoaded],
  )

  const handleClick = useCallback(() => {
    if (disabled) return
    fileInputRef.current?.click()
  }, [disabled])

  const borderColor = rejected
    ? 'border-red-400 dark:border-red-500'
    : isDragOver
      ? 'border-blue-400 dark:border-blue-400'
      : 'border-gray-300 dark:border-gray-600'

  const bgColor = rejected
    ? 'bg-red-50 dark:bg-red-900/20'
    : isDragOver
      ? 'bg-blue-50 dark:bg-blue-900/20'
      : 'bg-transparent'

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 max-w-md w-full flex flex-col items-center justify-center transition-colors cursor-pointer ${borderColor} ${bgColor} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      data-testid="file-drop-zone"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        data-testid="file-drop-input"
      />

      {rejected ? (
        <>
          <svg
            className="w-12 h-12 text-red-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-red-600 dark:text-red-400 font-medium">
            Please drop a PDF file
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-1">
            Only .pdf files are accepted
          </p>
        </>
      ) : isDragOver ? (
        <>
          <svg
            className="w-12 h-12 text-blue-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            Drop to open PDF
          </p>
        </>
      ) : (
        <>
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Drop PDF here or click to browse
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Only .pdf files are accepted
          </p>
        </>
      )}
    </div>
  )
}
