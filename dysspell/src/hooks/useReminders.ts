import { useEffect, useRef } from 'react'
import { useNotesStore, type Reminder } from '../stores/notesStore'
import { showNotification, requestNotificationPermission } from '../utils/notifications'

export function useReminders() {
  const notes = useNotesStore((s) => s.notes)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(0 as unknown as ReturnType<typeof setInterval>)

  useEffect(() => {
    requestNotificationPermission()

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const currentDate = new Date()
      const currentDay = currentDate.getDay()
      const currentTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`

      for (const note of notes) {
        if (!note.reminder?.enabled) continue
        const r = note.reminder

        if (r.type === 'one-time' && r.dateTime) {
          const diff = r.dateTime - now
          if (diff >= 0 && diff < 60000) {
            showNotification('DysSpell Reminder', note.title || 'Voice note reminder')
          }
        }

        if (r.type === 'recurring' && r.recurringDays && r.recurringTime) {
          if (r.recurringDays.includes(currentDay) && r.recurringTime === currentTime) {
            showNotification('DysSpell Reminder', note.title || 'Voice note reminder')
          }
        }
      }
    }, 30000) // check every 30 seconds

    return () => clearInterval(intervalRef.current)
  }, [notes])
}

export function isReminderActive(reminder?: Reminder): boolean {
  if (!reminder?.enabled) return false
  if (reminder.type === 'one-time' && reminder.dateTime) {
    return reminder.dateTime > Date.now()
  }
  return reminder.type === 'recurring'
}
