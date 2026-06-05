import { GlobalWorkerOptions } from 'pdfjs-dist'

let initialized = false

export function initPdfWorker(): void {
  if (initialized) return

  GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
    'workers/pdf.worker.min.mjs',
  )
  initialized = true
}
