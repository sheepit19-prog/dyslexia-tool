import { companionState } from './state'
import { showSpellingSuggestions } from './suggestions-ui'

function applyStylesSafe(element: HTMLElement, styles: Record<string, string>): boolean {
  try {
    const cssText = Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')
    element.style.cssText = cssText
    return element.style.cssText.length > 0
  } catch {
    return false
  }
}

export function showCompanionNotification(payload: { message: string; type?: 'spelling' | 'wording' }) {
  const existing = document.getElementById('dyslexia-tool-companion')
  if (existing) existing.remove()

  const container = document.createElement('div')
  container.id = 'dyslexia-tool-companion'

  const acceptId = `companion-accept-${Date.now()}`
  const dismissId = `companion-dismiss-${Date.now()}`

  const inlineSuccess = applyStylesSafe(container, {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: '2147483647',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    padding: '16px',
    maxWidth: '300px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    border: '2px solid #3B82F6',
  })

  if (!inlineSuccess) {
    container.className = 'dyslexia-tool-notification-panel'
  }

  container.innerHTML = `
    <div>
      <p class="dyslexia-tool-notification-message">${payload.message}</p>
      <div class="dyslexia-tool-notification-actions">
        <button id="${acceptId}" class="dyslexia-tool-accept-btn">Show suggestions</button>
        <button id="${dismissId}" class="dyslexia-tool-dismiss-btn">Not now</button>
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
      companionState.lastOfferTime = 0
      companionState.backspaceCount = 0
      companionState.lastFullWord = null
      console.log('[Content Script] Dismissed - cleared lastFullWord')
      container.remove()
    })
  }, 10)

  setTimeout(() => { if (container.parentNode) container.remove() }, 15000)
}
