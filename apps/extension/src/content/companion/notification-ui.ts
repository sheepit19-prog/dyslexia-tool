import { companionState } from './state'
import { showSpellingSuggestions } from './suggestions-ui'

export function showCompanionNotification(payload: { message: string; type?: 'spelling' | 'wording' }) {
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
      companionState.lastOfferTime = 0
      companionState.backspaceCount = 0
      companionState.lastFullWord = null
      console.log('[Content Script] Dismissed - cleared lastFullWord')
      container.remove()
    })
  }, 10)

  setTimeout(() => { if (container.parentNode) container.remove() }, 15000)
}
