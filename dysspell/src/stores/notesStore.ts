import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface VoiceNote {
  id: string
  title: string
  duration: number // seconds
  tags: string[]
  createdAt: number // timestamp
  reminder?: Reminder
  transcription?: string
}

export interface Reminder {
  type: 'one-time' | 'recurring'
  dateTime?: number // timestamp for one-time
  recurringDays?: number[] // 0=Sun, 1=Mon, ... 6=Sat
  recurringTime?: string // "HH:mm"
  enabled: boolean
}

export const PREDEFINED_TAGS = ['Work', 'School', 'Personal', 'Important', 'Idea'] as const

export const TAG_COLORS: Record<string, string> = {
  Work: '#3b82f6',
  School: '#10b981',
  Personal: '#f59e0b',
  Important: '#ef4444',
  Idea: '#8b5cf6',
}

export function getTagColor(tag: string): string {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag]
  // Generate a consistent color from the tag string
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 60%, 55%)`
}

interface NotesState {
  notes: VoiceNote[]
  customTags: string[]
  filterTag: string | null
  filterHasReminder: boolean
  addNote: (note: VoiceNote) => void
  updateNote: (id: string, updates: Partial<VoiceNote>) => void
  deleteNote: (id: string) => void
  addCustomTag: (tag: string) => void
  setFilterTag: (tag: string | null) => void
  setFilterHasReminder: (value: boolean) => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      customTags: [],
      filterTag: null,
      filterHasReminder: false,
      addNote: (note) =>
        set((state) => ({ notes: [note, ...state.notes] })),
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      addCustomTag: (tag) =>
        set((state) => ({
          customTags: state.customTags.includes(tag)
            ? state.customTags
            : [...state.customTags, tag],
        })),
      setFilterTag: (filterTag) => set({ filterTag }),
      setFilterHasReminder: (filterHasReminder) => set({ filterHasReminder }),
    }),
    { name: 'dysspell-notes' }
  )
)
