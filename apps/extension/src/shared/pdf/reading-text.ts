import type { PageViewport } from 'pdfjs-dist'

interface TextItem {
  str: string
  dir?: string
  width: number
  height: number
  transform: number[]
  fontName: string
}

interface TextContent {
  items: Array<TextItem | Record<string, unknown>>
}

export interface ReadingTextOptions {
  /** Items share a line when their baseline-y differs by < this × font size. */
  lineToleranceRatio?: number
  /** Insert a space when the x-gap between items exceeds this × font size. */
  spaceGapRatio?: number
  /** Start a new paragraph when the line gap exceeds this × median line spacing. */
  paragraphGapRatio?: number
}

const DEFAULTS: Required<ReadingTextOptions> = {
  lineToleranceRatio: 0.5,
  spaceGapRatio: 0.25,
  paragraphGapRatio: 1.6,
}

interface PositionedItem {
  str: string
  x: number
  xEnd: number
  y: number
  fontSize: number
}

interface Line {
  text: string
  y: number
  fontSize: number
}

/**
 * Reconstruct readable, reflowed paragraphs from pdf.js text content.
 *
 * Unlike the invisible overlay text layer (which keeps each glyph at its
 * original page position), this collapses the page into ordered paragraphs of
 * plain text suitable for a single-column "reading mode" where dyslexia
 * features (font, spacing, bionic) render correctly.
 *
 * Pure and DOM-free. Coordinates are computed in viewport space (y increases
 * downward) so all thresholds scale with the rendered font size.
 *
 * Known limitations (v1): multi-column layouts may interleave in reading order;
 * rotated and RTL text are not specially handled.
 */
export function buildReadingParagraphs(
  textContent: TextContent,
  viewport: PageViewport,
  options: ReadingTextOptions = {},
): string[] {
  const { lineToleranceRatio, spaceGapRatio, paragraphGapRatio } = {
    ...DEFAULTS,
    ...options,
  }

  const vt = viewport.transform // [a, b, c, d, e, f] — page→viewport
  const viewportScale = Math.hypot(vt[0], vt[1]) || 1

  const positioned: PositionedItem[] = []

  for (const raw of textContent.items) {
    if (!('str' in raw)) continue
    const item = raw as TextItem
    if (!item.str) continue

    const it = item.transform
    // Combined transform components (viewport × text-item)
    const c = vt[0] * it[2] + vt[2] * it[3]
    const d = vt[1] * it[2] + vt[3] * it[3]
    const e = vt[0] * it[4] + vt[2] * it[5] + vt[4]
    const f = vt[1] * it[4] + vt[3] * it[5] + vt[5]

    const fontSize = Math.hypot(c, d)
    const widthPx = item.width * viewportScale

    positioned.push({ str: item.str, x: e, xEnd: e + widthPx, y: f, fontSize })
  }

  if (positioned.length === 0) return []

  // Sort top→bottom, then left→right.
  positioned.sort((p, q) => p.y - q.y || p.x - q.x)

  // Group into lines by baseline-y proximity.
  const rawLines: PositionedItem[][] = []
  let anchorY: number | null = null
  let anchorFont = positioned[0].fontSize
  for (const it of positioned) {
    const tolerance = Math.max(it.fontSize, anchorFont) * lineToleranceRatio
    if (anchorY !== null && Math.abs(it.y - anchorY) <= tolerance) {
      rawLines[rawLines.length - 1].push(it)
    } else {
      rawLines.push([it])
      anchorY = it.y
      anchorFont = it.fontSize
    }
  }

  // Assemble each line's text (with inferred word spaces).
  const lines: Line[] = []
  for (const group of rawLines) {
    group.sort((a, b) => a.x - b.x)
    let text = ''
    let prevEnd: number | null = null
    let fontSize = group[0].fontSize
    for (const it of group) {
      if (prevEnd !== null) {
        const gap = it.x - prevEnd
        const endsWS = /\s$/.test(text)
        const startsWS = /^\s/.test(it.str)
        if (gap > it.fontSize * spaceGapRatio && !endsWS && !startsWS) {
          text += ' '
        }
      }
      text += it.str
      prevEnd = it.xEnd
      fontSize = Math.max(fontSize, it.fontSize)
    }
    const trimmed = text.trim()
    if (trimmed.length > 0) {
      lines.push({ text: trimmed, y: group[0].y, fontSize })
    }
  }

  if (lines.length === 0) return []
  if (lines.length === 1) return [lines[0].text]

  // Median line-to-line gap, used as the paragraph-break baseline.
  const deltas: number[] = []
  for (let i = 1; i < lines.length; i++) {
    deltas.push(lines[i].y - lines[i - 1].y)
  }
  const median = medianOf(deltas)

  const paragraphs: string[] = []
  let current: string[] = [lines[0].text]
  for (let i = 1; i < lines.length; i++) {
    const gap = lines[i].y - lines[i - 1].y
    if (gap > median * paragraphGapRatio) {
      paragraphs.push(current.join(' '))
      current = [lines[i].text]
    } else {
      current.push(lines[i].text)
    }
  }
  paragraphs.push(current.join(' '))

  return paragraphs.map((p) => p.trim()).filter((p) => p.length > 0)
}

function medianOf(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}
