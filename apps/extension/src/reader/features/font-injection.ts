export interface FontSettings {
  fontFamily: string
  lineSpacing: number
  letterSpacing: number
}

/**
 * Applies user-configured font family and spacing CSS to a text layer
 * container element AND all its child spans.
 *
 * The text layer spans have inline font-family, font-size, and line-height
 * that would otherwise block container-level cascading.
 */
export function applyFontStyles(
  container: HTMLElement,
  settings: FontSettings,
): void {
  container.dataset.dyslexiaFontApplied = 'true'

  const family = settings.fontFamily && settings.fontFamily !== 'system'
    ? settings.fontFamily
    : null
  const lineHeight = settings.lineSpacing
    ? String(settings.lineSpacing)
    : null
  const letterSpacing = settings.letterSpacing !== undefined
    ? `${settings.letterSpacing}em`
    : null

  // Apply to container (for any spans that don't have inline overrides)
  if (family) container.style.setProperty('font-family', family, 'important')
  if (lineHeight) container.style.setProperty('line-height', lineHeight, 'important')
  if (letterSpacing) container.style.setProperty('letter-spacing', letterSpacing, 'important')

  // Override inline styles on each span so cascading actually works
  const spans = container.querySelectorAll<HTMLSpanElement>('span')
  for (const span of spans) {
    if (family) span.style.setProperty('font-family', family, 'important')
    if (lineHeight) span.style.setProperty('line-height', lineHeight, 'important')
    if (letterSpacing) span.style.setProperty('letter-spacing', letterSpacing, 'important')
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
    span.style.removeProperty('line-height')
    span.style.removeProperty('letter-spacing')
  }
}
