import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settingsStore'

interface WordDisplayProps {
  word: string
}

export function WordDisplay({ word }: WordDisplayProps) {
  const letterSpacing = useSettingsStore((s) => s.letterSpacing)

  return (
    <motion.div
      className="text-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
    >
      <h1
        className="text-5xl sm:text-6xl md:text-7xl font-bold text-on-surface select-none"
        style={{ letterSpacing: `${letterSpacing}em` }}
      >
        {word}
      </h1>
    </motion.div>
  )
}
