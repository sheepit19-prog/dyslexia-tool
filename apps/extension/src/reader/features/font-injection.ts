export interface FontSettings {
  fontFamily: string
  lineSpacing: number
  letterSpacing: number
}

/**
 * Applies user-configured font family and spacing CSS to a text layer
 * container element.
 *
 * Operates on the text layer `<div>` (the container of all positioned
 * text spans), *not* the entire document body.  The caller is responsible
 * for targeting the correct container.
 *
 * @param container The text layer DOM element.
 * @param settings  Properties to apply.
 */
export function applyFontStyles(
  container: HTMLElement,
  settings: FontSettings,
): void {
  container.dataset.dyslexiaFontApplied = 'true'

  if (settings.fontFamily && settings.fontFamily !== 'system') {
    container.style.setProperty('font-family', settings.fontFamily, 'important')
  }

  if (settings.lineSpacing) {
    container.style.setProperty(
      'line-height',
      String(settings.lineSpacing),
      'important',
    )
  }

  if (settings.letterSpacing !== undefined) {
    container.style.setProperty(
      'letter-spacing',
      `${settings.letterSpacing}em`,
      'important',
    )
  }
}

/**
 * Removes font styles previously applied by {@link applyFontStyles}.
 *
 * @param container The text layer DOM element.
 */
export function removeFontStyles(container: HTMLElement): void {
  delete container.dataset.dyslexiaFontApplied
  container.style.removeProperty('font-family')
  container.style.removeProperty('line-height')
  container.style.removeProperty('letter-spacing')
}
