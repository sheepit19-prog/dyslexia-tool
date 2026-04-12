import {
  SNOOZE_DURATION,
  PAUSE_THRESHOLD,
  BACKSPACE_THRESHOLD,
} from '../../shared/lib/companion-utils'
import { getCurrentWordFromElement } from '../../shared/lib/companion-utils'
import { companionState } from './state'
import { showCompanionNotification } from './notification-ui'

interface SensitivityThresholds {
  backspaceThreshold: number
  pauseThreshold: number
  snoozeDuration: number
}

async function getSensitivityThresholds(): Promise<SensitivityThresholds> {
  const result = await chrome.storage.local.get('settings')
  const sensitivity = result.settings?.companionSensitivity ?? 5

  const factor = sensitivity / 5

  return {
    backspaceThreshold: Math.max(1, Math.round(BACKSPACE_THRESHOLD / factor)),
    pauseThreshold: Math.round(PAUSE_THRESHOLD / factor),
    snoozeDuration: Math.round(SNOOZE_DURATION / factor),
  }
}

let cachedThresholds: SensitivityThresholds | null = null
let thresholdsLoadedAt = 0

async function getThresholds(): Promise<SensitivityThresholds> {
  const now = Date.now()
  if (cachedThresholds && now - thresholdsLoadedAt < 60000) {
    return cachedThresholds
  }
  cachedThresholds = await getSensitivityThresholds()
  thresholdsLoadedAt = now
  return cachedThresholds
}

function showStruggleHelp(type: 'spelling' | 'wording') {
  const message = type === 'spelling' ? 'Need help with spelling?' : 'Need help wording this?'
  showCompanionNotification({ message, type })
  companionState.backspaceCount = 0

  try {
    chrome.runtime.sendMessage({
      type: 'COMPANION_DETECTED_STRUGGLE',
      payload: { type: type === 'spelling' ? 'typing' : 'reading', confidence: 'medium' }
    })
  } catch (e) {
    console.warn('[Content Script] Failed to report struggle:', e)
  }
}

export function startTypingDetection() {
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement
    const isTextField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable
    if (isTextField) startObservingTextField(target)
  })
}

function startObservingTextField(element: HTMLElement) {
  if (companionState.currentTextField && companionState.keydownHandler) {
    companionState.currentTextField.removeEventListener('keydown', companionState.keydownHandler)
  }
  if (companionState.pauseCheckInterval) {
    clearInterval(companionState.pauseCheckInterval)
    companionState.pauseCheckInterval = null
  }

  companionState.savedActiveElement = element
  companionState.currentTextField = element
  companionState.backspaceCount = 0
  companionState.lastTypingTime = Date.now()

  companionState.keydownHandler = (e: KeyboardEvent) => {
    const now = Date.now()

    if (e.key === 'Backspace') {
      if (companionState.backspaceCount === 0) {
        const currentWordData = getCurrentWordFromElement(element)
        if (currentWordData && currentWordData.word.length >= 3) {
          companionState.lastFullWord = currentWordData.word
          console.log('[Content Script] Saved word before backspacing:', companionState.lastFullWord)
        }
      }

      companionState.backspaceCount++
      const timeSinceLastOffer = now - companionState.lastOfferTime

      getThresholds().then(thresholds => {
        if (companionState.backspaceCount >= thresholds.backspaceThreshold && companionState.companionEnabled && timeSinceLastOffer > thresholds.snoozeDuration) {
          console.log('[Content Script] Triggering spelling help')
          showStruggleHelp('spelling')
          companionState.lastOfferTime = now
          companionState.backspaceCount = 0
        }
      })
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      companionState.backspaceCount = 0
      companionState.lastTypingTime = now
    }
  }

  element.addEventListener('keydown', companionState.keydownHandler)

  companionState.pauseCheckInterval = window.setInterval(async () => {
    if (!companionState.currentTextField || !companionState.companionEnabled) return

    const now = Date.now()
    const timeSinceTyping = now - companionState.lastTypingTime
    const thresholds = await getThresholds()

    if (timeSinceTyping > thresholds.pauseThreshold) {
      const timeSinceLastOffer = now - companionState.lastOfferTime
      if (timeSinceLastOffer > thresholds.snoozeDuration) {
        showStruggleHelp('wording')
        companionState.lastOfferTime = now
        companionState.lastTypingTime = now
      }
    }
  }, 500)
}
