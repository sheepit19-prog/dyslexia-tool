export function generateSpellingSuggestions(word: string): string[] {
  if (!word || word.length < 2) return []

  const lower = word.toLowerCase()

  const misspellings: Record<string, string[]> = {
    'becuase': ['because'], 'becasue': ['because'], 'beacuse': ['because'],
    'recieve': ['receive'], 'receve': ['receive'],
    'beleive': ['believe'], 'belive': ['believe'],
    'occured': ['occurred'], 'seperate': ['separate'], 'seprate': ['separate'],
    'definately': ['definitely'], 'definetly': ['definitely'],
    'goverment': ['government'], 'govment': ['government'],
    'neccessary': ['necessary'], 'necesary': ['necessary'],
    'untill': ['until'], 'wierd': ['weird'],
    'thier': ['their', 'there'], 'peice': ['piece'],
    'freind': ['friend'], 'lenght': ['length'],
    'wriet': ['write'], 'wrod': ['word'],
    'taht': ['that'], 'jsut': ['just'],
    'dont': ["don't"], 'cant': ["can't"], 'wont': ["won't"],
    'theyr': ['their', "they're"],
    'alot': ['a lot'], 'althought': ['although'],
    'thik': ['think'],
    'rite': ['write', 'right'],
    'wit': ['with'], 'btu': ['but'], 'adn': ['and'],
    'hte': ['the'], 'fro': ['for'], 'yuo': ['you'],
    'tath': ['that'], 'form': ['from', 'form'],
    'liek': ['like'],
  }

  return misspellings[lower] || []
}

export const SNOOZE_DURATION = 300000
export const PAUSE_THRESHOLD = 10000
export const BACKSPACE_THRESHOLD = 3

export function getCurrentWordFromElement(
  element: HTMLElement
): { word: string; start: number; end: number } | null {
  let text = ''
  let cursorPos = 0

  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    const input = element as HTMLInputElement | HTMLTextAreaElement
    text = input.value
    cursorPos = input.selectionStart || 0
  } else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
    text = element.textContent || ''
    cursorPos = text.length
  }

  if (!text) return null

  const textBeforeCursor = text.substring(0, cursorPos)
  const words = textBeforeCursor.split(/[\s\n]+/)
  const currentWord = words[words.length - 1] || ''

  if (!currentWord.trim()) return null

  const wordStart = textBeforeCursor.lastIndexOf(currentWord)
  const wordEnd = cursorPos

  return { word: currentWord.trim(), start: wordStart, end: wordEnd }
}

export function replaceWordInElement(
  element: HTMLElement,
  newWord: string
): boolean {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    const input = element as HTMLInputElement | HTMLTextAreaElement
    const current = getCurrentWordFromElement(element)
    if (!current) return false

    const text = input.value
    const newText = text.substring(0, current.start) + newWord + text.substring(current.end)

    input.value = newText
    input.setSelectionRange(current.start + newWord.length, current.start + newWord.length)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()

    return true
  }

  return false
}
