import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNotesStore, PREDEFINED_TAGS, type VoiceNote } from '../../stores/notesStore'
import { NoteCard } from './NoteCard'
import { NoteDetail } from './NoteDetail'
import { Recorder } from './Recorder'
import { isReminderActive } from '../../hooks/useReminders'

export function NotesList() {
  const { notes, customTags, filterTag, filterHasReminder, setFilterTag, setFilterHasReminder } =
    useNotesStore()
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)

  const allTags = [...PREDEFINED_TAGS, ...customTags]

  const filteredNotes = notes.filter((note) => {
    if (filterTag && !note.tags.includes(filterTag)) return false
    if (filterHasReminder && !isReminderActive(note.reminder)) return false
    return true
  })

  // If a note is selected, show detail view
  if (selectedNote) {
    const freshNote = notes.find((n) => n.id === selectedNote.id)
    if (!freshNote) {
      setSelectedNote(null)
      return null
    }
    return (
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        <NoteDetail note={freshNote} onBack={() => setSelectedNote(null)} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col pb-20">
      {/* Filters */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => {
              setFilterTag(null)
              setFilterHasReminder(false)
            }}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
              !filterTag && !filterHasReminder
                ? 'bg-accent text-white border-accent'
                : 'bg-surface-dim text-on-surface border-border'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterHasReminder(!filterHasReminder)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
              filterHasReminder
                ? 'bg-accent text-white border-accent'
                : 'bg-surface-dim text-on-surface border-border'
            }`}
          >
            🔔 Reminders
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
                filterTag === tag
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface-dim text-on-surface border-border'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 px-4 space-y-3 overflow-y-auto">
        <AnimatePresence>
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-muted">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                <rect x="9" y="1" width="6" height="12" rx="3" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Tap + to record your first note</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setSelectedNote(note)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowRecorder(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center text-2xl z-20 hover:bg-accent-dark transition-colors"
        aria-label="Record new note"
      >
        +
      </button>

      <Recorder open={showRecorder} onClose={() => setShowRecorder(false)} />
    </div>
  )
}
