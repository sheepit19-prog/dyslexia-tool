export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

const referenceWords: string[] = [
  'because', 'receive', 'believe', 'separate', 'definitely', 'necessary',
  'government', 'friend', 'their', 'there', 'write', 'right',
  'which', 'where', 'were', 'wear', 'through', 'thought',
  'although', 'together', 'different', 'important', 'interesting',
  'environment', 'beginning', 'beautiful', 'comfortable', 'possible',
  'probably', 'actually', 'basically', 'especially', 'particular',
  'experience', 'knowledge', 'language', 'paragraph', 'question',
  'remember', 'sentence', 'something', 'sometimes', 'surprise',
  'trouble', 'watching', 'working', 'writing', 'school', 'people',
  'little', 'mountain', 'country', 'picture', 'children', 'animal',
  'example', 'special', 'problem', 'complete', 'consider', 'develop',
  'machine', 'produce', 'various', 'natural', 'surface', 'without',
  'million', 'position', 'continue', 'increase', 'several',
  'suddenly', 'standard', 'industry', 'movement', 'business',
  'occasion', 'exercise', 'strength', 'straight', 'difficult', 'excellent',
  'familiar', 'favorite', 'generous', 'gathering', 'hurricane', 'imagine',
  'journal', 'knocking', 'library', 'material', 'original',
  'personal', 'railroad', 'science', 'thousand',
  'umbrella', 'vacation', 'weather', 'measure', 'pleasure', 'treasure',
  'capture', 'mixture', 'culture', 'adventure', 'creature',
  'century', 'general', 'village', 'message', 'passage',
  'advance', 'balance', 'evidence', 'influence', 'practice', 'service',
  'silence', 'violence', 'distance', 'instance', 'substance', 'accident',
  'recent', 'confident', 'independent', 'innocent',
  'patient', 'ancient', 'sufficient', 'transparent', 'intelligent',
  'absent', 'consistent', 'efficient', 'magnificent', 'permanent'
]

