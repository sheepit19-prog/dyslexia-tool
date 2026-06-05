const DATA_ATTR = 'data-dyslexia-bionic'
const BOLD_RATIO_DEFAULT = 0.45
const MAX_TEXT_LENGTH = 3000
const PROCESS_BATCH = 150

let observer: MutationObserver | null = null
let isActive = false
let boldRatio = BOLD_RATIO_DEFAULT
let queue: Text[] = []
let scheduled = false

const EXCLUDED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT',
  'CODE', 'PRE', 'SVG', 'MATH', 'RUBY', 'RT', 'RP'
])

function isExcluded(el: Element): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return true
  if (el.getAttribute('contenteditable') === 'true') return true
  if (el.hasAttribute(DATA_ATTR)) return true
  return false
}

function isBoldParent(node: Node | null): boolean {
  let cur = node instanceof Element ? node : node?.parentElement
  while (cur) {
    const w = window.getComputedStyle(cur).fontWeight
    if (w === 'bold' || parseInt(w) >= 700) return true
    cur = cur.parentElement
  }
  return false
}

function shouldSkip(node: Node): boolean {
  const p = node.parentElement
  if (!p) return true
  if (isExcluded(p)) return true
  if (p.closest(`[${DATA_ATTR}]`)) return true
  const t = node.textContent
  if (!t || t.trim().length === 0 || t.length > MAX_TEXT_LENGTH) return true
  return false
}

function processTextNode(textNode: Text): void {
  if (!textNode.parentNode || shouldSkip(textNode)) return
  if (isBoldParent(textNode.parentElement)) return

  const text = textNode.textContent!
  // Using inline spans with explicit font-weight for maximum site compatibility.
  // Inline styles resist site CSS overrides that can suppress <b> tag defaults.
  const html = text.replace(/\S+/g, (word) => {
    if (word.length < 3) return word
    const splitAt = Math.max(1, Math.ceil(word.length * boldRatio))
    return `<span ${DATA_ATTR}="b" style="font-weight:700">${word.slice(0, splitAt)}</span><span ${DATA_ATTR}="r" style="font-weight:inherit">${word.slice(splitAt)}</span>`
  })
  if (html === text) return

  const container = document.createElement('span')
  container.setAttribute(DATA_ATTR, 'c')
  container.setAttribute('data-orig', text)
  container.innerHTML = html
  textNode.parentNode.replaceChild(container, textNode)
}

function collectAllTextNodes(root: Node): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    }
  })
  let n: Node | null
  while ((n = walker.nextNode())) nodes.push(n as Text)
  return nodes
}

function flushQueue() {
  scheduled = false
  if (!isActive || queue.length === 0) return

  const batch = queue.splice(0, PROCESS_BATCH)
  for (const t of batch) {
    if (t.parentNode) processTextNode(t)
  }

  if (queue.length > 0) {
    scheduled = true
    requestAnimationFrame(flushQueue)
  }
}

function scheduleQueue() {
  if (!scheduled && queue.length > 0) {
    scheduled = true
    requestAnimationFrame(flushQueue)
  }
}

function restoreAll(): void {
  document.querySelectorAll(`[${DATA_ATTR}="c"]`).forEach((el) => {
    const original = el.getAttribute('data-orig')
    if (original !== null) el.replaceWith(document.createTextNode(original))
  })
}

export function enableBionicReading(ratio?: number): void {
  if (isActive) return
  isActive = true
  boldRatio = ratio ?? BOLD_RATIO_DEFAULT

  queue = collectAllTextNodes(document.body)
  scheduleQueue()

  let timer: ReturnType<typeof setTimeout> | null = null
  observer = new MutationObserver((mutations) => {
    if (!isActive) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (!isActive) return
      const newNodes: Text[] = []
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement) || isExcluded(node)) continue
          newNodes.push(...collectAllTextNodes(node))
        }
      }
      if (newNodes.length > 0) {
        queue.push(...newNodes)
        scheduleQueue()
      }
    }, 300)
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

export function disableBionicReading(): void {
  if (!isActive) return
  isActive = false
  scheduled = false
  queue = []
  observer?.disconnect()
  observer = null
  restoreAll()
}
