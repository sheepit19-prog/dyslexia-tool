import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settingsStore'

interface LetterAnimationProps {
  word: string
  currentIndex: number // -1 = not started, word.length = done
  isSpelling: boolean
}

export function LetterAnimation({ word, currentIndex, isSpelling }: LetterAnimationProps) {
  const letterSpacing = useSettingsStore((s) => s.letterSpacing)
  const accentColor = useSettingsStore((s) => s.accentColor)
  const letters = word.split('')

  return (
    <div
      className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap"
      style={{ letterSpacing: `${letterSpacing}em` }}
    >
      {letters.map((letter, i) => {
        const isCurrent = isSpelling && i === currentIndex
        const isPast = i < currentIndex
        const isFuture = !isSpelling || i > currentIndex

        return (
          <motion.span
            key={i}
            className="text-5xl sm:text-6xl md:text-7xl font-bold inline-block select-none"
            animate={{
              scale: isCurrent ? 1.3 : 1,
              color: isCurrent
                ? accentColor
                : isPast
                  ? accentColor
                  : isFuture
                    ? 'var(--color-on-surface-muted)'
                    : 'var(--color-on-surface)',
              opacity: isFuture && isSpelling ? 0.35 : 1,
            }}
            transition={
              isCurrent
                ? { type: 'spring', damping: 10, stiffness: 300 }
                : { duration: 0.2 }
            }
            style={{
              textShadow: isCurrent ? `0 0 20px ${accentColor}40` : 'none',
            }}
          >
            {letter}
          </motion.span>
        )
      })}
    </div>
  )
}
