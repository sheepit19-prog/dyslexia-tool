export interface FontSettings {
  fontFamily: string
  lineSpacing: number
  letterSpacing: number
}

let fontFaceLoaded = false

/**
 * Injects @font-face declarations for OpenDyslexic into the reader page.
 * Must be called once before font-family changes take effect.
 */
export function ensureFontFaceLoaded(): void {
  if (fontFaceLoaded) return
  fontFaceLoaded = true

  const style = document.createElement('style')
  style.id = 'dyslexia-tool-font-face'
  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Regular.woff2')}') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Bold.woff2')}') format('woff2');
      font-weight: bold;
      font-style: normal;
      font-display: swap;
    }
  `
  document.head.appendChild(style)
}

/**
 * Applies user-configured font family and spacing CSS to a text layer
 * container element AND all its child spans.
 */
export function applyFontStyles(
  container: HTMLElement,
  settings: FontSettings,
): void {
  ensureFontFaceLoaded()

  container.dataset.dyslexiaFontApplied = 'true'

  const family = settings.fontFamily && settings.fontFamily !== 'system'
    ? settings.fontFamily
    : null

  // Apply to container
  if (family) container.style.setProperty('font-family', family, 'important')

  // Override inline styles on each span
  const spans = container.querySelectorAll<HTMLSpanElement>('span')
  for (const span of spans) {
    if (family) span.style.setProperty('font-family', family, 'important')
  }

  // Spacing applies to container only (spans have per-word positioning)
  if (settings.lineSpacing) {
    container.style.setProperty('line-height', String(settings.lineSpacing), 'important')
  }
  if (settings.letterSpacing !== undefined) {
    container.style.setProperty('letter-spacing', `${settings.letterSpacing}em`, 'important')
  }
}

/**
 * Removes font styles previously applied by {@link applyFontStyles}.
 */
export function removeFontStyles(container: HTMLElement): void {
  delete container.dataset.dyslexiaFontApplied
  container.style.removeProperty('font-family')
  container.style.removeProperty('line-height')
  container.style.removeProperty('letter-spacing')

  const spans = container.querySelectorAll<HTMLSpanElement>('span')
  for (const span of spans) {
    span.style.removeProperty('font-family')
  }
}
