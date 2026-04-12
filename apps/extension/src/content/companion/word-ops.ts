import { getCurrentWordFromElement, replaceWordInElement } from '../../shared/lib/companion-utils'
import { companionState } from './state'

export function getCurrentWord(): { word: string; start: number; end: number } | null {
  let activeElement: HTMLElement | null = document.activeElement as HTMLElement
  if (!activeElement || !(activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
    activeElement = companionState.savedActiveElement
  }
  if (!activeElement) return null

  if (companionState.lastFullWord) {
    const wordData = getCurrentWordFromElement(activeElement)
    if (wordData) {
      return { word: companionState.lastFullWord, start: wordData.start, end: wordData.end }
    }
  }

  return getCurrentWordFromElement(activeElement)
}

export function replaceCurrentWord(newWord: string) {
  let activeElement: HTMLElement | null = document.activeElement as HTMLElement
  if (!(activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
    activeElement = companionState.savedActiveElement
  }
  if (!activeElement) return false
  return replaceWordInElement(activeElement, newWord)
}
