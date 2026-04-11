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
    <div className="py-4">
      <label className="text-lg font-semibold text-gray-900">{label}</label>
      {description && (
        <div className="mt-1 text-base text-gray-500">{description}</div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="mt-2 block w-full max-w-sm cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
