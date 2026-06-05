/**
 * Reads the user's current text selection aloud using the Web Speech API.
 *
 * Returns the active `SpeechSynthesisUtterance` so the caller can listen
 * for its `end` and `error` events (e.g. to update UI state).
 *
 * @param speed The speech rate (default 1.0; typical values 0.5–2.0).
 * @returns The utterance that was queued, or `null` if no text is selected.
 */
export function speakSelection(
  speed = 1.0,
): SpeechSynthesisUtterance | null {
  const selectedText = window.getSelection()?.toString().trim()
  if (!selectedText) return null

  stopSpeaking()

  const utterance = new SpeechSynthesisUtterance(selectedText)
  utterance.rate = speed
  utterance.lang = 'en-US'

  window.speechSynthesis.speak(utterance)
  return utterance
}

/**
 * Cancels any currently-active speech synthesis.
 */
export function stopSpeaking(): void {
  window.speechSynthesis.cancel()
}
