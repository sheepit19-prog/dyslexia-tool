/**
 * Accessible toggle switch component
 */

import React from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange(!checked)
    }
  }

  return (
    <div className="flex items-start gap-5 py-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative mt-1 inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-8' : 'translate-x-1.5'
          }`}
        />
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-semibold text-gray-900">{label}</div>
        {description && (
          <div className="mt-1 text-base text-gray-500">{description}</div>
        )}
      </div>
    </div>
  )
}
