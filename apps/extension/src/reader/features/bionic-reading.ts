import { applyBionicReading } from '../../shared/text/bionic-reading'

/**
 * Applies bionic reading to every `<span>` inside the given text layer container.
 *
 * Makes spans visible by explicitly setting color (not relying on inherit
 * which can be unreliable when the text layer uses transparent spans).
 */
export function applyBionicToLayer(
  container: HTMLElement,
  ratio = 0.45,
): void {
  const spans = container.querySelectorAll<HTMLSpanElement>('span')

  for (const span of spans) {
    if (span.dataset.dyslexiaBionicApplied === 'true') continue

    const original = span.textContent ?? ''
    span.dataset.dyslexiaBionicOriginal = original

    const bionicHtml = applyBionicReading(original, ratio)
    if (bionicHtml !== original) {
      span.innerHTML = bionicHtml
    }

    span.dataset.dyslexiaBionicApplied = 'true'
    // Use explicit color so text is clearly visible regardless of inheritance chain
    span.style.setProperty('color', '#000000', 'important')
  }
}

/**
 * Removes bionic reading, restoring original text and making spans transparent.
 */
export function removeBionicFromLayer(container: HTMLElement): void {
  const spans = container.querySelectorAll<HTMLSpanElement>('span')

  for (const span of spans) {
    if (span.dataset.dyslexiaBionicApplied !== 'true') continue

    const original = span.dataset.dyslexiaBionicOriginal
    if (original !== undefined) {
      span.textContent = original
    }

    delete span.dataset.dyslexiaBionicApplied
    delete span.dataset.dyslexiaBionicOriginal

    span.style.removeProperty('color')
    span.style.color = 'transparent'
  }
}
