const POPUP_ID = 'dyslexia-spelling-popup'
let onApply: ((replacement: string) => void) | null = null

function getPopup(): HTMLElement {
  let popup = document.getElementById(POPUP_ID)
  if (!popup) {
    popup = document.createElement('div')
    popup.id = POPUP_ID
    popup.style.cssText = `
      position:fixed;z-index:2147483647;
      background:#fff;border:1px solid #D1D5DB;border-radius:8px;
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
      padding:4px;min-width:100px;max-width:180px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      font-size:14px;display:none;
    `
    document.body.appendChild(popup)
  }
  return popup
}

export function showSuggestionPopup(
  element: HTMLElement,
  word: string,
  suggestions: string[],
  applyFn: (replacement: string) => void
) {
  hideSuggestionPopup()
  onApply = applyFn

  const popup = getPopup()
  popup.innerHTML = ''

  const label = document.createElement('div')
  label.style.cssText = 'padding:4px 10px 2px;font-size:11px;color:#9CA3AF;'
  label.textContent = `${word}  →`
  popup.appendChild(label)

  for (const s of suggestions) {
    const btn = document.createElement('button')
    btn.textContent = s
    btn.style.cssText = `
      display:block;width:100%;text-align:left;padding:6px 10px;
      border:none;background:none;cursor:pointer;border-radius:4px;
      font-size:14px;color:#111827;font-family:inherit;
    `
    btn.onmouseenter = () => { btn.style.background = '#EFF6FF' }
    btn.onmouseleave = () => { btn.style.background = 'none' }
    btn.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (onApply) onApply(s)
    }
    popup.appendChild(btn)
  }

  const rect = element.getBoundingClientRect()
  popup.style.top = `${rect.bottom + 6}px`
  popup.style.left = `${Math.min(rect.left, window.innerWidth - 200)}px`
  popup.style.display = 'block'
}

export function hideSuggestionPopup() {
  const popup = getPopup()
  popup.style.display = 'none'
  popup.innerHTML = ''
  onApply = null
}

export function isSpellingPopup(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  return target.id === POPUP_ID || !!target.closest(`#${POPUP_ID}`)
}
