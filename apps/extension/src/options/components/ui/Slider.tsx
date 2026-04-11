/**
 * Range slider component with visible value label
 */

import React from 'react'

interface SliderProps {
  value: number
  onChange: (val: number) => void
  min: number
  max: number
  step: number
  label: string
  description?: string
  displayValue?: string
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  label,
  description,
  displayValue
}) => {
  return (
    <div className="py-4">
      <div className="flex items-baseline justify-between">
        <label className="text-lg font-semibold text-gray-900">{label}</label>
        <span className="text-lg tabular-nums font-medium text-gray-600">
          {displayValue ?? value}
        </span>
      </div>
      {description && (
        <div className="mt-1 text-base text-gray-500">{description}</div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="mt-3 w-full cursor-pointer accent-blue-500"
      />
    </div>
  )
}
