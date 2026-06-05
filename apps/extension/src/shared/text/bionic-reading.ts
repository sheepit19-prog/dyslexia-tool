/**
 * Pure text-transformation utility for bionic reading.
 *
 * Splits text into words and wraps the first portion of each word
 * (default ~45%) in `<b>` tags to create a "bionic reading" effect.
 *
 * This function is pure — it has no DOM dependency and can be used
 * from content scripts (TreeWalker-based) or reader page features
 * (span-based).
 *
 * @param text  The raw text to transform.
 * @param ratio Fraction of each word to bold (default 0.45).
 * @returns Text with `<b>` tags wrapping the bold-leading portion of words.
 */
export function applyBionicReading(text: string, ratio = 0.45): string {
  return text.replace(/\S+/g, (word) => {
    // Short words (1–2 chars) are not split.
    if (word.length < 3) return word

    const splitAt = Math.max(1, Math.ceil(word.length * ratio))
    return `<b>${word.slice(0, splitAt)}</b>${word.slice(splitAt)}`
  })
}
