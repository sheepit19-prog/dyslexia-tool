import { applyBionicReading } from '../../shared/text/bionic-reading'

/**
 * Applies bionic reading to every `<span>` inside the given text layer
 * container.
 *
 * Each span's `textContent` is transformed via the shared
 * `applyBionicReading()` function and rendered as `innerHTML`.
 *
 * Spans are made visible (`color: inherit`) so they display over the
 * canvas beneath them.  The original text is stashed in a data attribute
 * for later restoration.
 *
 * @param container The text layer container element.
 * @param ratio     Fraction of each word to bold (default 0.45).
 */
export function applyBionicToLayer(
  container: HTMLElement,
  ratio = 0.45,
): void {
  const spans = container.querySelectorAll<HTMLSpanElement>('span')

  for (const span of spans) {
    // Skip spans that already have bionic applied (idempotent).
    if (span.dataset.dyslexiaBionicApplied === 'true') continue

    const original = span.textContent ?? ''
    span.dataset.dyslexiaBionicOriginal = original

    const bionicHtml = applyBionicReading(original, ratio)
    if (bionicHtml !== original) {
      span.innerHTML = bionicHtml
    }

    span.dataset.dyslexiaBionicApplied = 'true'
    span.style.color = 'inherit'
    span.style.setProperty('color', 'inherit', 'important')
  }
}

/**
 * Removes bionic reading from every `<span>` inside the text layer
 * container, restoring their original text content and making them
 * transparent again.
 *
 * @param container The text layer container element.
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