export function generateSpellingSuggestions(word: string): string[] {
  if (!word || word.length < 2) return []

  const lower = word.toLowerCase()

  const misspellings: Record<string, string[]> = {
    // because misspellings
    'becuase': ['because'], 'becasue': ['because'], 'beacuse': ['because'], 
    'becuse': ['because'], 'beause': ['because'], 'beauase': ['because'],
    
    // receive misspellings
    'recieve': ['receive'], 'receve': ['receive'], 'receiive': ['receive'],
    
    // believe misspellings
    'beleive': ['believe'], 'belive': ['believe'], 'beileve': ['believe'],
    
    // other common misspellings
    'occured': ['occurred'], 'seperate': ['separate'], 'seprate': ['separate'],
    'definately': ['definitely'], 'definetly': ['definitely'], 'definatly': ['definitely'],
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

    // Letter reversals (b/d, p/q)
    'broud': ['proud'], 'dack': ['back'], 'broad': ['broad'], 
    'qrint': ['print'], 'dridge': ['bridge'], 'bark': ['dark', 'bark'],
    'doy': ['boy'], 'big': ['dig', 'big'], 'bream': ['dream'],
    'blay': ['play'], 'bear': ['dear', 'bear'], 'bust': ['dust', 'bust'],
    'qack': ['pack'], 'qaper': ['paper'], 'quick': ['quick'],
    'bed': ['bed', 'deb'], 'dap': ['bap', 'dap'], 'bown': ['down', 'brown'],

    // Vowel confusions
    'depind': ['depend'], 'cammon': ['common'], 'studebt': ['student'],
    'slep': ['sleep'], 'brak': ['break', 'brick'], 'timw': ['time'],
    'homw': ['home'], 'comr': ['come'], 'makr': ['make'],
    'taks': ['takes', 'talks'], 'havw': ['have'], 'givr': ['give'],
    'lusw': ['lose'], 'movr': ['move'], 'lovr': ['love'],
    'becomr': ['become'], 'alivr': ['alive'], 'arrivr': ['arrive'],
    'desidr': ['decide'], 'desigr': ['design'], 'drivr': ['drive'],
    'practicr': ['practice'], 'noticr': ['notice'], 'choosr': ['choose'],
    'closw': ['close'], 'changr': ['change'], 'raisr': ['raise'],
    'usagr': ['usage'], 'continur': ['continue'], 'improvr': ['improve'],

    // Phonetic spelling
    'enuff': ['enough'], 'nolij': ['knowledge'], 'skool': ['school'],
    'sumwun': ['someone'], 'thay': ['they'], 'wuz': ['was'],
    'sed': ['said'], 'duz': ['does'], 'uv': ['of'],
    'iz': ['is'], 'hur': ['her', 'hair'], 'himdelf': ['himself'],
    'shur': ['sure', 'share'], 'werld': ['world'], 'ppl': ['people'],
    'bikoz': ['because'], 'wiz': ['with', 'wise'], 'tuk': ['took'],
    'puting': ['putting'], 'cum': ['come'], 'gud': ['good'],
    'beder': ['better'], 'grat': ['great', 'grant'], 'musik': ['music'],
    'muv': ['move'], 'luv': ['love'], 'nyse': ['nice'],
    'happi': ['happy'], 'veri': ['very'], 'sumting': ['something'],
    'onli': ['only'], 'reeli': ['really'], 'lern': ['learn'],
    'wuns': ['once', 'ones'], 'sou': ['so', 'show'],

    // Transpositions (expanded)
    'siad': ['said'], 'olec': ['cole'], 'ni': ['in'],
    'teh': ['the'], 'ot': ['to', 'ot'], 'owrk': ['work'],
    'waht': ['what'], 'whcih': ['which'], 'witht': ['with'],
    'ahve': ['have'], 'ehlp': ['help'], 'nwe': ['new'],
    'hti': ['hit', 'the'], 'lsa': ['las', 'last'], 'omre': ['more'],
    'owrk': ['work'], 'tahn': ['than'], 'nto': ['not', 'into'],
    'hte': ['the'], 'abck': ['back'], 'agian': ['again'],
    'ahd': ['had'], 'waht': ['what'], 'tiem': ['time'],
    'poeple': ['people'], 'owman': ['woman'], 'tnak': ['tank', 'thank'],
    'oen': ['one', 'own'], 'ferw': ['few'], 'htem': ['them'],

    // Double letter issues
    'occurence': ['occurrence'], 'adress': ['address'], 'acomodate': ['accommodate'],
    'accomodate': ['accommodate'], 'recurence': ['recurrence'], 'refrence': ['reference'],
    'prefered': ['preferred'], 'refered': ['referred'], 'transfered': ['transferred'],
    'targetting': ['targeting'], 'formated': ['formatted'], 'beggining': ['beginning'],
    'surprize': ['surprise'], 'realise': ['realize'], 'recognise': ['recognize'],
    'finaly': ['finally'], 'totaly': ['totally'], 'usful': ['useful'],
    'helpful': ['helpful'], 'powerful': ['powerful'], 'wonderful': ['wonderful'],

    // Prefix/suffix errors
    'unfortunatly': ['unfortunately'], 'happly': ['happily'], 'truely': ['truly'],
    'arguement': ['argument'], 'judgement': ['judgment'], 'noticable': ['noticeable'],
    'grievence': ['grievance'], 'maintenence': ['maintenance'], 'excellant': ['excellent'],
    'independant': ['independent'], 'persistant': ['persistent'], 'signifigant': ['significant'],
    'relavent': ['relevant'], 'innocense': ['innocence'], 'preferance': ['preference'],
    'tolerence': ['tolerance'], 'absence': ['absence'], 'resistence': ['resistance'],
    'assistence': ['assistance'], 'importence': ['importance'],
    'definant': ['definite'], 'secrit': ['secret'], 'privit': ['private'],
    'behaveor': ['behavior'], 'flavor': ['flavor'],

    // Common dyslexic patterns - silent letters
    'knight': ['knight'], 'knowlege': ['knowledge'], 'knok': ['knock'],
    'wrestel': ['wrestle'], 'listn': ['listen'], 'oftn': ['often'],
    'sof': ['soft'], 'haf': ['half'], 'calm': ['calm'],

    // Homophone confusion
    'ther': ['there', 'their'], 'thare': ['there'],
    'heer': ['here', 'hear'], 'ware': ['where', 'wear'],
    'no': ['know', 'no'], 'knew': ['new', 'knew'],
    'too': ['to', 'too', 'two'], 'too': ['to', 'too'],
    'peace': ['piece', 'peace'], 'weak': ['week', 'weak'],
    'hole': ['whole', 'hole'], 'plain': ['plane', 'plain'],
    'sail': ['sale', 'sail'], 'steal': ['steel', 'steal'],
    'board': ['bored', 'board'], 'brake': ['break', 'brake'],
    'grate': ['great', 'grate'], 'heard': ['herd', 'heard'],
  }

  const exact = misspellings[lower] || []
  if (exact.length > 0) return exact

  // Fuzzy matching fallback using Levenshtein distance
  const suggestions: Array<{ word: string; distance: number }> = []
  for (const ref of referenceWords) {
    if (Math.abs(ref.length - lower.length) > 2) continue
    const dist = levenshteinDistance(lower, ref)
    if (dist > 0 && dist <= 2) {
      suggestions.push({ word: ref, distance: dist })
    }
  }
  suggestions.sort((a, b) => a.distance - b.distance)
  return suggestions.slice(0, 5).map(s => s.word)
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
    // Use Selection/Range API for contentEditable cursor tracking
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const preRange = document.createRange()
      preRange.selectNodeContents(element)
      preRange.setEnd(range.startContainer, range.startOffset)
      cursorPos = preRange.toString().length
    } else {
      cursorPos = text.length
    }
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

  // contentEditable support using Selection/Range API
  if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
    const current = getCurrentWordFromElement(element)
    if (!current) return false

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const text = element.textContent || ''
    const before = text.substring(0, current.start)
    const after = text.substring(current.end)
    element.textContent = before + newWord + after

    const range = document.createRange()
    const textNode = element.firstChild
    if (textNode) {
      const newPos = current.start + newWord.length
      range.setStart(textNode, Math.min(newPos, textNode.textContent?.length ?? 0))
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    element.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  }

  return false
}
