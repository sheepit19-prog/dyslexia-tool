import { type PDFDocumentProxy } from 'pdfjs-dist'
import { usePdfPage } from '../hooks/usePdfPage'

export interface PageCanvasProps {
  pdf: PDFDocumentProxy | null
  pageNumber: number
  scale?: number
}

/**
 * Renders a single page of a PDF document onto a scaled canvas.
 *
 * Wraps the `usePdfPage` hook and handles the canvas element setup
 * with device-pixel-ratio scaling for sharp rendering on high-DPI
 * displays.
 */
export function PageCanvas({ pdf, pageNumber, scale = 1.5 }: PageCanvasProps) {
  const { canvasRef, rendering } = usePdfPage(pdf, pageNumber, scale)

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="block shadow-md"
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      {rendering && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/60"
          aria-label="Rendering page"
        >
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-b-transparent"
          />
        </div>
      )}
    </div>
  )
}
