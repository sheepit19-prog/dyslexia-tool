import { Button } from '../shared/Button'
import { motion } from 'framer-motion'

interface SpellControlsProps {
  onSpell: () => void
  onNewWord: () => void
  onCopy: () => void
  onReplay: () => void
  isSpelling: boolean
  isDone: boolean
}

export function SpellControls({ onSpell, onNewWord, onCopy, onReplay, isSpelling, isDone }: SpellControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {!isDone && (
          <Button onClick={onSpell} disabled={isSpelling} size="lg">
            {isSpelling ? 'Spelling...' : 'Spell it'}
          </Button>
        )}
        {isDone && (
          <>
            <Button onClick={onSpell} variant="secondary" size="lg">
              Spell again
            </Button>
            <Button onClick={onNewWord} size="lg">
              New word
            </Button>
          </>
        )}
      </div>

      {/* Quick action buttons (copy + replay) - show after word is shown */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <Button onClick={onCopy} variant="ghost" size="md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </Button>
          <Button onClick={onReplay} variant="ghost" size="md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Replay
          </Button>
        </motion.div>
      )}
    </div>
  )
}
