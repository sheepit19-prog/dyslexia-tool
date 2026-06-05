import type { TextContent, TextItem, PageViewport } from 'pdfjs-dist'

/**
 * Build an invisible-but-selectable text layer from pdf.js text content.
 *
 * Clears the container, then creates absolutely-positioned `<span>`
 * elements for each text item, mapping PDF coordinate space to
 * viewport (screen) coordinate space.  Text is rendered with
 * `color: transparent` so the underlying canvas remains visible while
 * the DOM text is selectable and accessible to screen readers.
 *
 * When a reading feature activates (U4), spans become visible by
 * removing the transparent colour override.
 */
export function buildTextLayer(
  textContent: TextContent,
  viewport: PageViewport,
  container: HTMLElement,
): void {
  // Clear any previous content
  container.replaceChildren()

  // Match the container dimensions to the viewport so absolute
  // positioning of child spans is relative to the top-left origin.
  container.style.width = `${viewport.width}px`
  container.style.height = `${viewport.height}px`

  const vt = viewport.transform // [a, b, c, d, e, f] — page→viewport

  for (const item of textContent.items) {
    // Skip TextMarkedContent items — only process TextItem
    if (!('str' in item)) continue

    const textItem = item as TextItem

    // Skip empty or whitespace-only items
    if (!textItem.str || textItem.str.trim().length === 0) continue

    const it = textItem.transform // [a, b, c, d, e, f] — text→page

    // Combine viewport transform with text-item transform:
    //   combined = viewportTransform × textTransform
    const a = vt[0] * it[0] + vt[2] * it[1]
    const b = vt[1] * it[0] + vt[3] * it[1]
    const c = vt[0] * it[2] + vt[2] * it[3]
    const d = vt[1] * it[2] + vt[3] * it[3]
    const e = vt[0] * it[4] + vt[2] * it[5] + vt[4]
    const f = vt[1] * it[4] + vt[3] * it[5] + vt[5]

    // Font size derived from the vertical scale component of
    // the combined transform matrix.
    const fontSize = Math.sqrt(c * c + d * d)

    // Rotation angle from the horizontal basis vector.
    const angle = Math.atan2(b, a)

    const span = document.createElement('span')
    span.textContent = textItem.str
    span.style.position = 'absolute'
    span.style.left = `${e}px`
    span.style.top = `${f - fontSize}px`
    span.style.fontSize = `${fontSize}px`
    span.style.fontFamily = textItem.fontName
    span.style.color = 'transparent'
    span.style.pointerEvents = 'auto'
    span.style.whiteSpace = 'pre'
    span.style.lineHeight = '1'
    span.style.transformOrigin = '0% 0%'

    if (Math.abs(angle) > 0.001) {
      span.style.transform = `rotate(${angle}rad)`
    }

    // Preserve text direction for RTL / LTR content
    if (textItem.dir) {
      span.dir = textItem.dir
    }

    container.appendChild(span)
  }
}
