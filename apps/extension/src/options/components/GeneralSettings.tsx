/**
 * General settings panel — font, spacing, theme, accent color
 */

import React from 'react'
import { useSettings } from '../hooks/useSettings'
import { Toggle } from './ui/Toggle'
import { Select } from './ui/Select'
import { Slider } from './ui/Slider'

const FONT_FAMILY_OPTIONS = [
  { value: 'OpenDyslexic', label: 'OpenDyslexic' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'system', label: 'System Default' }
]

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
]

export const GeneralSettings: React.FC = () => {
  const { settings, update } = useSettings()

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">General Settings</h2>
      <p className="mb-8 text-lg text-gray-500">
        Configure how text appears on web pages and the extension appearance.
      </p>

      <div className="divide-y divide-gray-100">
        <div className="py-5">
          <Toggle
            checked={settings.fontEnabled}
            onChange={(val) => update('fontEnabled', val)}
            label="Enable Dyslexia-Friendly Font"
            description="Override website fonts with a dyslexia-friendly typeface"
          />
        </div>

        <div className="py-5">
          <Select
            value={settings.fontFamily}
            onChange={(val) => update('fontFamily', val as Settings['fontFamily'])}
            options={FONT_FAMILY_OPTIONS}
            label="Font Family"
            description="Choose which font to use when font override is enabled"
          />
        </div>

        <div className="py-5">
          <Slider
            value={settings.lineSpacing}
            onChange={(val) => update('lineSpacing', val)}
            min={1.0}
            max={2.0}
            step={0.1}
            label="Line Spacing"
            description="Adjust the vertical space between lines of text"
            displayValue={`${settings.lineSpacing.toFixed(1)}`}
          />
        </div>

        <div className="py-5">
          <Slider
            value={settings.letterSpacing}
            onChange={(val) => update('letterSpacing', val)}
            min={0}
            max={0.1}
            step={0.005}
            label="Letter Spacing"
            description="Adjust the horizontal space between characters"
            displayValue={`${settings.letterSpacing.toFixed(3)}em`}
          />
        </div>

        <div className="py-5">
          <Select
            value={settings.theme}
            onChange={(val) => update('theme', val as Settings['theme'])}
            options={THEME_OPTIONS}
            label="Theme"
            description="Choose light, dark, or follow your system preference"
          />
        </div>

        <div className="py-5">
          <div className="flex items-baseline justify-between">
            <label className="text-lg font-semibold text-gray-900">Accent Color</label>
            <span className="text-lg text-gray-600">{settings.accentColor}</span>
          </div>
          <p className="mt-1 text-base text-gray-500">
            Choose the primary accent color used for buttons and highlights
          </p>
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) => update('accentColor', e.target.value)}
            aria-label="Accent Color"
            className="mt-3 h-12 w-20 cursor-pointer rounded-lg border border-gray-300 p-1"
          />
        </div>
      </div>
    </div>
  )
}

// Re-import Settings type locally to avoid unused import when only used in type assertion
import type { Settings } from '../../shared/types/storage'
