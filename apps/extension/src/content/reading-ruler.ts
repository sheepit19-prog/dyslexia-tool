let rulerOverlay: HTMLElement | null = null
let rulerEnabled = false

function handleRulerMouseMove(event: MouseEvent) {
  if (!rulerOverlay || !rulerEnabled) return
  positionRulerAtY(event.clientY)
}

function positionRulerAtY(y: number) {
  if (!rulerOverlay) return
  rulerOverlay.style.top = `${y - 20}px`
}

export function enableReadingRuler() {
  if (rulerEnabled) return
  rulerEnabled = true

  rulerOverlay = document.createElement('div')
  rulerOverlay.id = 'dyslexia-reading-ruler'
  rulerOverlay.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:40px;background:linear-gradient(to bottom,rgba(59,130,246,0.1) 0%,rgba(59,130,246,0.25) 50%,rgba(59,130,246,0.1) 100%);pointer-events:none;z-index:2147483646;border-top:2px solid rgba(59,130,246,0.4);border-bottom:2px solid rgba(59,130,246,0.4)'

  document.body.appendChild(rulerOverlay)
  document.addEventListener('mousemove', handleRulerMouseMove)
  positionRulerAtY(window.innerHeight / 2)
}

export function disableReadingRuler() {
  rulerEnabled = false
  if (rulerOverlay) {
    rulerOverlay.remove()
    rulerOverlay = null
  }
  document.removeEventListener('mousemove', handleRulerMouseMove)
}
