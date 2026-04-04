import { useState } from 'react'

interface CompanionNotificationProps {
  message: string
  onDismiss: () => void
}

export function CompanionNotification({ message, onDismiss }: CompanionNotificationProps) {
  const [_snoozed, setSnoozed] = useState(false)

  const handleDismiss = () => {
    setSnoozed(true)
    setTimeout(onDismiss, 300)
  }

  return (
    <div className="dyslexia-tool-notification">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
