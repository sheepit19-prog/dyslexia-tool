import { type PDFDocumentProxy } from 'pdfjs-dist'
import { usePdfPage } from '../hooks/usePdfPage'
import { TextLayer } from './TextLayer'

export interface PageCanvasProps {
  pdf: PDFDocumentProxy | null
  pageNumber: number
  scale?: number
  /** Called after text content extraction. `true` if the page has text items. */
  onTextContentExtracted?: (hasText: boolean) => void
  /** Called after the text layer DOM is fully built. */
  onTextLayerReady?: () => void
}

/**
 * Renders a single page of a PDF document onto a scaled canvas.
 *
 * Wraps the `usePdfPage` hook and handles the canvas element setup
 * with device-pixel-ratio scaling for sharp rendering on high-DPI
 * displays.  A transparent-but-selectable `TextLayer` is stacked
 * on top so that reading features (U4) can operate on the text.
 */
export function PageCanvas({ pdf, pageNumber, scale = 1.5, onTextContentExtracted, onTextLayerReady }: PageCanvasProps) {
  const { canvasRef, page, rendering } = usePdfPage(pdf, pageNumber, scale)

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
      <TextLayer page={page} scale={scale} onTextContentExtracted={onTextContentExtracted} onReady={onTextLayerReady} />
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
