const DATA_ATTR = 'data-dyslexia-bionic'
const BOLD_RATIO_DEFAULT = 0.45
const MAX_TEXT_LENGTH = 3000
const PROCESS_BATCH = 150
// Hard ceiling on how many text nodes we touch. Each processed node becomes a
// container plus two spans per word, so on pathological pages (huge feeds)
// unbounded processing froze the tab. Past this we simply stop — bionic applies
// to the first chunk, the rest stays plain.
const MAX_TOTAL_NODES = 8000
const OBSERVE_OPTS: MutationObserverInit = { childList: true, subtree: true }

let observer: MutationObserver | null = null
let isActive = false
let boldRatio = BOLD_RATIO_DEFAULT
let queue: Text[] = []
let scheduled = false
let processedCount = 0

const EXCLUDED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT',
  'CODE', 'PRE', 'SVG', 'MATH', 'RUBY', 'RT', 'RP'
])

// Tags that are bold by default. Used to skip already-bold text without calling
// getComputedStyle, which would force a synchronous style recalc on every node.
const BOLD_TAGS = new Set([
  'B', 'STRONG', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TH'
])

function isExcluded(el: Element): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return true
  if (el.getAttribute('contenteditable') === 'true') return true
  if (el.hasAttribute(DATA_ATTR)) return true
  return false
}

/**
 * Cheap "is this text already bold" check that walks the ancestor chain looking
 * at tag names and inline font-weight only. We deliberately avoid
 * getComputedStyle here: it forces a synchronous style/layout flush, and because
 * processing interleaves DOM mutations, calling it per node caused severe layout
 * thrashing (pages froze while toggling bionic). Class-based bold from external
 * stylesheets is no longer detected, which is harmless — bionic just leaves such
 * words fully bold.
 */
function isBoldParent(node: Node | null): boolean {
  let cur = node instanceof Element ? node : node?.parentElement
  while (cur && cur !== document.body) {
    if (BOLD_TAGS.has(cur.tagName)) return true
    const inline = (cur as HTMLElement).style?.fontWeight
    if (inline === 'bold' || (inline !== '' && parseInt(inline) >= 700)) return true
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

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function processTextNode(textNode: Text): boolean {
  if (!textNode.parentNode || shouldSkip(textNode)) return false
  if (isBoldParent(textNode.parentElement)) return false

  const text = textNode.textContent!
  // Using inline spans with explicit font-weight for maximum site compatibility.
  // Inline styles resist site CSS overrides that can suppress <b> tag defaults.
  // Page text is untrusted, so every fragment is HTML-escaped before it goes
  // back through innerHTML (the split is computed on the raw word so we never
  // cut an entity in half).
  const html = text.replace(/\S+/g, (word) => {
    if (word.length < 3) return escapeHtml(word)
    const splitAt = Math.max(1, Math.ceil(word.length * boldRatio))
    return `<span ${DATA_ATTR}="b" style="font-weight:700">${escapeHtml(word.slice(0, splitAt))}</span><span ${DATA_ATTR}="r" style="font-weight:inherit">${escapeHtml(word.slice(splitAt))}</span>`
  })
  if (html === text) return false

  const container = document.createElement('span')
  container.setAttribute(DATA_ATTR, 'c')
  container.setAttribute('data-orig', text)
  container.innerHTML = html
  textNode.parentNode.replaceChild(container, textNode)
  return true
}

function collectAllTextNodes(root: Node, limit = Infinity): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    }
  })
  let n: Node | null
  while ((n = walker.nextNode())) {
    nodes.push(n as Text)
    if (nodes.length >= limit) break
  }
  return nodes
}

function flushQueue() {
  scheduled = false
  if (!isActive || queue.length === 0) return

  const batch = queue.splice(0, PROCESS_BATCH)
  // Pause observation while we rewrite the DOM, then drop the records our own
  // writes produced before resuming — otherwise the observer re-wakes on every
  // span we insert.
  observer?.disconnect()
  for (const t of batch) {
    if (processedCount >= MAX_TOTAL_NODES) break
    if (t.parentNode && processTextNode(t)) processedCount++
  }
  observer?.takeRecords()
  if (isActive) observer?.observe(document.body, OBSERVE_OPTS)

  if (queue.length > 0 && processedCount < MAX_TOTAL_NODES) {
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
  processedCount = 0

  queue = collectAllTextNodes(document.body, MAX_TOTAL_NODES)
  scheduleQueue()

  let timer: ReturnType<typeof setTimeout> | null = null
  observer = new MutationObserver((mutations) => {
    if (!isActive) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (!isActive || processedCount >= MAX_TOTAL_NODES) return
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

  observer.observe(document.body, OBSERVE_OPTS)
}

export function disableBionicReading(): void {
  if (!isActive) return
  isActive = false
  scheduled = false
  queue = []
  processedCount = 0
  observer?.disconnect()
  observer = null
  restoreAll()
}
