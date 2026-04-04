import { motion } from 'framer-motion'

interface MicButtonProps {
  isListening: boolean
  onClick: () => void
}

export function MicButton({ isListening, onClick }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <motion.button
        onClick={onClick}
        className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 ${
          isListening ? 'bg-red-500' : 'bg-accent'
        }`}
        whileTap={{ scale: 0.93 }}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full bg-red-500/30"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-red-500/20"
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}

        {/* Idle pulse */}
        {!isListening && (
          <motion.span
            className="absolute inset-0 rounded-full bg-accent/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Mic icon */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="1" width="6" height="12" rx="3" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </motion.button>

      <p className="text-on-surface-muted text-lg">
        {isListening ? 'Listening...' : 'Tap to speak a word'}
      </p>
    </div>
  )
}
