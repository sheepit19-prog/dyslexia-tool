/**
 * Companion settings panel — mode, sensitivity, analytics
 */

import React from 'react'
import { useSettings } from '../hooks/useSettings'
import { Select } from './ui/Select'
import { Slider } from './ui/Slider'
import { Toggle } from './ui/Toggle'
import type { Settings } from '../../shared/types/storage'

const COMPANION_MODE_OPTIONS = [
  { value: 'proactive', label: 'Proactive — Offers help automatically' },
  { value: 'reactive', label: 'Reactive — Responds only when asked' },
  { value: 'off', label: 'Off — Companion disabled' }
]

export const CompanionSettings: React.FC = () => {
  const { settings, update } = useSettings()

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Companion Settings</h2>
      <p className="mb-6 text-sm text-gray-500">
        Configure how the reading companion interacts with you while browsing.
      </p>

      <div className="divide-y divide-gray-100">
        <div className="p-4">
          <Select
            value={settings.companionMode}
            onChange={(val) => update('companionMode', val as Settings['companionMode'])}
            options={COMPANION_MODE_OPTIONS}
            label="Companion Mode"
            description="Control when and how the companion offers assistance"
          />
        </div>

        <div className="p-4">
          <Slider
            value={settings.companionSensitivity}
            onChange={(val) => update('companionSensitivity', val)}
            min={1}
            max={10}
            step={1}
            label="Sensitivity"
            description="Higher sensitivity means the companion reacts to milder struggles"
            displayValue={`${settings.companionSensitivity}/10`}
          />
        </div>

        <div className="p-4">
          <Toggle
            checked={settings.analyticsEnabled}
            onChange={(val) => update('analyticsEnabled', val)}
            label="Usage Analytics"
            description="Allow anonymous usage data to help improve the extension"
          />
        </div>
      </div>
    </div>
  )
}
