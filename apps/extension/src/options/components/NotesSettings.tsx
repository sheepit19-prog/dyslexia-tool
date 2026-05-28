/**
 * Notes settings panel — TTS speed, storage info
 */

import React, { useEffect, useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { Slider } from './ui/Slider'
import { getNotesCount } from '../../background/storage'

const MONTHLY_NOTE_LIMIT = 50

export const NotesSettings: React.FC = () => {
  const { settings, update } = useSettings()
  const [monthlyCount, setMonthlyCount] = useState<number>(0)

  useEffect(() => {
    getNotesCount()
      .then(setMonthlyCount)
      .catch(() => setMonthlyCount(0))
  }, [])

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Notes Settings</h2>
      <p className="mb-8 text-lg text-gray-500">
        Configure text-to-speech playback and view your note usage.
      </p>

      <div className="divide-y divide-gray-100">
        <div className="py-5">
          <Slider
            value={settings.ttsSpeed}
            onChange={(val) => update('ttsSpeed', val)}
            min={0.5}
            max={2.0}
            step={0.1}
            label="Text-to-Speech Speed"
            description="Adjust how fast text is read aloud"
            displayValue={`${settings.ttsSpeed.toFixed(1)}x`}
          />
        </div>

        <div className="py-5">
          <label className="text-lg font-semibold text-gray-900">Monthly Note Usage</label>
          <p className="mt-1 text-base text-gray-500">
            Voice notes created this month (resets monthly)
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{monthlyCount}</span>
            <span className="text-lg text-gray-500">/ {MONTHLY_NOTE_LIMIT} this month</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min((monthlyCount / MONTHLY_NOTE_LIMIT) * 100, 100)}%` }}
            />
          </div>
          <p className="mt-4 text-base text-gray-400">
            Storage breakdown and export options are in the Privacy panel.
          </p>
        </div>
      </div>
    </div>
  )
}
