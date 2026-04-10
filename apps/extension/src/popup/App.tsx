import { useState, useEffect, useRef } from 'react'
import type { Settings } from '../shared/types/storage'

// Direct IndexedDB access — popup and background share the same DB (same extension origin)
// This avoids Chrome message passing for audio data, which silently drops Blobs/ArrayBuffers
import { getNotes as dbGetNotes, addNote as dbAddNote, deleteNote as dbDeleteNote, getNoteAudio as dbGetNoteAudio, getNotesCount as dbGetNotesCount } from '../background/storage'

const DEFAULT_SETTINGS: Settings = {
  id: 'global',
  fontEnabled: false,
  fontFamily: 'OpenDyslexic',
  lineSpacing: 1.6,
  letterSpacing: 0.05,
  companionMode: 'proactive',
  companionSensitivity: 5,
  theme: 'light',
  accentColor: '#3B82F6',
  ttsSpeed: 1.0,
  analyticsEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [noteCount, setNoteCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readingRulerEnabled, setReadingRulerEnabled] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [companionEnabled, setCompanionEnabled] = useState(settings.companionMode === 'proactive')
  const [notes, setNotes] = useState<Array<{ id: string; title: string | null; duration: number; createdAt: string | Date }>>([])
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setCompanionEnabled(settings.companionMode === 'proactive')
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, {
            type: 'COMPANION_SET_ENABLED',
            payload: { enabled: settings.companionMode === 'proactive' }
          })
        } catch {
          // Content script not on this page (e.g. chrome:// pages)
        }
      }
    })
  }, [settings.companionMode])

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await chrome.storage.local.get('settings')
        if (result.settings) {
          setSettings(result.settings)
        }
        await loadNotes()
      } catch (err) {
        console.error('[Popup] Failed to load data:', err)
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Load notes directly from IndexedDB — no message passing
  const loadNotes = async () => {
    try {
      const allNotes = await dbGetNotes(50)
      setNotes(allNotes.map(n => ({
        id: n.id,
        title: n.title,
        duration: n.duration,
        createdAt: n.createdAt
      })))
      const count = await dbGetNotesCount()
      setNoteCount(count)
    } catch (err) {
      console.error('[Popup] Failed to load notes:', err)
    }
  }

  const toggleFont = async (enabled: boolean) => {
    const newSettings = { ...settings, fontEnabled: enabled }
    setSettings(newSettings)
    await chrome.storage.local.set({ settings: newSettings })
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'FONT_APPLY_SETTINGS',
          payload: { enabled, fontFamily: settings.fontFamily, lineHeight: settings.lineSpacing }
        })
      } catch { /* content script not loaded */ }
    }
  }

  const handleReadAloud = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TTS_READ_SELECTION' })
      }
    } catch {
      alert('Please select some text first.')
    }
  }

  const toggleReadingRuler = async (enabled: boolean) => {
    setReadingRulerEnabled(enabled)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'READING_RULER_TOGGLE', payload: { enabled } })
      } catch { /* content script not loaded */ }
    }
  }

  const toggleCompanionMode = async () => {
    const newMode: 'proactive' | 'reactive' | 'off' = companionEnabled ? 'off' : 'proactive'
    const newSettings = { ...settings, companionMode: newMode }
    setSettings(newSettings)
    setCompanionEnabled(!companionEnabled)
    await chrome.storage.local.set({ settings: newSettings })
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'COMPANION_SET_ENABLED',
          payload: { enabled: !companionEnabled }
        })
      } catch { /* content script not loaded */ }
    }
  }

  const startRecording = async () => {
    try {
      // Check monthly limit
      const count = await dbGetNotesCount()
      if (count >= 50) {
        alert('Monthly note limit reached (50 notes).')
        return
      }

      // Request mic permission — popup is a visible context, this works
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      startTimeRef.current = Date.now()

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        // Stop timer
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        setRecordingTime(0)
        stream.getTracks().forEach(track => track.stop())

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const duration = Math.round((Date.now() - startTimeRef.current) / 100) / 10
        chunksRef.current = []
        mediaRecorderRef.current = null

        // Save directly to IndexedDB — no message passing needed!
        try {
          const currentCount = await dbGetNotesCount()
          const title = `Voice Note #${currentCount + 1} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          await dbAddNote({
            title,
            audioBlob,
            duration,
            transcript: null,
            tags: []
          })
          await loadNotes()
        } catch (err: any) {
          alert('Error saving note: ' + (err.message || 'Unknown error'))
        }

        setIsRecording(false)
      }

      recorder.start()
      setIsRecording(true)

      // Start live timer
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 200)

    } catch (err: any) {
      setIsRecording(false)
      if (err.name === 'NotAllowedError') {
        alert('Microphone permission is required.\n\nPlease click "Allow" when Chrome asks for microphone access.')
      } else {
        alert('Recording error: ' + (err.message || 'Unknown error'))
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const playNote = async (noteId: string) => {
    // If clicking the currently playing note → stop
    if (playingNoteId === noteId) {
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src) }
      audioRef.current = null
      setPlayingNoteId(null)
      return
    }
    // Stop any existing playback
    if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src) }

    try {
      // Read audio Blob directly from IndexedDB — no serialization!
      const audioBlob = await dbGetNoteAudio(noteId)
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob)
        const audio = new Audio(url)
        audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; setPlayingNoteId(null) }
        audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; setPlayingNoteId(null); console.error('[Popup] Audio playback error') }
        audioRef.current = audio
        audio.play()
        setPlayingNoteId(noteId)
      } else {
        console.error('[Popup] No audio data found for note:', noteId)
      }
    } catch (err) {
      console.error('[Popup] Playback failed:', err)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await dbDeleteNote(noteId)
      await loadNotes()
    } catch (err) {
      console.error('[Popup] Delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ width: '400px', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '9999px', height: '32px', width: '32px', borderBottom: '2px solid #3B82F6', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ width: '400px', padding: '16px' }}>
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', padding: '16px' }}>
          <p style={{ color: '#991B1B', fontWeight: 500 }}>Error</p>
          <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '4px' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '400px', padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>Dyslexia Tool</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
          <div>
            <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>Dyslexia Font</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Apply dyslexia-friendly font</p>
          </div>
          <button onClick={() => toggleFont(!settings.fontEnabled)} style={{ position: 'relative', width: '48px', height: '24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: settings.fontEnabled ? '#3B82F6' : '#D1D5DB' }}>
            <div style={{ position: 'absolute', top: '4px', width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '9999px', transition: 'transform 0.2s', left: settings.fontEnabled ? '28px' : '4px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
          <div>
            <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>Read Aloud</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Read selected text</p>
          </div>
          <button onClick={handleReadAloud} style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Read</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
          <div>
            <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>Reading Ruler</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Highlight current line</p>
          </div>
          <button onClick={() => toggleReadingRuler(!readingRulerEnabled)} style={{ position: 'relative', width: '48px', height: '24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: readingRulerEnabled ? '#10B981' : '#D1D5DB' }}>
            <div style={{ position: 'absolute', top: '4px', width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '9999px', transition: 'transform 0.2s', left: readingRulerEnabled ? '28px' : '4px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
          <div>
            <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>Companion Mode</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{companionEnabled ? 'Active - offers help' : 'Disabled'}</p>
          </div>
          <button onClick={toggleCompanionMode} style={{ position: 'relative', width: '48px', height: '24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: companionEnabled ? '#8B5CF6' : '#D1D5DB' }}>
            <div style={{ position: 'absolute', top: '4px', width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '9999px', transition: 'transform 0.2s', left: companionEnabled ? '28px' : '4px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>Voice Notes</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                {isRecording
                  ? `Recording... ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
                  : `${noteCount}/50 this month`}
              </p>
            </div>
            <button onClick={isRecording ? stopRecording : startRecording} style={{ padding: '8px 16px', backgroundColor: isRecording ? '#EF4444' : '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              {isRecording ? '⏹ Stop' : '● Record'}
            </button>
          </div>

          {isRecording && (
            <div style={{ height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#EF4444', width: '100%', animation: 'pulse-bar 1.5s ease-in-out infinite' }} />
            </div>
          )}

          {notes.length > 0 && (
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {notes.map(note => (
                <div key={note.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {note.title || 'Untitled'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {Math.round(note.duration)}s
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    <button onClick={() => playNote(note.id)} style={{ padding: '4px 8px', backgroundColor: playingNoteId === note.id ? '#EF4444' : '#3B82F6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      {playingNoteId === note.id ? '⏹' : '▶'}
                    </button>
                    <button onClick={() => handleDeleteNote(note.id)} style={{ padding: '4px 8px', backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingTop: '8px', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>v0.1.0 - MVP</p>
        </div>
      </div>
    </div>
  )
}
