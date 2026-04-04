import { useState, useCallback, useRef } from 'react'

interface SpeechSynthesisResult {
  speakLetter: (letter: string, rate?: number) => Promise<void>
  speakLetterFireAndForget: (letter: string) => void
  speakWord: (word: string) => Promise<void>
  isSpeaking: boolean
  cancel: () => void
}

export function useSpeechSynthesis(): SpeechSynthesisResult {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, rate = 1): Promise<void> => {
    return new Promise((resolve) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices()
      const englishVoice = voices.find(v => 
        v.lang.startsWith('en') && v.name.includes('Google')
      ) || voices.find(v => v.lang.startsWith('en'))
      
      if (englishVoice) {
        utterance.voice = englishVoice
      }
      
      utterance.lang = 'en-US'
      utterance.rate = rate

      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }

      utteranceRef.current = utterance
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    })
  }, [])

  // Rate parameter now adjustable: higher = faster speech
  // 0.5 = slow, 1.0 = normal, 1.5 = fast, 2.0 = very fast
  
  // Phonetic letter names for clearer pronunciation
  const letterPhonetics: Record<string, string> = {
    a: 'ay',
    b: 'bee',
    c: 'cee',
    d: 'dee',
    e: 'ee',
    f: 'eff',
    g: 'gee',
    h: 'aitch',
    i: 'eye',
    j: 'jay',
    k: 'kay',
    l: 'ell',
    m: 'em',
    n: 'en',
    o: 'oh',
    p: 'pee',
    q: 'cue',
    r: 'ar',
    s: 'ess',
    t: 'tee',
    u: 'yu',
    v: 'vee',
    w: 'double yu',
    x: 'ex',
    y: 'why',
    z: 'zee',
  }
  
  const speakLetter = useCallback(
    (letter: string, rate: number = 1.0) => {
      const lower = letter.toLowerCase()
      const phonetic = letterPhonetics[lower] || lower
      return speak(phonetic, rate * 0.85)
    },
    [speak]
  )

  const speakLetterFireAndForget = useCallback((letter: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(letter)
    utterance.lang = navigator.language || 'en-US'
    utterance.rate = 1.0
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [])

  const speakWord = useCallback(
    (word: string) => speak(word, 0.9),
    [speak]
  )

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { speakLetter, speakLetterFireAndForget, speakWord, isSpeaking, cancel }
}
