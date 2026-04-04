import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav, type TabId } from './components/Layout/BottomNav'
import { Settings } from './components/Layout/Settings'
import { MicButton } from './components/SpellMode/MicButton'
import { WordDisplay } from './components/SpellMode/WordDisplay'
import { LetterAnimation } from './components/SpellMode/LetterAnimation'
import { SpellControls } from './components/SpellMode/SpellControls'
import { NotesList } from './components/VoiceNotes/NotesList'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import { useReminders } from './hooks/useReminders'
import { useSettingsStore } from './stores/settingsStore'

type SpellPhase = 'idle' | 'listening' | 'word-shown' | 'spelling' | 'done'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('spell')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { font, theme, accentColor, spellingSpeed } = useSettingsStore()

  // Spell Mode state
  const [spellPhase, setSpellPhase] = useState<SpellPhase>('idle')
  const [word, setWord] = useState('')
  const [currentLetterIndex, setCurrentLetterIndex] = useState(-1)
  const spellingRef = useRef(false)

  const { transcript, isListening, error, startListening, stopListening, supported } =
    useSpeechRecognition()
  const { speakLetter, speakWord, cancel } = useSpeechSynthesis()

  // Start the reminder checker
  useReminders()

  // Apply theme class to root
  const themeClass = theme === 'dark' ? 'theme-dark' : theme === 'high-contrast' ? 'theme-high-contrast' : ''
  const fontClass = font === 'opendyslexic' ? 'font-dyslexic' : ''

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      cancel()
      setSpellPhase('listening')
      setWord('')
      setCurrentLetterIndex(-1)
      startListening()
    }
  }, [isListening, startListening, stopListening, cancel])

  // Auto-transition from listening to word-shown
  useEffect(() => {
    if (!isListening && spellPhase === 'listening') {
      const displayWord = transcript.split(/\s+/)[0]?.toLowerCase() || ''
      if (displayWord) {
        setWord(displayWord)
        setSpellPhase('word-shown')
      } else {
        setSpellPhase('idle')
      }
    }
  }, [isListening, spellPhase, transcript])

  // Calculate speech rate based on spellingSpeed
  // Slower rates = clearer letter pronunciation, not just spacing
  const getSpeechRate = useCallback(() => {
    if (spellingSpeed <= 50) return 0.9     // Instant: slightly faster
    if (spellingSpeed <= 100) return 0.85   // Fast: still clear
    if (spellingSpeed <= 200) return 0.8    // Quick: clearer
    if (spellingSpeed <= 400) return 0.75   // Normal: good clarity
    if (spellingSpeed <= 800) return 0.7    // Slow: very clear
    return 0.6                              // Very slow: slowest
  }, [spellingSpeed])

  // Calculate actual delay between letters (can be much shorter than slider value)
  // This gives more control over the "feeling" of speed without breaking speech
  const getEffectiveDelay = useCallback(() => {
    if (spellingSpeed <= 50) return 5         // Instant: 5ms gap (almost no pause)
    if (spellingSpeed <= 100) return 10        // Fast: 10ms gap
    if (spellingSpeed <= 200) return 25         // Quick: 25ms gap
    if (spellingSpeed <= 400) return 50        // Normal: 50ms gap
    if (spellingSpeed <= 800) return 100        // Slow: 100ms gap
    return 150                                  // Very slow: 150ms
  }, [spellingSpeed])

  // Copy word to clipboard
  const handleCopy = useCallback(async () => {
    if (word) {
      await navigator.clipboard.writeText(word)
    }
  }, [word])

  // Replay spelling
  const handleReplay = useCallback(async () => {
    if (!word) return
    const rate = getSpeechRate()
    const delay = getEffectiveDelay()
    const vowels = new Set(['a', 'e', 'i', 'o', 'u'])
    
    for (let i = 0; i < word.length; i++) {
      await speakLetter(word[i], rate)
      
      // Add extra delay after vowels for clearer pronunciation
      const isVowel = vowels.has(word[i].toLowerCase())
      const extraDelay = isVowel ? delay * 2 : delay
      
      if (i < word.length - 1) {
        await new Promise((r) => setTimeout(r, extraDelay))
      }
    }
    await speakWord(word)
  }, [word, speakLetter, speakWord, getSpeechRate, getEffectiveDelay])

  const handleSpell = useCallback(async () => {
    if (!word) return
    
    const rate = getSpeechRate()
    const delay = getEffectiveDelay()
    const vowels = new Set(['a', 'e', 'i', 'o', 'u'])
    console.log('[handleSpell] Starting:', { spellingSpeed, rate, effectiveDelay: delay })
    
    setSpellPhase('spelling')
    setCurrentLetterIndex(-1)
    spellingRef.current = true

    const letters = word.split('')
    
    for (let i = 0; i < letters.length; i++) {
      if (!spellingRef.current) return
      
      setCurrentLetterIndex(i)
      
      // Speak letter with dynamic rate based on speed setting
      await speakLetter(letters[i], rate)
      
      // Add extra delay after vowels for clearer pronunciation
      const isVowel = vowels.has(letters[i].toLowerCase())
      const extraDelay = isVowel ? delay * 2 : delay
      
      // Add delay between letters (except after the last letter)
      if (spellingRef.current && i < letters.length - 1) {
        await new Promise((r) => setTimeout(r, extraDelay))
      }
    }

    if (spellingRef.current) {
      setCurrentLetterIndex(letters.length)
      // Brief pause before speaking the whole word
      await new Promise((r) => setTimeout(r, 400))
      await speakWord(word)
      setSpellPhase('done')
    }
  }, [word, speakLetter, speakWord, spellingSpeed, getSpeechRate, getEffectiveDelay])

  const handleNewWord = useCallback(() => {
    spellingRef.current = false
    cancel()
    setSpellPhase('idle')
    setWord('')
    setCurrentLetterIndex(-1)
  }, [cancel])

  return (
    <div
      className={`min-h-screen bg-surface text-on-surface ${themeClass} ${fontClass} relative`}
      style={{ '--color-accent': accentColor, '--color-accent-dark': accentColor + 'cc', '--color-accent-light': accentColor + '88' } as React.CSSProperties}
    >
      {/* Listening pulse ring - screen edge */}
      {isListening && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0 border-[6px] border-red-500/40 rounded-3xl"
            animate={{ scale: [1, 1.02], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Spelling progress pulse */}
      {spellPhase === 'spelling' && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0 border-[4px] border-accent/30 rounded-3xl"
            animate={{ scale: [1, 1.01], opacity: [0.3, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Completion flash */}
      {spellPhase === 'done' && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40 bg-green-500/20 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-on-surface">
          Dys<span style={{ color: accentColor }}>Spell</span>
        </h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-on-surface-muted hover:text-on-surface p-2 rounded-lg"
          aria-label="Settings"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15a1.65 1.65 0 0 0 1.51 1z" />
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'spell' ? (
            <motion.div
              key="spell"
              className="flex-1 flex flex-col items-center justify-center px-4 pb-24 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!supported && (
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl text-sm text-center max-w-md">
                  Speech recognition is not supported in this browser. Please use Chrome or Edge.
                </div>
              )}

              {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm text-center max-w-md">
                  {error}
                </div>
              )}

              {/* Live transcript */}
              {isListening && transcript && (
                <motion.p
                  className="text-lg text-on-surface-muted"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {transcript}
                </motion.p>
              )}

              {/* State label */}
              <motion.div
                key={spellPhase}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: isListening 
                    ? 'rgba(239, 68, 68, 0.15)' 
                    : spellPhase === 'spelling' 
                      ? 'rgba(var(--color-accent), 0.15)' 
                      : spellPhase === 'done' 
                        ? 'rgba(34, 197, 94, 0.15)' 
                        : 'var(--color-surface-dim)',
                  color: isListening 
                    ? '#ef4444' 
                    : spellPhase === 'spelling' 
                      ? 'var(--color-accent)' 
                      : spellPhase === 'done' 
                        ? '#22c55e' 
                        : 'var(--color-on-surface-muted)',
                }}
              >
                {isListening ? '🔴 Listening...' : 
                 spellPhase === 'spelling' ? '✋ Spelling...' : 
                 spellPhase === 'done' ? '✓ Done!' : 
                 '🎤 Tap to speak'}
              </motion.div>

              {/* Idle friendly prompt */}
              {spellPhase === 'idle' && !isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center space-y-2"
                >
                  <p className="text-on-surface-muted text-lg">
                    Say a word out loud
                  </p>
                  <p className="text-on-surface-muted/60 text-sm">
                    We'll spell it letter by letter
                  </p>
                </motion.div>
              )}

              {/* Spell phases */}
              {(spellPhase === 'idle' || spellPhase === 'listening') && (
                <MicButton isListening={isListening} onClick={handleMicClick} />
              )}

              {spellPhase === 'word-shown' && (
                <>
                  <WordDisplay word={word} />
                  <SpellControls
                    onSpell={handleSpell}
                    onNewWord={handleNewWord}
                    onCopy={handleCopy}
                    onReplay={handleReplay}
                    isSpelling={false}
                    isDone={false}
                  />
                  <button
                    onClick={handleMicClick}
                    className="text-sm text-on-surface-muted hover:text-on-surface"
                  >
                    Try a different word
                  </button>
                </>
              )}

              {(spellPhase === 'spelling' || spellPhase === 'done') && (
                <>
                  <LetterAnimation
                    word={word}
                    currentIndex={currentLetterIndex}
                    isSpelling={spellPhase === 'spelling'}
                  />
                  <SpellControls
                    onSpell={handleSpell}
                    onNewWord={handleNewWord}
                    onCopy={handleCopy}
                    onReplay={handleReplay}
                    isSpelling={spellPhase === 'spelling'}
                    isDone={spellPhase === 'done'}
                  />
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <NotesList />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
