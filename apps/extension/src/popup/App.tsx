import { useState, useEffect } from 'react'
import type { Settings } from '../shared/types/storage'

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
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    setCompanionEnabled(settings.companionMode === 'proactive')
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, {
            type: 'COMPANION_SET_ENABLED',
            payload: { enabled: settings.companionMode === 'proactive' }
          })
        } catch (error) {
          console.warn('[Popup] Failed to send companion status:', error)
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
        // Query background for current recording state (survives popup close/reopen)
        const state = await chrome.runtime.sendMessage({ type: 'GET_RECORDING_STATE' })
        if (state?.isRecording) {
          setIsRecording(true)
        }
      } catch (error) {
        console.error('[Popup] Failed to load data:', error)
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const loadNotes = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_NOTES' })
      if (response.success && response.notes) {
        setNotes(response.notes)
        setNoteCount(response.notes.length)
      }
    } catch (error) {
      console.error('[Popup] Failed to load notes:', error)
    }
  }

  const toggleFont = async (enabled: boolean) => {
    const newSettings = { ...settings, fontEnabled: enabled }
    setSettings(newSettings)
    await chrome.storage.local.set({ settings: newSettings })
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'FONT_APPLY_SETTINGS',
        payload: { enabled, fontFamily: settings.fontFamily, lineHeight: settings.lineSpacing }
      })
    }
  }

  const handleReadAloud = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TTS_READ_SELECTION' })
      }
    } catch (error) {
      alert('Please select some text first.')
    }
  }

  const toggleReadingRuler = async (enabled: boolean) => {
    setReadingRulerEnabled(enabled)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, { type: 'READING_RULER_TOGGLE', payload: { enabled } })
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
      } catch (error) {
        console.warn('[Popup] Failed to send companion toggle:', error)
      }
    }
  }

  const startRecording = async () => {
    try {
      // Try starting recording directly — Chrome may already have mic permission
      const response = await chrome.runtime.sendMessage({ type: 'START_RECORDING' })
      if (response.success) {
        setIsRecording(true)
        return
      }
      // If permission-related error, open the permission tab to prompt the user
      if (response.error && (response.error.includes('Permission') || response.error.includes('permission') || response.error.includes('dismissed'))) {
        await chrome.tabs.create({ url: chrome.runtime.getURL('src/mic-permission/index.html') })
        // Popup will close when tab opens. Background tracks recording state.
        // When user reopens popup, GET_RECORDING_STATE will show isRecording=true
        return
      }
      alert('Could not start recording: ' + (response.error || 'Unknown error'))
    } catch (error: any) {
      alert('Recording error: ' + (error.message || 'Unknown error'))
    }
  }

  const stopRecording = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
      setIsRecording(false)
      if (response.success) {
        await loadNotes()
        alert('Note saved!')
      } else {
        alert('Failed to save note: ' + (response.error || 'Unknown error'))
      }
    } catch (error: any) {
      setIsRecording(false)
      alert('Error saving note: ' + (error.message || 'Unknown error'))
    }
  }

  const playNote = async (noteId: string) => {
    if (playingNoteId === noteId) {
      if (audioRef) { audioRef.pause(); URL.revokeObjectURL(audioRef.src) }
      setPlayingNoteId(null)
      setAudioRef(null)
      return
    }
    if (audioRef) { audioRef.pause(); URL.revokeObjectURL(audioRef.src) }
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_NOTE_AUDIO', noteId })
      if (response.success && response.audioBlob) {
        const url = URL.createObjectURL(response.audioBlob)
        const audio = new Audio(url)
        audio.onended = () => { URL.revokeObjectURL(url); setPlayingNoteId(null); setAudioRef(null) }
        audio.play()
        setPlayingNoteId(noteId)
        setAudioRef(audio)
      }
    } catch (error) {
      console.error('[Popup] Playback failed:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'DELETE_NOTE', noteId })
      if (response.success) await loadNotes()
    } catch (error) {
      console.error('[Popup] Delete failed:', error)
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
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{noteCount}/50 this month</p>
            </div>
            <button onClick={isRecording ? stopRecording : startRecording} style={{ padding: '8px 16px', backgroundColor: isRecording ? '#EF4444' : '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              {isRecording ? '⏹ Stop' : '● Record'}
            </button>
          </div>

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
