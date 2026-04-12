import { generateSpellingSuggestions } from '../../shared/lib/companion-utils'
import { getCurrentWord, replaceCurrentWord } from './word-ops'
import { companionState } from './state'

function applyStylesSafe(element: HTMLElement, styles: Record<string, string>): boolean {
  try {
    const cssText = Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')
    element.style.cssText = cssText
    return element.style.cssText.length > 0
  } catch {
    return false
  }
}

export function showSpellingSuggestions() {
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

  if (suggestions.length === 0) {
    const container = document.createElement('div')
    container.id = 'dyslexia-tool-suggestions'

    const inlineSuccess = applyStylesSafe(container, {
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: '2147483647',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      padding: '16px',
      maxWidth: '320px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      border: '2px solid #F59E0B',
    })

    if (!inlineSuccess) {
      container.className = 'dyslexia-tool-suggestions-panel no-suggestions'
    }

    container.innerHTML = `
      <div>
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827">No suggestions for "${current.word}"</p>
        <p style="margin:0 0 12px;font-size:13px;color:#6B7280">Try: becuase, recieve, beleive, thier, hte, jsut</p>
        <button id="close-suggestions" class="dyslexia-tool-close-btn">Close</button>
      </div>
    `
    document.body.appendChild(container)
    setTimeout(() => { if (container.parentNode) container.remove() }, 5000)
    return
  }

  const container = document.createElement('div')
  container.id = 'dyslexia-tool-suggestions'

  const inlineSuccess = applyStylesSafe(container, {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: '2147483647',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    padding: '16px',
    maxWidth: '320px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    border: '2px solid #3B82F6',
  })

  if (!inlineSuccess) {
    container.className = 'dyslexia-tool-suggestions-panel has-suggestions'
  }

  const suggestionsDiv = document.createElement('div')
  suggestionsDiv.className = 'dyslexia-tool-suggestions-buttons'

  suggestions.forEach(s => {
    const btn = document.createElement('button')
    btn.className = 'dyslexia-tool-suggestion-btn'
    btn.textContent = s
    btn.dataset.word = s
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#3B82F6'
      btn.style.color = 'white'
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#EFF6FF'
      btn.style.color = '#1E40AF'
    })
    suggestionsDiv.appendChild(btn)
  })

  const closeBtn = document.createElement('button')
  closeBtn.id = 'close-suggestions'
  closeBtn.className = 'dyslexia-tool-close-btn'
  closeBtn.textContent = 'Close'

  const innerDiv = document.createElement('div')
  const title = document.createElement('p')
  title.className = 'dyslexia-tool-suggestions-title'
  title.textContent = `Suggestions for "${current.word}":`
  title.style.margin = '0 0 12px'
  title.style.fontSize = '15px'
  title.style.fontWeight = '600'
  title.style.color = '#111827'

  innerDiv.appendChild(title)
  innerDiv.appendChild(suggestionsDiv)
  innerDiv.appendChild(closeBtn)

  container.appendChild(innerDiv)
  document.body.appendChild(container)
  console.log('[Content Script] Suggestions panel added to DOM')

  setTimeout(() => {
    container.querySelectorAll('.dyslexia-tool-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedWord = (btn as HTMLElement).dataset.word
        if (selectedWord && replaceCurrentWord(selectedWord)) {
          companionState.lastFullWord = null
          container.remove()
        }
      })
    })

    const closeBtnEl = document.getElementById('close-suggestions')
    if (closeBtnEl) {
      closeBtnEl.addEventListener('click', () => {
        companionState.lastFullWord = null
        container.remove()
      })
    }
  }, 10)

  setTimeout(() => { if (container.parentNode) container.remove() }, 15000)
}
