import { describe, it, expect, beforeEach, vi } from 'vitest'
import { speakSelection, stopSpeaking } from '../tts'

describe('reader TTS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(window.speechSynthesis.cancel).mockClear()
    vi.mocked(window.speechSynthesis.speak).mockClear()
    // Clean up any leftover DOM nodes from prior tests
    document.body.innerHTML = ''
  })

  /** Helper: create a text node in the document and select it. */
  function selectText(text: string) {
    const div = document.createElement('div')
    div.textContent = text
    document.body.appendChild(div)

    const range = document.createRange()
    range.selectNodeContents(div.firstChild!)

    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
  }

  it('returns null when no text is selected', () => {
    const utterance = speakSelection()
    expect(utterance).toBeNull()
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled()
  })

  it('speaks selected text when text is selected', () => {
    selectText('Hello world')

    const utterance = speakSelection()

    expect(utterance).not.toBeNull()
    expect(utterance!.text).toBe('Hello world')
    expect(utterance!.lang).toBe('en-US')
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(utterance)
  })

  it('applies the custom speed to the utterance', () => {
    selectText('Fast')

    const utterance = speakSelection(1.5)

    expect(utterance!.rate).toBe(1.5)
  })

  it('cancels any previous speech before speaking new text', () => {
    selectText('New text')

    speakSelection()

    expect(window.speechSynthesis.cancel).toHaveBeenCalled()
  })

  it('stopSpeaking calls speechSynthesis.cancel()', () => {
    stopSpeaking()
    expect(window.speechSynthesis.cancel).toHaveBeenCalled()
  })

  it('trims whitespace from selection', () => {
    selectText('  padded  ')

    const utterance = speakSelection()
    expect(utterance!.text).toBe('padded')
  })

  it('returns null for whitespace-only selection', () => {
    selectText('   \n\t  ')

    const utterance = speakSelection()
    expect(utterance).toBeNull()
  })
})
