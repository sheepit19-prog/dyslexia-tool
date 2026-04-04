import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getAudioBlob, deleteAudioBlob } from '../../utils/indexedDB'
import { useNotesStore, type VoiceNote } from '../../stores/notesStore'
import { TagPicker } from './TagPicker'
import { ReminderPicker } from './ReminderPicker'

interface NoteDetailProps {
  note: VoiceNote
  onBack: () => void
}

const SPEEDS = [0.5, 1, 1.5, 2]

export function NoteDetail({ note, onBack }: NoteDetailProps) {
  const updateNote = useNotesStore((s) => s.updateNote)
  const deleteNote = useNotesStore((s) => s.deleteNote)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [title, setTitle] = useState(note.title)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string>('')

  useEffect(() => {
    let cancelled = false
    getAudioBlob(note.id).then((blob) => {
      if (cancelled || !blob) return
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url
      const audio = new Audio(url)
      audioRef.current = audio

      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
      audio.addEventListener('ended', () => setIsPlaying(false))
    })

    return () => {
      cancelled = true
      audioRef.current?.pause()
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    }
  }, [note.id])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.playbackRate = playbackSpeed
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, playbackSpeed])

  function handleSpeedChange() {
    const nextIdx = (SPEEDS.indexOf(playbackSpeed) + 1) % SPEEDS.length
    const newSpeed = SPEEDS[nextIdx]
    setPlaybackSpeed(newSpeed)
    if (audioRef.current) audioRef.current.playbackRate = newSpeed
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) audioRef.current.currentTime = time
  }

  function handleTitleBlur() {
    updateNote(note.id, { title })
  }

  async function handleDelete() {
    if (!confirm('Delete this note?')) return
    await deleteAudioBlob(note.id)
    deleteNote(note.id)
    onBack()
  }

  const progress = note.duration > 0 ? (currentTime / note.duration) * 100 : 0

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-on-surface-muted hover:text-on-surface p-1"
          aria-label="Back to notes"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Note title..."
          className="flex-1 text-xl font-semibold text-on-surface bg-transparent border-none focus:outline-none placeholder:text-on-surface-muted"
        />
        <button
          onClick={handleDelete}
          className="text-red-400 hover:text-red-500 p-1"
          aria-label="Delete note"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Player */}
      <div className="bg-surface-dim rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            )}
          </button>

          <div className="flex-1">
            <div className="relative h-2 bg-border rounded-full overflow-hidden mb-1">
              <div
                className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={note.duration}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full opacity-0 absolute"
              style={{ marginTop: '-14px', height: '20px' }}
              aria-label="Seek"
            />
            <div className="flex justify-between text-xs text-on-surface-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(note.duration)}</span>
            </div>
          </div>

          <button
            onClick={handleSpeedChange}
            className="text-sm font-medium text-on-surface-muted hover:text-on-surface bg-surface rounded-lg px-3 py-1.5 border border-border"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Transcription */}
      {note.transcription && (
        <div className="bg-surface-dim rounded-xl p-4 mb-6">
          <h4 className="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Transcription</h4>
          <p className="text-sm text-on-surface leading-relaxed">{note.transcription}</p>
        </div>
      )}

      {/* Tags */}
      <div className="mb-6">
        <TagPicker
          selectedTags={note.tags}
          onChange={(tags) => updateNote(note.id, { tags })}
        />
      </div>

      {/* Reminder */}
      <ReminderPicker
        reminder={note.reminder}
        onChange={(reminder) => updateNote(note.id, { reminder })}
      />
    </motion.div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
