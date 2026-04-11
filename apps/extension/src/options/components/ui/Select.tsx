/**
 * Styled native select dropdown component
 */

import React from 'react'

interface SelectProps {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  label: string
  description?: string
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  description
}) => {
  return (
    <div className="py-3">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {description && (
        <div className="mt-0.5 text-sm text-gray-500">{description}</div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="mt-1.5 block w-full max-w-xs cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
