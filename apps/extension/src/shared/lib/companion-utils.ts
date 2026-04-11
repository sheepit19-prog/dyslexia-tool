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
    'becuase': ['because'], 'becasue': ['because'], 'beacuse': ['because'],
    'becuse': ['because'], 'beause': ['because'], 'beauase': ['because'],
    'recieve': ['receive'], 'receve': ['receive'], 'receiive': ['receive'],
    'beleive': ['believe'], 'belive': ['believe'], 'beileve': ['believe'],
    'occured': ['occurred'], 'seperate': ['separate'], 'seprate': ['separate'],
    'definately': ['definitely'], 'definetly': ['definitely'], 'definatly': ['definitely'],
    'defanately': ['definitely'],
    'goverment': ['government'], 'govment': ['government'],
    'neccessary': ['necessary'], 'necesary': ['necessary'], 'neccesary': ['necessary'],
    'untill': ['until'], 'wierd': ['weird'],
    'thier': ['their', 'there'], 'peice': ['piece'],
    'freind': ['friend'], 'lenght': ['length'],
    'wriet': ['write'], 'wrod': ['word'],
    'taht': ['that'], 'jsut': ['just'],
    'dont': ["don't"], 'cant': ["can't"], 'wont': ["won't"],
    'couldnt': ["couldn't"], 'wouldnt': ["wouldn't"],
    'shouldnt': ["shouldn't"], 'didnt': ["didn't"],
    'isnt': ["isn't"], 'wasnt': ["wasn't"], 'hasnt': ["hasn't"],
    'theyr': ['their', "they're"],
    'alot': ['a lot'], 'althought': ['although'],
    'thik': ['think'],
    'rite': ['write', 'right'],
    'wit': ['with'], 'btu': ['but'], 'adn': ['and'],
    'hte': ['the'], 'fro': ['for'], 'yuo': ['you'],
    'tath': ['that'], 'form': ['from', 'form'],
    'liek': ['like'],
    'broud': ['proud'], 'dack': ['back'],
    'qrint': ['print'], 'dridge': ['bridge'], 'bark': ['dark', 'bark'],
    'doy': ['boy'], 'big': ['dig', 'big'], 'bream': ['dream'],
    'blay': ['play'], 'bear': ['dear', 'bear'], 'bust': ['dust', 'bust'],
    'qack': ['pack'], 'qaper': ['paper'],
    'bed': ['bed', 'deb'], 'dap': ['bap', 'dap'], 'bown': ['down', 'brown'],
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
    'siad': ['said'], 'olec': ['cole'], 'ni': ['in'],
    'teh': ['the'], 'ot': ['to', 'ot'], 'owrk': ['work'],
    'waht': ['what'], 'whcih': ['which'], 'witht': ['with'],
    'ahve': ['have'], 'ehlp': ['help'], 'nwe': ['new'],
    'hti': ['hit', 'the'], 'lsa': ['las', 'last'], 'omre': ['more'],
    'tahn': ['than'], 'nto': ['not', 'into'],
    'abck': ['back'], 'agian': ['again'],
    'ahd': ['had'], 'tiem': ['time'],
    'poeple': ['people'], 'owman': ['woman'], 'tnak': ['tank', 'thank'],
    'oen': ['one', 'own'], 'ferw': ['few'], 'htem': ['them'],
    'acomodate': ['accommodate'], 'accomodate': ['accommodate'],
    'recurence': ['recurrence'], 'transfered': ['transferred'],
    'targetting': ['targeting'], 'formated': ['formatted'],
    'beggining': ['beginning'],
    'surprize': ['surprise'], 'realise': ['realize'], 'recognise': ['recognize'],
    'usful': ['useful'],
    'truely': ['truly'],
    'arguement': ['argument'], 'judgement': ['judgment'],
    'grievence': ['grievance'],
    'signifigant': ['significant'],
    'relavent': ['relevant'],
    'preferance': ['preference'],
    'tolerence': ['tolerance'],
    'assistence': ['assistance'], 'importence': ['importance'],
    'definant': ['definite'], 'secrit': ['secret'], 'privit': ['private'],
    'behaveor': ['behavior'],
    'knok': ['knock'], 'wrestel': ['wrestle'], 'listn': ['listen'],
    'oftn': ['often'], 'sof': ['soft'], 'haf': ['half'],
    'ther': ['there', 'their'], 'thare': ['there'],
    'heer': ['here', 'hear'], 'ware': ['where', 'wear'],
    'acheive': ['achieve'], 'decieve': ['deceive'], 'percieve': ['perceive'],
    'neice': ['niece'], 'wiegh': ['weigh'], 'wheight': ['weight'],
    'yeild': ['yield'], 'veiw': ['view'],
    'cieled': ['concealed'], 'deciet': ['deceit'],
    'mischeif': ['mischief'],
    'mispell': ['misspell'], 'ocurrance': ['occurrence'],
    'occassion': ['occasion'], 'completly': ['completely'],
    'naturaly': ['naturally'], 'planing': ['planning'],
    'runing': ['running'], 'stoping': ['stopping'],
    'shoping': ['shopping'], 'swiming': ['swimming'],
    'completley': ['completely'], 'happly': ['happily'],
    'angrly': ['angrily'],
    'tommorow': ['tomorrow'], 'tommorrow': ['tomorrow'], 'tomorow': ['tomorrow'],
    'enviroment': ['environment'], 'temparature': ['temperature'],
    'intresting': ['interesting'], 'diffrent': ['different'], 'differnt': ['different'],
    'basicly': ['basically'], 'recomend': ['recommend'],
    'reccomend': ['recommend'], 'excersize': ['exercise'],
    'exersise': ['exercise'], 'definitly': ['definitely'],
    'definiton': ['definition'], 'excellant': ['excellent'],
    'finaly': ['finally'], 'totaly': ['totally'],
    'bizness': ['business'], 'buisness': ['business'],
    'bruther': ['brother'], 'sistor': ['sister'],
    'muvment': ['movement'], 'skience': ['science'],
    'gaurd': ['guard'], 'garantee': ['guarantee'],
    'greatful': ['grateful'], 'humerous': ['humorous'],
    'ignorence': ['ignorance'], 'immediatly': ['immediately'],
    'importent': ['important'], 'liason': ['liaison'],
    'liesure': ['leisure'], 'loosing': ['losing'],
    'managment': ['management'], 'posession': ['possession'],
    'privelege': ['privilege'], 'publically': ['publicly'],
    'religous': ['religious'], 'repitition': ['repetition'],
    'sargent': ['sergeant'], 'seige': ['siege'],
    'wether': ['whether'], 'whitch': ['which'],
    'writting': ['writing'], 'sence': ['sense'],
    'sentance': ['sentence'], 'grammer': ['grammar'],
    'acknowlege': ['acknowledge'], 'autum': ['autumn'],
    'hym': ['hymn'], 'solem': ['solemn'],
    'sucessful': ['successful'], 'sucess': ['success'],
    'necesarily': ['necessarily'],
    'acording': ['according'], 'accross': ['across'],
    'adress': ['address'], 'agressive': ['aggressive'],
    'aledge': ['allege'], 'alredy': ['already'],
    'amature': ['amateur'], 'apper': ['appear'],
    'aquire': ['acquire'], 'artic': ['arctic'],
    'calender': ['calendar'], 'catagory': ['category'],
    'cemetary': ['cemetery'], 'collegue': ['colleague'],
    'commitee': ['committee'], 'concious': ['conscious'],
    'curiousity': ['curiosity'],
    'desparate': ['desperate'], 'difficalty': ['difficulty'],
    'disapear': ['disappear'], 'dilema': ['dilemma'],
    'dissapoint': ['disappoint'], 'ecstacy': ['ecstasy'],
    'embarras': ['embarrass'],
    'existance': ['existence'], 'explaination': ['explanation'],
    'facinate': ['fascinate'], 'firey': ['fiery'],
    'fourty': ['forty'],
    'fullfil': ['fulfill'],
    'harrass': ['harass'], 'heros': ['heroes'],
    'humer': ['humor'], 'idiosyncracy': ['idiosyncrasy'],
    'immedate': ['immediate'], 'incidently': ['incidentally'],
    'independant': ['independent'], 'innocense': ['innocence'],
    'interupt': ['interrupt'], 'irresistable': ['irresistible'],
    'knowlege': ['knowledge'], 'labratory': ['laboratory'],
    'libary': ['library'], 'liberry': ['library'],
    'maintenence': ['maintenance'],
    'medival': ['medieval'], 'millenium': ['millennium'],
    'minature': ['miniature'], 'mischievious': ['mischievous'],
    'noticable': ['noticeable'], 'ocasion': ['occasion'],
    'occurence': ['occurrence'], 'paralel': ['parallel'],
    'pasttime': ['pastime'],
    'persistant': ['persistent'], 'personell': ['personnel'],
    'playwrite': ['playwright'],
    'potatoe': ['potato'], 'prefered': ['preferred'],
    'privelige': ['privilege'], 'professer': ['professor'],
    'prominant': ['prominent'], 'prufe': ['proof'],
    'quesion': ['question'],
    'refered': ['referred'],
    'refrence': ['reference'], 'relevent': ['relevant'],
    'resistence': ['resistance'], 'responsability': ['responsibility'],
    'restraunt': ['restaurant'], 'saftey': ['safety'],
    'seargent': ['sergeant'],
    'sieze': ['seize'],
    'speach': ['speech'], 'strenght': ['strength'],
    'succesful': ['successful'], 'suprise': ['surprise'],
    'temperture': ['temperature'], 'tendancy': ['tendency'],
    'therefor': ['therefore'], 'threshhold': ['threshold'],
    'truley': ['truly'],
    'tyrany': ['tyranny'], 'underate': ['underrate'],
    'unfortunatly': ['unfortunately'], 'unnecesary': ['unnecessary'],
    'upholstry': ['upholstery'], 'usible': ['usable'],
    'utensle': ['utensil'], 'vegatable': ['vegetable'],
    'visious': ['vicious'],
    'absense': ['absence'], 'accomplise': ['accomplice'],
    'affraid': ['afraid'], 'agression': ['aggression'],
    'allegience': ['allegiance'], 'aniversary': ['anniversary'],
    'aparent': ['apparent'], 'aquit': ['acquit'],
    'assasinate': ['assassinate'], 'benifit': ['benefit'],
    'burgler': ['burglar'], 'camoflage': ['camouflage'],
    'capitol': ['capital'], 'chauffer': ['chauffeur'],
    'colum': ['column'], 'congradulate': ['congratulate'],
    'controversel': ['controversial'], 'coridor': ['corridor'],
    'develope': ['develop'], 'disasterous': ['disastrous'],
    'documant': ['document'], 'eigth': ['eight'],
    'exaust': ['exhaust'], 'exilerate': ['exhilarate'],
    'expidite': ['expedite'], 'extrordinary': ['extraordinary'],
    'Febuary': ['February'], 'flourescent': ['fluorescent'],
    'forhead': ['forehead'], 'forsaw': ['foresaw'],
    'fourm': ['forum'], 'genuin': ['genuine'],
    'guidence': ['guidance'], 'hygeine': ['hygiene'],
    'imige': ['image'], 'impotant': ['important'],
    'inconvienient': ['inconvenient'], 'indispensible': ['indispensable'],
    'innoculate': ['inoculate'], 'inteligence': ['intelligence'],
    'irrevelant': ['irrelevant'], 'jewlery': ['jewelry'],
    'judgemant': ['judgment'], 'kernal': ['kernel'],
    'lisence': ['license'], 'medeval': ['medieval'],
    'mischevous': ['mischievous'], 'momento': ['memento'],
    'nineth': ['ninth'], 'noteable': ['notable'],
    'obedeince': ['obedience'], 'occassional': ['occasional'],
    'offically': ['officially'], 'oportunity': ['opportunity'],
    'outragous': ['outrageous'], 'parliment': ['parliament'],
    'perseverence': ['perseverance'], 'pharoah': ['pharaoh'],
    'potatos': ['potatoes'], 'practicle': ['practical'],
    'prairy': ['prairie'], 'preceed': ['precede'],
    'probly': ['probably'], 'procede': ['proceed'],
    'profeser': ['professor'], 'progam': ['program'],
    'readible': ['readable'], 'rythem': ['rhythm'],
    'similer': ['similar'], 'supercede': ['supersede'],
    'nieghbor': ['neighbor'],
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
