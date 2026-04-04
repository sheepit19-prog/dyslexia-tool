import { useState } from 'react'
import type { Reminder } from '../../stores/notesStore'
import { requestNotificationPermission } from '../../utils/notifications'

interface ReminderPickerProps {
  reminder?: Reminder
  onChange: (reminder: Reminder | undefined) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ReminderPicker({ reminder, onChange }: ReminderPickerProps) {
  const [type, setType] = useState<'one-time' | 'recurring'>(reminder?.type || 'one-time')
  const [dateTime, setDateTime] = useState(
    reminder?.dateTime
      ? new Date(reminder.dateTime).toISOString().slice(0, 16)
      : ''
  )
  const [recurringDays, setRecurringDays] = useState<number[]>(reminder?.recurringDays || [])
  const [recurringTime, setRecurringTime] = useState(reminder?.recurringTime || '09:00')

  async function handleSave() {
    const granted = await requestNotificationPermission()
    if (!granted) {
      alert('Please allow notifications to use reminders.')
      return
    }

    if (type === 'one-time') {
      if (!dateTime) return
      onChange({
        type: 'one-time',
        dateTime: new Date(dateTime).getTime(),
        enabled: true,
      })
    } else {
      if (recurringDays.length === 0) return
      onChange({
        type: 'recurring',
        recurringDays,
        recurringTime,
        enabled: true,
      })
    }
  }

  function toggleDay(day: number) {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-on-surface mb-2">Reminder</label>

      {/* Type toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType('one-time')}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            type === 'one-time'
              ? 'bg-accent text-white border-accent'
              : 'bg-surface-dim text-on-surface border-border'
          }`}
        >
          One-time
        </button>
        <button
          onClick={() => setType('recurring')}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            type === 'recurring'
              ? 'bg-accent text-white border-accent'
              : 'bg-surface-dim text-on-surface border-border'
          }`}
        >
          Recurring
        </button>
      </div>

      {type === 'one-time' ? (
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface-dim border border-border text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      ) : (
        <div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {DAYS.map((label, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                  recurringDays.includes(i)
                    ? 'bg-accent text-white'
                    : 'bg-surface-dim text-on-surface border border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="time"
            value={recurringTime}
            onChange={(e) => setRecurringTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-dim border border-border text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm"
        >
          Set Reminder
        </button>
        {reminder && (
          <button
            onClick={() => onChange(undefined)}
            className="px-4 py-2 rounded-lg bg-surface-dim text-on-surface border border-border text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
