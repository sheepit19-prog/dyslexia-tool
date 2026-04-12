import { generateSpellingSuggestions } from '../../shared/lib/companion-utils'
import { getCurrentWord, replaceCurrentWord } from './word-ops'
import { companionState } from './state'

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

  setTimeout(() => {
    container.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedWord = btn.getAttribute('data-word')
        if (selectedWord && replaceCurrentWord(selectedWord)) {
          companionState.lastFullWord = null
          container.remove()
        }
      })
    })

    const closeBtn = document.getElementById('close-suggestions')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        companionState.lastFullWord = null
        container.remove()
      })
    }
  }, 10)

  setTimeout(() => { if (container.parentNode) container.remove() }, 15000)
}
