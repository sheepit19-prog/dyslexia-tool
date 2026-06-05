import { applyBionicReading } from '../../shared/text/bionic-reading'

/**
 * Applies bionic reading to every `<span>` inside the given text layer
 * container.
 *
 * Each span's `textContent` is transformed via the shared
 * `applyBionicReading()` function and rendered as `innerHTML`.
 * The original text is stashed in a data attribute for later restoration.
 *
 * Spans are made visible by setting `color` directly on the container
 * and on each span — the text layer creates spans with `color: transparent`
 * which must be overridden.
 */
export function applyBionicToLayer(
  container: HTMLElement,
  ratio = 0.45,
): void {
  // Ensure the container has a visible color so spans can inherit it
  container.style.color = ''

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
    // Directly remove transparent override — setting to empty string
    // reverts to the default (usually black) instead of relying on inherit
    span.style.removeProperty('color')
    // Ensure visibility
    span.style.setProperty('color', 'inherit', 'important')
  }
}

/**
 * Removes bionic reading from every `<span>` inside the text layer
 * container, restoring their original text content and making them
 * transparent again.
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
