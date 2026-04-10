/**
 * Content Script - Injected into Web Pages
 */

import {
  generateSpellingSuggestions,
  getCurrentWordFromElement,
  replaceWordInElement,
  SNOOZE_DURATION,
  PAUSE_THRESHOLD,
  BACKSPACE_THRESHOLD,
} from '../shared/lib/companion-utils'

console.log('[Content Script] Dyslexia Tool loaded')

// Inject font styles
function injectFontStyles(fontFamily: string = 'OpenDyslexic', lineHeight: number = 1.6) {
  document.body.classList.add('dyslexia-tool-active')

  // Inject @font-face for OpenDyslexic from extension bundle
  let fontFaceStyle = document.getElementById('dyslexia-tool-font-face') as HTMLStyleElement | null
  if (!fontFaceStyle) {
    fontFaceStyle = document.createElement('style')
    fontFaceStyle.id = 'dyslexia-tool-font-face'
    fontFaceStyle.textContent = `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Regular.woff2')}') format('woff2');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Bold.woff2')}') format('woff2');
        font-weight: bold;
        font-style: normal;
      }
    `
    document.head.appendChild(fontFaceStyle)
  }
  
  const style = document.createElement('style')
  style.id = 'dyslexia-tool-styles'
  style.textContent = `
    .dyslexia-tool-active * {
      font-family: '${fontFamily}', Verdana, Arial, sans-serif !important;
      line-height: ${lineHeight} !important;
      letter-spacing: 0.05em !important;
      word-spacing: 0.1em !important;
    }
  `
  document.head.appendChild(style)
}

function removeFontStyles() {
  const style = document.getElementById('dyslexia-tool-styles')
  if (style) style.remove()
  document.body.classList.remove('dyslexia-tool-active')
}

// Get current word from active text field
function getCurrentWord(): { word: string; start: number; end: number } | null {
  let activeElement: HTMLElement | null = document.activeElement as HTMLElement
  if (!activeElement || !(activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
    activeElement = savedActiveElement
  }
  if (!activeElement) return null
  
  // If we have a saved word from before backspacing, use it
  if (lastFullWord) {
    const wordData = getCurrentWordFromElement(activeElement)
    if (wordData) {
      return { word: lastFullWord, start: wordData.start, end: wordData.end }
    }
  }
  
  return getCurrentWordFromElement(activeElement)
}

// Replace word at cursor
function replaceCurrentWord(newWord: string) {
  let activeElement: HTMLElement | null = document.activeElement as HTMLElement
  if (!(activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
    activeElement = savedActiveElement
  }
  if (!activeElement) return false
  return replaceWordInElement(activeElement, newWord)
}

// Show spelling suggestions
function showSpellingSuggestions() {
  const current = getCurrentWord()
  console.log('[Content Script] showSpellingSuggestions called, current word:', current)
  
  if (!current) {
    console.log('[Content Script] No current word found')
    return
  }
  
  const suggestions = generateSpellingSuggestions(current.word)
  console.log('[Content Script] Suggestions for', current.word, ':', suggestions)
  
  const existing = document.getElementById('dyslexia-tool-suggestions')
  if (existing) existing.remove()
  
  // If no suggestions, show a message
  if (suggestions.length === 0) {
    const container = document.createElement('div')
    container.id = 'dyslexia-tool-suggestions'
    container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:2147483647;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.25);padding:16px;max-width:320px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border:2px solid #F59E0B'
    container.innerHTML = `
      <div>
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827">No suggestions for "${current.word}"</p>
        <p style="margin:0 0 12px;font-size:13px;color:#6B7280">Try: becuase, recieve, beleive, thier, hte, jsut</p>
        <button id="close-suggestions" style="padding:8px 16px;background:#6B7280;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer">Close</button>
      </div>
    `
    document.body.appendChild(container)
    setTimeout(() => { if (container.parentNode) container.remove() }, 5000)
    return
  }
  
  const container = document.createElement('div')
  container.id = 'dyslexia-tool-suggestions'
  container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:2147483647;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.25);padding:16px;max-width:320px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border:2px solid #3B82F6'
  
  const buttonsHtml = suggestions.map(s => 
    `<button class="suggestion-btn" data-word="${s}" style="display:inline-block;padding:8px 12px;margin:4px;background:#EFF6FF;color:#1E40AF;border:2px solid #3B82F6;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='#3B82F6';this.style.color='white'" onmouseout="this.style.background='#EFF6FF';this.style.color='#1E40AF'">${s}</button>`
  ).join('')
  
  container.innerHTML = `
    <div>
      <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827">Suggestions for "${current.word}":</p>
      <div style="margin-bottom:12px;background:#F9FAFB;padding:12px;border-radius:6px">${buttonsHtml}</div>
      <button id="close-suggestions" style="padding:8px 16px;background:#6B7280;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer">Close</button>
    </div>
  `
  
  document.body.appendChild(container)
  console.log('[Content Script] Suggestions panel added to DOM')
  
  // Handle clicks
  setTimeout(() => {
    container.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedWord = btn.getAttribute('data-word')
        if (selectedWord && replaceCurrentWord(selectedWord)) {
          lastFullWord = null
          container.remove()
        }
      })
    })
    
    const closeBtn = document.getElementById('close-suggestions')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        lastFullWord = null
        container.remove()
      })
    }
  }, 10)
  
  setTimeout(() => { if (container.parentNode) container.remove() }, 15000)
}

