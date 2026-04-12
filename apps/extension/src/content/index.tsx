const initStart = performance.now()
console.log('[Content Script] Init started at', initStart)

import { injectFontStyles, removeFontStyles } from './font-injection'
import { readSelectedText, stopReading } from './tts'
import { enableReadingRuler, disableReadingRuler } from './reading-ruler'
import { setCompanionEnabled } from './companion/state'
import { showCompanionNotification } from './companion/notification-ui'
import { startTypingDetection } from './companion/detection'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'FONT_APPLY_SETTINGS':
      if (message.payload.enabled) injectFontStyles(message.payload.fontFamily, message.payload.lineHeight)
      else removeFontStyles()
      sendResponse({ success: true })
      break
    case 'TTS_READ_SELECTION':
      readSelectedText()
      sendResponse({ success: true })
      break
    case 'TTS_STOP':
      stopReading()
      sendResponse({ success: true })
      break
    case 'READING_RULER_TOGGLE':
      if (message.payload.enabled) enableReadingRuler()
      else disableReadingRuler()
      sendResponse({ success: true })
      break
    case 'COMPANION_SHOW_NOTIFICATION':
      showCompanionNotification(message.payload)
      sendResponse({ success: true })
      break
    case 'COMPANION_SET_ENABLED':
      setCompanionEnabled(message.payload.enabled)
      sendResponse({ success: true })
      break
    default:
      sendResponse({ success: false, error: 'Unknown message type' })
  }
  return true
})

setTimeout(() => {
  startTypingDetection()
  const initEnd = performance.now()
  console.log(`[Content Script] Fully initialized in ${(initEnd - initStart).toFixed(1)}ms`)
}, 500)
