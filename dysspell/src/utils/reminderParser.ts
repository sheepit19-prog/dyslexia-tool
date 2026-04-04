import type { Reminder } from '../stores/notesStore'

interface ParsedReminder {
  reminder: Reminder
  /** The transcription text with the reminder phrase removed */
  cleanedText: string
}

/**
 * Parse natural language reminder phrases from transcription text.
 * Supports:
 *   "remind me in 3 hours"
 *   "remind me in 30 minutes"
 *   "remind me at 8pm" / "remind me at 8 pm"
 *   "remind me tomorrow at 9am"
 */
export function parseReminder(text: string): ParsedReminder | null {
  if (!text) return null

  const lower = text.toLowerCase()

  // "remind me in X hours/minutes"
  const relativeMatch = lower.match(
    /remind\s+me\s+in\s+(\d+)\s*(hours?|minutes?|mins?|hrs?)/
  )
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10)
    const unit = relativeMatch[2]
    const ms = unit.startsWith('h') ? amount * 60 * 60 * 1000 : amount * 60 * 1000
    const dateTime = Date.now() + ms
    const cleanedText = text.replace(/remind\s+me\s+in\s+\d+\s*(hours?|minutes?|mins?|hrs?)/i, '').trim()
    return {
      reminder: { type: 'one-time', dateTime, enabled: true },
      cleanedText,
    }
  }

  // "remind me tomorrow at 9am" / "remind me tomorrow at 9 am"
  const tomorrowMatch = lower.match(
    /remind\s+me\s+tomorrow\s+at\s+(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?/
  )
  if (tomorrowMatch) {
    const dateTime = resolveTime(
      parseInt(tomorrowMatch[1], 10),
      tomorrowMatch[2] ? parseInt(tomorrowMatch[2], 10) : 0,
      tomorrowMatch[3] as 'am' | 'pm' | undefined,
      true
    )
    const cleanedText = text.replace(/remind\s+me\s+tomorrow\s+at\s+\d{1,2}\s*(?::\d{2})?\s*(?:am|pm)?/i, '').trim()
    return {
      reminder: { type: 'one-time', dateTime, enabled: true },
      cleanedText,
    }
  }

  // "remind me at 8pm" / "remind me at 8:30 pm"
  const absoluteMatch = lower.match(
    /remind\s+me\s+at\s+(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?/
  )
  if (absoluteMatch) {
    const dateTime = resolveTime(
      parseInt(absoluteMatch[1], 10),
      absoluteMatch[2] ? parseInt(absoluteMatch[2], 10) : 0,
      absoluteMatch[3] as 'am' | 'pm' | undefined,
      false
    )
    const cleanedText = text.replace(/remind\s+me\s+at\s+\d{1,2}\s*(?::\d{2})?\s*(?:am|pm)?/i, '').trim()
    return {
      reminder: { type: 'one-time', dateTime, enabled: true },
      cleanedText,
    }
  }

  return null
}

function resolveTime(
  hour: number,
  minute: number,
  meridiem: 'am' | 'pm' | undefined,
  tomorrow: boolean
): number {
  let h = hour
  if (meridiem === 'pm' && h < 12) h += 12
  if (meridiem === 'am' && h === 12) h = 0
  // If no meridiem given and hour <= 12, assume pm for typical reminder usage
  if (!meridiem && h <= 12 && h !== 0) {
    // Only convert if it looks like a 12-hour time (1-12)
    if (h < 8) h += 12 // "remind me at 3" likely means 3pm
  }

  const now = new Date()
  const target = new Date(now)
  target.setHours(h, minute, 0, 0)

  if (tomorrow) {
    target.setDate(target.getDate() + 1)
  } else if (target.getTime() <= now.getTime()) {
    // If time has already passed today, push to tomorrow
    target.setDate(target.getDate() + 1)
  }

  return target.getTime()
}
