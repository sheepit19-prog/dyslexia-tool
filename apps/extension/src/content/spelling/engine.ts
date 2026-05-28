export interface Correction {
  original: string
  suggestions: string[]
  start: number
  end: number
}

export const DYSLEXIC_ERRORS: Record<string, string[]> = {
  'becuase': ['because'],
  'beacuse': ['because'],
  'becasue': ['because'],
  'beacause': ['because'],
  'definately': ['definitely'],
  'definatly': ['definitely'],
  'defiantly': ['definitely'],
  'definitly': ['definitely'],
  'seperate': ['separate'],
  'seperat': ['separate'],
  'recieve': ['receive'],
  'recive': ['receive'],
  'beleive': ['believe'],
  'beleve': ['believe'],
  'occured': ['occurred'],
  'ocurred': ['occurred'],
  'tommorow': ['tomorrow'],
  'tomorow': ['tomorrow'],
  'tommorrow': ['tomorrow'],
  'accomodate': ['accommodate'],
  'freind': ['friend'],
  'wierd': ['weird'],
  'neccessary': ['necessary'],
  'necesary': ['necessary'],
  'thier': ['their', 'there'],
  'alot': ['a lot'],
  'begining': ['beginning'],
  'calender': ['calendar'],
  'collegue': ['colleague'],
  'concious': ['conscious'],
  'enviroment': ['environment'],
  'explaination': ['explanation'],
  'goverment': ['government'],
  'grammer': ['grammar'],
  'immediatly': ['immediately'],
  'independant': ['independent'],
  'knowlege': ['knowledge'],
  'libary': ['library'],
  'maintenence': ['maintenance'],
  'noticable': ['noticeable'],
  'occassion': ['occasion'],
  'persistant': ['persistent'],
  'posession': ['possession'],
  'prefered': ['preferred'],
  'privlege': ['privilege'],
  'priviledge': ['privilege'],
  'relevent': ['relevant'],
  'remeber': ['remember'],
  'rember': ['remember'],
  'resistence': ['resistance'],
  'sieze': ['seize'],
  'speach': ['speech'],
  'strenght': ['strength'],
  'succesful': ['successful'],
  'successfull': ['successful'],
  'suprise': ['surprise'],
  'surprize': ['surprise'],
  'tounge': ['tongue'],
  'untill': ['until'],
  'wich': ['which', 'witch'],
  'writting': ['writing'],
  'writen': ['written'],
  'basicly': ['basically'],
  'actualy': ['actually'],
  'accidently': ['accidentally'],
  'absolutly': ['absolutely'],
  'realy': ['really'],
  'verry': ['very'],
}

export const TRANSPOSITIONS: Record<string, string> = {
  'teh': 'the',
  'hte': 'the',
  'taht': 'that',
  'jsut': 'just',
  'juts': 'just',
  'adn': 'and',
  'nad': 'and',
  'btu': 'but',
  'fo': 'of',
  'ahve': 'have',
  'hvae': 'have',
  'hsa': 'has',
  'hwo': 'how',
  'owrk': 'work',
  'wrok': 'work',
  'hten': 'then',
  'htere': 'there',
  'thsi': 'this',
  'tiem': 'time',
  'waht': 'what',
  'wnat': 'want',
  'yuo': 'you',
  'yuor': 'your',
  'frm': 'from',
  'frmo': 'from',
  'ofr': 'for',
  'abck': 'back',
  'agian': 'again',
  'beofre': 'before',
  'coudl': 'could',
  'dont': "don't",
  'cant': "can't",
  'wont': "won't",
  'isnt': "isn't",
  'wasnt': "wasn't",
  'werent': "weren't",
  'wouldnt': "wouldn't",
  'couldnt': "couldn't",
  'shouldnt': "shouldn't",
  'hasnt': "hasn't",
  'havent': "haven't",
  'hadnt': "hadn't",
  'arent': "aren't",
  'doesnt': "doesn't",
  'didnt': "didn't",
  'thye': 'they',
  'liek': 'like',
  'nwe': 'new',
  'owuld': 'would',
  'si': 'is',
  'soem': 'some',
  'somthing': 'something',
  'smoe': 'some',
  'veyr': 'very',
}

export function getCorrection(word: string): string[] | null {
  const lower = word.toLowerCase().replace(/[^a-z']/g, '')
  if (lower.length < 3) return null

  if (TRANSPOSITIONS[lower]) return [TRANSPOSITIONS[lower]]
  if (DYSLEXIC_ERRORS[lower]) return DYSLEXIC_ERRORS[lower]

  return null
}

export function getLastWord(text: string): { word: string; start: number; end: number } | null {
  const match = text.match(/([a-zA-Z']+)\s*[.,;:!?)]?\s*$/)
  if (!match) return null
  const word = match[1]
  if (word.length < 3) return null
  const end = text.lastIndexOf(word) + word.length
  const start = end - word.length
  return { word, start, end }
}