// Show companion notification
function showCompanionNotification(payload: { message: string; type?: 'spelling' | 'wording' }) {
  const existing = document.getElementById('dyslexia-tool-companion')
  if (existing) existing.remove()
  
  const container = document.createElement('div')
  container.id = 'dyslexia-tool-companion'
  
  const acceptId = `companion-accept-${Date.now()}`
  const dismissId = `companion-dismiss-${Date.now()}`
  
  container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:2147483647;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.25);padding:16px;max-width:300px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border:2px solid #3B82F6'
  
  container.innerHTML = `
    <div>
      <p style="margin:0;font-size:14px;font-weight:600;color:#111827;line-height:1.4">${payload.message}</p>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button id="${acceptId}" style="padding:8px 16px;background:#3B82F6;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer">Show suggestions</button>
        <button id="${dismissId}" style="padding:8px 16px;background:#F3F4F6;color:#374151;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer">Not now</button>
      </div>
    </div>
  `
  
  document.body.appendChild(container)
  
  setTimeout(() => {
    document.getElementById(acceptId)?.addEventListener('click', () => {
      console.log('[Content Script] Show suggestions clicked')
      container.remove()
      if (payload.type === 'spelling') {
        showSpellingSuggestions()
      }
    })
    document.getElementById(dismissId)?.addEventListener('click', () => {
      lastOfferTime = 0
      backspaceCount = 0
      lastFullWord = null // Clear saved word
      console.log('[Content Script] Dismissed - cleared lastFullWord')
      container.remove()
    })
  }, 10)
  
  setTimeout(() => { if (container.parentNode) container.remove() }, 15000)
}

// TTS Functions
let synth: SpeechSynthesis | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null

function readSelectedText() {
  const selectedText = window.getSelection()?.toString().trim()
  if (!selectedText) {
    alert('Please select some text first.')
    return
  }
  
  stopReading()
  synth = window.speechSynthesis
  currentUtterance = new SpeechSynthesisUtterance(selectedText)
  currentUtterance.rate = 0.9
  currentUtterance.lang = 'en-US'
  synth.speak(currentUtterance)
}

function stopReading() {
  if (synth) {
    synth.cancel()
    currentUtterance = null
  }
}

// Reading Ruler
let rulerOverlay: HTMLElement | null = null
let rulerEnabled = false

function enableReadingRuler() {
  if (rulerEnabled) return
  rulerEnabled = true
  
  rulerOverlay = document.createElement('div')
  rulerOverlay.id = 'dyslexia-reading-ruler'
  rulerOverlay.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:40px;background:linear-gradient(to bottom,rgba(59,130,246,0.1) 0%,rgba(59,130,246,0.25) 50%,rgba(59,130,246,0.1) 100%);pointer-events:none;z-index:2147483646;border-top:2px solid rgba(59,130,246,0.4);border-bottom:2px solid rgba(59,130,246,0.4)'
  
  document.body.appendChild(rulerOverlay)
  document.addEventListener('mousemove', handleRulerMouseMove)
  positionRulerAtY(window.innerHeight / 2)
}

