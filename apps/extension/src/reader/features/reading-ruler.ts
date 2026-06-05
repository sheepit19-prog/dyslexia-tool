/**
 * Creates a fixed-position horizontal reading ruler overlay element
 * that tracks the mouse cursor's Y position.
 *
 * The ruler uses `pointer-events: none` so it never interferes with
 * text selection or other mouse interactions.
 *
 * @returns The ruler HTML element (already appended to `document.body`).
 */
export function createRuler(): HTMLElement {
  const ruler = document.createElement('div')
  ruler.id = 'dyslexia-reading-ruler'

  ruler.style.cssText =
    'position:fixed;' +
    'left:0;' +
    'top:0;' +
    'width:100vw;' +
    'height:30px;' +
    'background:linear-gradient(to bottom,' +
    'rgba(59,130,246,0.1) 0%,' +
    'rgba(59,130,246,0.25) 50%,' +
    'rgba(59,130,246,0.1) 100%);' +
    'pointer-events:none;' +
    'z-index:2147483646;' +
    'border-top:2px solid rgba(59,130,246,0.4);' +
    'border-bottom:2px solid rgba(59,130,246,0.4);'

  document.body.appendChild(ruler)

  const handleMouseMove = (event: MouseEvent) => {
    ruler.style.top = `${event.clientY - 15}px` // center ruler on cursor
  }

  // Store handler reference for cleanup
  ;(ruler as any).__dyslexiaRulerHandler = handleMouseMove

  document.addEventListener('mousemove', handleMouseMove)

  // Position initially at the vertical center of the viewport
  ruler.style.top = `${window.innerHeight / 2 - 15}px`

  return ruler
}

/**
 * Removes the reading ruler overlay, its event listeners, and the
 * element from the DOM.
 *
 * @param ruler The ruler element returned by {@link createRuler}.
 */
export function destroyRuler(ruler: HTMLElement): void {
  const handler = (ruler as any).__dyslexiaRulerHandler as
    | ((event: MouseEvent) => void)
    | undefined

  if (handler) {
    document.removeEventListener('mousemove', handler)
  }

  ruler.remove()
}
