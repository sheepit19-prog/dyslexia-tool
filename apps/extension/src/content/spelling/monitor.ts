import { getCorrection, getLastWord } from './engine'
import { showSuggestionPopup, hideSuggestionPopup, isSpellingPopup } from './ui'

const DEBOUNCE_MS = 600

let isActive = false
let timer: ReturnType<typeof setTimeout> | null = null

function isEditable(el: EventTarget | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false
  if (el instanceof HTMLInputElement) return el.type === 'text' || el.type === 'search' || el.type === 'email' || el.type === 'url'
  if (el instanceof HTMLTextAreaElement) return true
  if (el.getAttribute('contenteditable') === 'true') return true
  return false
}

function checkLastWord(el: HTMLElement) {
  let text: string
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    text = el.value.slice(0, el.selectionStart ?? el.value.length)
  } else {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const node = range.startContainer
    if (!node.textContent) return
    text = node.textContent.slice(0, range.startOffset)
  }

  const last = getLastWord(text)
  if (!last) return

  const suggestions = getCorrection(last.word)
  if (!suggestions) return

  showSuggestionPopup(el, last.word, suggestions, (replacement) => {
    applyFix(el, last.word, replacement)
  })
}

function applyFix(el: HTMLElement, original: string, replacement: string) {
  hideSuggestionPopup()

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const val = el.value
    const idx = val.lastIndexOf(original)
    if (idx === -1) return
    el.value = val.slice(0, idx) + replacement + val.slice(idx + original.length)
    el.selectionStart = idx + replacement.length
    el.selectionEnd = idx + replacement.length
    el.dispatchEvent(new Event('input', { bubbles: true }))
  } else {
    const text = el.textContent || ''
    const idx = text.lastIndexOf(original)
    if (idx === -1) return
    el.textContent = text.slice(0, idx) + replacement + text.slice(idx + original.length)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

function onInput(e: Event) {
  if (!isActive) return
  if (!isEditable(e.target)) return

  if (timer) clearTimeout(timer)
  const el = e.target as HTMLElement
  timer = setTimeout(() => {
    if (isActive && isEditable(el)) checkLastWord(el)
  }, DEBOUNCE_MS)
}

function onClick(e: MouseEvent) {
  if (!isSpellingPopup(e.target)) hideSuggestionPopup()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') hideSuggestionPopup()
}

export function enableSpellingMonitor() {
  if (isActive) return
  isActive = true
  document.addEventListener('input', onInput, true)
  document.addEventListener('click', onClick, true)
  document.addEventListener('keydown', onKeydown, true)
}

export function disableSpellingMonitor() {
  if (!isActive) return
  isActive = false
  if (timer) clearTimeout(timer)
  timer = null
  document.removeEventListener('input', onInput, true)
  document.removeEventListener('click', onClick, true)
  document.removeEventListener('keydown', onKeydown, true)
  hideSuggestionPopup()
}
