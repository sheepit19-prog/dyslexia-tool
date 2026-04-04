import { motion } from 'framer-motion'
import type { VoiceNote } from '../../stores/notesStore'
import { getTagColor } from '../../stores/notesStore'
import { isReminderActive } from '../../hooks/useReminders'

interface NoteCardProps {
  note: VoiceNote
  onClick: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const hasReminder = !!note.reminder?.enabled
  const reminderPast = hasReminder && !isReminderActive(note.reminder)
  const reminderUpcoming = hasReminder && isReminderActive(note.reminder)

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left bg-surface-dim rounded-xl p-4 border border-border hover:bg-surface-bright transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex items-start gap-3">
        {/* Task-style checkbox for notes with reminders */}
        {hasReminder && (
          <div className="flex-shrink-0 mt-0.5">
            {reminderPast ? (
              <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded border-2 border-accent" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium text-on-surface truncate">
              {note.title || 'Untitled Note'}
            </h3>
          </div>

          {/* Transcription preview */}
          {note.transcription && (
            <p className="text-sm text-on-surface-muted mt-1 line-clamp-2">
              {note.transcription}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-on-surface-muted bg-surface rounded-md px-2 py-0.5">
              {formatDuration(note.duration)}
            </span>
            <span className="text-xs text-on-surface-muted">{formatDate(note.createdAt)}</span>
            {reminderUpcoming && (
              <span className="text-xs" title="Upcoming reminder">🔔</span>
            )}
          </div>
        </div>
      </div>

      {note.tags.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: getTagColor(tag) }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  )
}
