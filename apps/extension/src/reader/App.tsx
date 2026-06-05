import { useCallback, useEffect, useRef, useState } from 'react'
import { usePdfDocument } from './hooks/usePdfDocument'
import { PageCanvas } from './components/PageCanvas'
import { PageNavigation } from './components/PageNavigation'
import { FeatureToolbar, useInitialFeatureStates } from './components/FeatureToolbar'
import { FileDropZone } from './components/FileDropZone'
import { ErrorBanner } from './components/ErrorBanner'
import { PasswordDialog } from './components/PasswordDialog'
import type { ErrorType } from './components/ErrorBanner'

import { applyFontStyles, removeFontStyles } from './features/font-injection'
import { applyBionicToLayer, removeBionicFromLayer } from './features/bionic-reading'
import { createRuler, destroyRuler } from './features/reading-ruler'

/** Threshold (in bytes) above which a size warning is shown */
const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024 // 100 MB

/**
 * Applies the dark mode CSS class to the document root based on settings
 * and system preference.
 */
function applyDarkMode(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Returns the text layer container element in the DOM, or null.
 */
function getTextLayerContainer(): HTMLElement | null {
  return document.querySelector('.text-layer') as HTMLElement | null
}

export function App() {
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordDialogError, setPasswordDialogError] = useState<string | null>(null)
  const [showSizeWarning, setShowSizeWarning] = useState(false)
  const [hasTextContent, setHasTextContent] = useState<boolean | null>(null)
  const [dismissedError, setDismissedError] = useState<ErrorType | null>(null)
  const [featureEnabled, setFeatureEnabled] = useState({
    font: false,
    bionic: false,
    tts: false,
    ruler: false,
  })

  // Refs for feature state cleanup
  const rulerRef = useRef<HTMLElement | null>(null)

  // Load initial settings from Dexie
  const { features: initialFeatures } = useInitialFeatureStates()

  const {
    pdf,
    loading,
    error,
    passwordNeeded,
    passwordWrong,
    currentPage,
    totalPages,
    setPage,
  } = usePdfDocument(pdfBuffer, password)

  // Apply dark mode on mount and when theme setting loads
  useEffect(() => {
    if (initialFeatures?.theme) {
      applyDarkMode(initialFeatures.theme)

      // Listen for system theme changes if in 'system' mode
      if (initialFeatures.theme === 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => applyDarkMode('system')
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
      }
    }
  }, [initialFeatures?.theme])

  // Initialize feature states from settings
  useEffect(() => {
    if (initialFeatures) {
      setFeatureEnabled(prev => ({
        ...prev,
        font: initialFeatures.fontEnabled,
        bionic: initialFeatures.bionicEnabled,
      }))
    }
  }, [initialFeatures])

  // On mount, check for a pending PDF from the popup handoff
  useEffect(() => {
    const checkPendingPdf = async () => {
      try {
        const result = await chrome.storage.session.get('pdfBuffer')
        if (result.pdfBuffer) {
          const buffer =
            result.pdfBuffer.buffer ?? result.pdfBuffer
          const name = result.pdfName ?? null

          setPdfBuffer(buffer)
          setPdfName(name)
          // Clear the session key so stale data doesn't persist
          await chrome.storage.session.remove('pdfBuffer')

          // Check for large file warning
          if (buffer.byteLength > LARGE_FILE_THRESHOLD) {
            setShowSizeWarning(true)
          }
        }
      } catch {
        // session storage unavailable or empty — that's fine
      }
    }
    checkPendingPdf()
  }, [])

  // When passwordNeeded / passwordWrong changes, show/hide dialog
  useEffect(() => {
    if (passwordNeeded) {
      setShowPasswordDialog(true)
      if (passwordWrong) {
        setPasswordDialogError('Incorrect password. Please try again.')
      } else {
        setPasswordDialogError(null)
      }
    } else {
      setShowPasswordDialog(false)
      setPasswordDialogError(null)
    }
  }, [passwordNeeded, passwordWrong])

  // Reset text content detection when PDF buffer changes
  useEffect(() => {
    setHasTextContent(null)
    setDismissedError(null)
    setFeatureEnabled({ font: false, bionic: false, tts: false, ruler: false })
  }, [pdfBuffer])

  // Apply/remove features when enabled state changes and text layer exists
  useEffect(() => {
    const container = getTextLayerContainer()
    if (!container) return

    if (featureEnabled.font) {
      const fontFamily = initialFeatures?.fontFamily ?? 'OpenDyslexic'
      applyFontStyles(container, {
        fontFamily,
        lineSpacing: 1.6,
        letterSpacing: 0.05,
      })
    } else {
      removeFontStyles(container)
    }
  }, [featureEnabled.font, initialFeatures?.fontFamily])

  useEffect(() => {
    const container = getTextLayerContainer()
    if (!container) return

    if (featureEnabled.bionic) {
      applyBionicToLayer(container)
    } else {
      removeBionicFromLayer(container)
    }
  }, [featureEnabled.bionic])

  useEffect(() => {
    if (featureEnabled.ruler) {
      if (!rulerRef.current) {
        rulerRef.current = createRuler()
      }
    } else {
      if (rulerRef.current) {
        destroyRuler(rulerRef.current)
        rulerRef.current = null
      }
    }
  }, [featureEnabled.ruler])

  // Re-apply features when the text layer DOM is ready after each page render
  const handleTextLayerReady = useCallback(() => {
    const container = getTextLayerContainer()
    if (!container) return

    if (featureEnabled.font) {
      const fontFamily = initialFeatures?.fontFamily ?? 'OpenDyslexic'
      applyFontStyles(container, { fontFamily, lineSpacing: 1.6, letterSpacing: 0.05 })
    }
    if (featureEnabled.bionic) {
      applyBionicToLayer(container)
    }
  }, [featureEnabled.font, featureEnabled.bionic, initialFeatures?.fontFamily])

  // Clean up ruler on unmount
  useEffect(() => {
    return () => {
      if (rulerRef.current) {
        destroyRuler(rulerRef.current)
        rulerRef.current = null
      }
    }
  }, [])

  const handleFileDrop = useCallback((buffer: ArrayBuffer, name: string) => {
    // Reset password state for new files
    setPassword(undefined)
    setShowPasswordDialog(false)
    setPasswordDialogError(null)

    // Size warning for large files
    if (buffer.byteLength > LARGE_FILE_THRESHOLD) {
      setShowSizeWarning(true)
    } else {
      setShowSizeWarning(false)
    }

    setPdfBuffer(buffer)
    setPdfName(name)
  }, [])

  const handlePasswordSubmit = useCallback(
    (enteredPassword: string) => {
      setPasswordDialogError(null)
      setPassword(enteredPassword)
    },
    [],
  )

  const handlePasswordCancel = useCallback(() => {
    setPassword(undefined)
    setShowPasswordDialog(false)
    setPasswordDialogError(null)
    setPdfBuffer(null)
    setPdfName(null)
  }, [])

  const handleTextContentExtracted = useCallback((hasText: boolean) => {
    setHasTextContent(hasText)
  }, [])

  const handleFeatureToggle = useCallback(
    (feature: 'font' | 'bionic' | 'tts' | 'ruler', enabled: boolean) => {
      setFeatureEnabled(prev => ({ ...prev, [feature]: enabled }))
    },
    [],
  )

  const handleErrorDismiss = useCallback(() => {
    setDismissedError('scanned')
  }, [])

  // Determine display state
  const state = pdf
    ? 'ready'
    : loading || passwordNeeded
      ? 'loading'
      : error
        ? 'error'
        : 'idle'

  // Determine if features are applicable (not scanned PDF)
  const featuresApplicable = hasTextContent !== false

  // Determine if we show the scanned error banner
  const showScannedBanner = state === 'ready' && hasTextContent === false && dismissedError !== 'scanned'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar / Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {pdfName ?? 'PDF Reader'}
          </h1>
        </div>

        {state === 'ready' && totalPages > 0 && (
          <PageNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        {state === 'ready' && featuresApplicable && (
          <FeatureToolbar
            features={{
              font: { enabled: featureEnabled.font, label: 'Font', activeColor: 'bg-blue-500' },
              bionic: { enabled: featureEnabled.bionic, label: 'Bionic', activeColor: 'bg-amber-500' },
              tts: { enabled: featureEnabled.tts, label: 'TTS', activeColor: 'bg-green-500' },
              ruler: { enabled: featureEnabled.ruler, label: 'Ruler', activeColor: 'bg-purple-500' },
            }}
            onFeatureToggle={handleFeatureToggle}
            fontFamily={initialFeatures?.fontFamily}
            ttsSpeed={initialFeatures?.ttsSpeed}
          />
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-4">
        {showSizeWarning && (
          <div
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2 mb-4 max-w-md w-full text-center"
            data-testid="size-warning"
          >
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Large file — may take a moment to load
            </p>
          </div>
        )}

        {showScannedBanner && (
          <ErrorBanner type="scanned" onDismiss={handleErrorDismiss} />
        )}

        {state === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <FileDropZone onPdfLoaded={handleFileDrop} />
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
            <ErrorBanner
              type={error?.includes('corrupt') || error?.includes('Invalid') ? 'corrupt' : 'load-failed'}
              detail={error ?? undefined}
            />
          </div>
        )}

        {state === 'ready' && pdf && (
          <div className="flex-1 flex items-start justify-center py-4">
            <PageCanvas
              pdf={pdf}
              pageNumber={currentPage}
              onTextContentExtracted={handleTextContentExtracted}
              onTextLayerReady={handleTextLayerReady}
            />
          </div>
        )}
      </main>

      {/* Password Dialog */}
      <PasswordDialog
        isOpen={showPasswordDialog}
        error={passwordDialogError}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
      />
    </div>
  )
}
