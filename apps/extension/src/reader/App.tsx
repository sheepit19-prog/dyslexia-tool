import { useCallback, useEffect, useRef, useState } from 'react'
import { usePdfDocument } from './hooks/usePdfDocument'
import { PageCanvas } from './components/PageCanvas'
import { ReadingView, DEFAULT_READING_FONT_SIZE_PX } from './components/ReadingView'
import { FontSizeControl } from './components/FontSizeControl'
import { PageNavigation } from './components/PageNavigation'
import { FeatureToolbar, useInitialFeatureStates } from './components/FeatureToolbar'
import { FileDropZone } from './components/FileDropZone'
import { ErrorBanner } from './components/ErrorBanner'
import { PasswordDialog } from './components/PasswordDialog'
import type { ErrorType } from './components/ErrorBanner'
import { base64ToArrayBuffer } from '../shared/encoding'

import { createRuler, destroyRuler } from './features/reading-ruler'

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024

function applyDarkMode(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    prefersDark ? root.classList.add('dark') : root.classList.remove('dark')
  } else {
    root.classList.remove('dark')
  }
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

  const [fontEnabled, setFontEnabled] = useState(false)
  const [bionicEnabled, setBionicEnabled] = useState(false)
  const [rulerEnabled, setRulerEnabled] = useState(false)
  const [readingFontSize, setReadingFontSize] = useState(DEFAULT_READING_FONT_SIZE_PX)

  const rulerRef = useRef<HTMLElement | null>(null)

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

  // Dark mode
  useEffect(() => {
    if (initialFeatures?.theme) {
      applyDarkMode(initialFeatures.theme)
      if (initialFeatures.theme === 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => applyDarkMode('system')
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
      }
    }
  }, [initialFeatures?.theme])

  // Load feature preferences from Dexie settings — only once on mount
  useEffect(() => {
    if (initialFeatures) {
      setFontEnabled(initialFeatures.fontEnabled)
      setBionicEnabled(initialFeatures.bionicEnabled)
    }
  }, [initialFeatures])

  // Restore the persisted reading-mode text size on mount
  useEffect(() => {
    chrome.storage.local
      .get('readerFontSize')
      .then((result) => {
        if (typeof result?.readerFontSize === 'number') {
          setReadingFontSize(result.readerFontSize)
        }
      })
      .catch(() => { /* no-op */ })
  }, [])

  // Ruler
  useEffect(() => {
    if (rulerEnabled) {
      if (!rulerRef.current) rulerRef.current = createRuler()
    } else {
      if (rulerRef.current) {
        destroyRuler(rulerRef.current)
        rulerRef.current = null
      }
    }
  }, [rulerEnabled])

  // Popup handoff on mount
  useEffect(() => {
    const check = async () => {
      try {
        const result = await chrome.storage.session.get(['pdfData', 'pdfName'])
        if (result.pdfData) {
          const buffer = base64ToArrayBuffer(result.pdfData)
          setPdfBuffer(buffer)
          setPdfName(result.pdfName ?? null)
          if (buffer.byteLength > LARGE_FILE_THRESHOLD) setShowSizeWarning(true)
          await chrome.storage.session.remove(['pdfData', 'pdfName'])
        }
      } catch { /* no-op */ }
    }
    check()
  }, [])

  // Password dialog
  useEffect(() => {
    if (passwordNeeded) {
      setShowPasswordDialog(true)
      setPasswordDialogError(passwordWrong ? 'Incorrect password. Please try again.' : null)
    } else {
      setShowPasswordDialog(false)
      setPasswordDialogError(null)
    }
  }, [passwordNeeded, passwordWrong])

  // Reset text detection + ruler on new PDF
  useEffect(() => {
    setHasTextContent(null)
    setDismissedError(null)
    if (rulerRef.current) {
      destroyRuler(rulerRef.current)
      rulerRef.current = null
    }
    setRulerEnabled(false)
  }, [pdfBuffer])

  // Cleanup ruler on unmount
  useEffect(() => {
    return () => {
      if (rulerRef.current) {
        destroyRuler(rulerRef.current)
        rulerRef.current = null
      }
    }
  }, [])

  const handleFileDrop = useCallback((buffer: ArrayBuffer, name: string) => {
    setPassword(undefined)
    setShowPasswordDialog(false)
    setPasswordDialogError(null)
    if (buffer.byteLength > LARGE_FILE_THRESHOLD) setShowSizeWarning(true)
    else setShowSizeWarning(false)
    setPdfBuffer(buffer)
    setPdfName(name)
  }, [])

  const handlePasswordSubmit = useCallback((pw: string) => {
    setPasswordDialogError(null)
    setPassword(pw)
  }, [])

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
    (feature: string, enabled: boolean) => {
      if (feature === 'font') setFontEnabled(enabled)
      else if (feature === 'bionic') setBionicEnabled(enabled)
      else if (feature === 'ruler') setRulerEnabled(enabled)
      // TTS handled directly in FeatureToolbar
    },
    [],
  )

  const handleErrorDismiss = useCallback(() => setDismissedError('scanned'), [])

  const handleFontSizeChange = useCallback((next: number) => {
    setReadingFontSize(next)
    chrome.storage.local.set({ readerFontSize: next }).catch(() => { /* no-op */ })
  }, [])

  const state = pdf ? 'ready' : loading || passwordNeeded ? 'loading' : error ? 'error' : 'idle'
  const featuresApplicable = hasTextContent !== false
  const showScannedBanner = state === 'ready' && hasTextContent === false && dismissedError !== 'scanned'

  // Reading mode: when a text feature is on, show reflowed text instead of the
  // canvas. Falls back to canvas when the page has no extractable text.
  const readingMode = fontEnabled || bionicEnabled
  const showReading = readingMode && hasTextContent !== false

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {pdfName ?? 'PDF Reader'}
          </h1>
        </div>

        {state === 'ready' && totalPages > 0 && (
          <PageNavigation currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}

        {state === 'ready' && featuresApplicable && (
          <FeatureToolbar
            features={{
              font: { enabled: fontEnabled, label: 'Font', activeColor: 'bg-blue-500' },
              bionic: { enabled: bionicEnabled, label: 'Bionic', activeColor: 'bg-amber-500' },
              tts: { enabled: false, label: 'TTS', activeColor: 'bg-green-500' },
              ruler: { enabled: rulerEnabled, label: 'Ruler', activeColor: 'bg-purple-500' },
            }}
            onFeatureToggle={handleFeatureToggle}
            fontFamily={initialFeatures?.fontFamily}
            ttsSpeed={initialFeatures?.ttsSpeed}
          />
        )}

        {state === 'ready' && showReading && (
          <FontSizeControl value={readingFontSize} onChange={handleFontSizeChange} />
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-4">
        {showSizeWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2 mb-4 max-w-md w-full text-center" data-testid="size-warning">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">Large file — may take a moment to load</p>
          </div>
        )}

        {showScannedBanner && <ErrorBanner type="scanned" onDismiss={handleErrorDismiss} />}

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
          <div className="flex-1 flex items-start justify-center py-4 w-full">
            {showReading ? (
              <ReadingView
                pdf={pdf}
                pageNumber={currentPage}
                fontFamily={fontEnabled ? (initialFeatures?.fontFamily ?? 'OpenDyslexic') : undefined}
                fontSize={readingFontSize}
                lineSpacing={fontEnabled ? 1.6 : 1.5}
                letterSpacing={fontEnabled ? 0.05 : 0}
                bionicEnabled={bionicEnabled}
                onTextContentExtracted={handleTextContentExtracted}
              />
            ) : (
              <PageCanvas
                pdf={pdf}
                pageNumber={currentPage}
                onTextContentExtracted={handleTextContentExtracted}
              />
            )}
          </div>
        )}
      </main>

      <PasswordDialog
        isOpen={showPasswordDialog}
        error={passwordDialogError}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
      />
    </div>
  )
}
