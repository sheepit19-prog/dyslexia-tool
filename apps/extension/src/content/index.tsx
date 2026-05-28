const initStart = performance.now()
console.log('[Content Script] Init started at', initStart)

import { injectFontStyles, removeFontStyles } from './font-injection'
import { readSelectedText, stopReading } from './tts'
import { enableReadingRuler, disableReadingRuler } from './reading-ruler'
import { enableBionicReading, disableBionicReading } from './bionic-reading'
import { enableSpellingMonitor, disableSpellingMonitor } from './spelling/monitor'

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
    case 'BIONIC_READING_TOGGLE':
      if (message.payload.enabled) enableBionicReading()
      else disableBionicReading()
      sendResponse({ success: true })
      break
    case 'SPELLING_TOGGLE':
      if (message.payload.enabled) enableSpellingMonitor()
      else disableSpellingMonitor()
      sendResponse({ success: true })
      break
    default:
      sendResponse({ success: false, error: 'Unknown message type' })
  }
  return true
})

setTimeout(() => {
  const initEnd = performance.now()
  console.log(`[Content Script] Fully initialized in ${(initEnd - initStart).toFixed(1)}ms`)
}, 500)