function disableReadingRuler() {
  rulerEnabled = false
  if (rulerOverlay) {
    rulerOverlay.remove()
    rulerOverlay = null
  }
  document.removeEventListener('mousemove', handleRulerMouseMove)
}

function handleRulerMouseMove(event: MouseEvent) {
  if (!rulerOverlay || !rulerEnabled) return
  positionRulerAtY(event.clientY)
}

function positionRulerAtY(y: number) {
  if (!rulerOverlay) return
  rulerOverlay.style.top = `${y - 20}px`
}

// Companion Intelligence
let lastTypingTime = 0
let backspaceCount = 0
let companionEnabled = true
let lastOfferTime = 0
let lastFullWord: string | null = null // Save the word before backspacing

let savedActiveElement: HTMLElement | null = null
let currentTextField: HTMLElement | null = null
let keydownHandler: ((e: KeyboardEvent) => void) | null = null
let pauseCheckInterval: number | null = null

function setCompanionEnabled(enabled: boolean) {
  companionEnabled = enabled
  if (enabled) {
    lastOfferTime = 0
    backspaceCount = 0
  }
}

function startTypingDetection() {
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement
    const isTextField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable
    if (isTextField) startObservingTextField(target)
  })
}

function startObservingTextField(element: HTMLElement) {
  if (currentTextField && keydownHandler) {
    currentTextField.removeEventListener('keydown', keydownHandler)
  }
  if (pauseCheckInterval) {
    clearInterval(pauseCheckInterval)
    pauseCheckInterval = null
  }
  
  savedActiveElement = element
  currentTextField = element
  backspaceCount = 0
  lastTypingTime = Date.now()
  
  keydownHandler = (e: KeyboardEvent) => {
    const now = Date.now()
    
    if (e.key === 'Backspace') {
      // Save the current word BEFORE it gets deleted by backspacing
      if (backspaceCount === 0) {
        const currentWordData = getCurrentWordFromElement(element)
        if (currentWordData && currentWordData.word.length >= 3) {
          lastFullWord = currentWordData.word
          console.log('[Content Script] Saved word before backspacing:', lastFullWord)
        }
      }
      
      backspaceCount++
      const timeSinceLastOffer = now - lastOfferTime
      
      if (backspaceCount >= BACKSPACE_THRESHOLD && companionEnabled && timeSinceLastOffer > SNOOZE_DURATION) {
        console.log('[Content Script] Triggering spelling help')
        showStruggleHelp('spelling')
        lastOfferTime = now
        backspaceCount = 0
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      backspaceCount = 0
      lastTypingTime = now
    }
  }
  
  element.addEventListener('keydown', keydownHandler)
  
  pauseCheckInterval = window.setInterval(() => {
    if (!currentTextField || !companionEnabled) return
    
    const now = Date.now()
    const timeSinceTyping = now - lastTypingTime
    
    if (timeSinceTyping > PAUSE_THRESHOLD) {
      const timeSinceLastOffer = now - lastOfferTime
      if (timeSinceLastOffer > SNOOZE_DURATION) {
        showStruggleHelp('wording')
        lastOfferTime = now
        lastTypingTime = now
      }
    }
  }, 500)
}

function showStruggleHelp(type: 'spelling' | 'wording') {
  const message = type === 'spelling' ? 'Need help with spelling?' : 'Need help wording this?'
  showCompanionNotification({ message, type })
  backspaceCount = 0

  try {
    chrome.runtime.sendMessage({
      type: 'COMPANION_DETECTED_STRUGGLE',
      payload: { type: type === 'spelling' ? 'typing' : 'reading', confidence: 'medium' }
    })
  } catch (e) {
    console.warn('[Content Script] Failed to report struggle:', e)
  }
}

// Message listener
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

// Initialize
setTimeout(() => {
  startTypingDetection()
}, 500)

;(window as any).setCompanionEnabled = setCompanionEnabled
