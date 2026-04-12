import { 
  saveSettings, 
  getNotes, 
  deleteNote,
  getNotesCount,
  getNoteAudio,
  getSitePreference,
  saveSitePreference,
  trackFeatureUsage,
  initializeStorage,
  addNote
} from './storage'
import type { MessageMap } from '../shared/types/messages'
import { sendTabMessage } from '../shared/types/messages'

initializeStorage().catch(console.error)

let isCurrentlyRecording = false

async function handleStartRecording(): Promise<{ success: boolean; error?: string }> {
  if (isCurrentlyRecording) {
    return { success: false, error: 'Already recording' }
  }

  try {
    const count = await getNotesCount()
    if (count >= 50) {
      return { success: false, error: 'Monthly note limit reached (50 notes).' }
    }

    isCurrentlyRecording = true
    return { success: true }
  } catch (error: any) {
    console.error('[Service Worker] Start recording failed:', error)
    return { success: false, error: error.message || 'Failed to start recording' }
  }
}

async function handleStopRecording(): Promise<{ success: boolean; error?: string }> {
  isCurrentlyRecording = false
  return { success: true }
}

async function handleSaveRecordedNote(
  audioBase64: string,
  duration: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert base64 data URL to Blob for storage
    const [meta, b64] = audioBase64.split(',')
    const mimeMatch = meta.match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'audio/webm'
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const audioBlob = new Blob([bytes], { type: mime })

    const currentCount = await getNotesCount()
    const title = `Voice Note #${currentCount + 1} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    await addNote({
      title,
      audioBlob,
      duration,
      transcript: null,
      tags: []
    })
    isCurrentlyRecording = false
    await trackFeatureUsage('note_saved')
    return { success: true }
  } catch (error: any) {
    console.error('[Service Worker] Save recorded note failed:', error)
    return { success: false, error: error.message || 'Failed to save note' }
  }
}

async function handleFontMessage(
  message: MessageMap['FONT_APPLY_SETTINGS'],
  sender: chrome.runtime.MessageSender
): Promise<{ success: boolean }> {
  try {
    await trackFeatureUsage('font_injection')
    await saveSettings({
      fontEnabled: message.payload.enabled,
      fontFamily: message.payload.fontFamily as any,
      lineSpacing: message.payload.lineHeight
    })
    if (sender.tab?.id) {
      await sendTabMessage(sender.tab.id, 'FONT_APPLY_SETTINGS', message.payload)
    }
    return { success: true }
  } catch (error) {
    console.error('[Service Worker] Font application failed:', error)
    return { success: false }
  }
}

async function handleSettingsUpdate(
  message: MessageMap['SETTINGS_UPDATE']
): Promise<{ success: boolean }> {
  try {
    await saveSettings(message.payload as any)
    await trackFeatureUsage('settings_update')
    return { success: true }
  } catch (error) {
    console.error('[Service Worker] Settings update failed:', error)
    return { success: false }
  }
}

async function handleGetNotes(): Promise<{ success: boolean; notes?: any[]; error?: string }> {
  try {
    const notes = await getNotes(50)
    await trackFeatureUsage('get_notes_list')
    return { success: true, notes: notes.map(n => ({
      id: n.id,
      title: n.title,
      duration: n.duration,
      createdAt: n.createdAt,
    })) }
  } catch (error) {
    console.error('[Service Worker] Get notes failed:', error)
    return { success: false, error: 'Failed to get notes' }
  }
}

async function handleDeleteNote(noteId: string): Promise<{ success: boolean }> {
  try {
    await deleteNote(noteId)
    await trackFeatureUsage('delete_note')
    return { success: true }
  } catch (error) {
    console.error('[Service Worker] Delete note failed:', error)
    return { success: false }
  }
}

async function handleGetSitePreference(domain: string): Promise<{ success: boolean; preference?: any }> {
  const pref = await getSitePreference(domain)
  return { success: true, preference: pref }
}

async function handleSaveSitePreference(preference: any): Promise<{ success: boolean }> {
  await saveSitePreference(preference)
  return { success: true }
}

async function handleGetNoteAudio(noteId: string): Promise<{ success: boolean; audioBase64?: string; error?: string }> {
  try {
    const audioBlob = await getNoteAudio(noteId)
    if (!audioBlob) return { success: false, error: 'Note not found' }
    // Convert Blob to base64 data URL — strings are the only reliable Chrome message format
    const arrayBuffer = await audioBlob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const audioBase64 = `data:${audioBlob.type || 'audio/webm'};base64,${btoa(binary)}`
    return { success: true, audioBase64 }
  } catch (error) {
    console.error('[Service Worker] Get note audio failed:', error)
    return { success: false, error: 'Failed to get note audio' }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Service Worker] Message received:', message.type)

  const handleMessage = async () => {
    switch (message.type) {
      case 'FONT_APPLY_SETTINGS':
        return await handleFontMessage(message, sender)

      case 'START_RECORDING':
        return await handleStartRecording()

      case 'STOP_RECORDING':
        return await handleStopRecording()

      case 'COMPANION_DETECTED_STRUGGLE':
        await trackFeatureUsage('companion_struggle_detected')
        return {}

      case 'COMPANION_SHOW_NOTIFICATION':
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs[0]?.id) {
            await sendTabMessage(tabs[0].id, 'COMPANION_SHOW_NOTIFICATION', message.payload)
          }
        })
        return { success: true }

      case 'SETTINGS_UPDATE':
        return await handleSettingsUpdate(message as any)

      case 'GET_NOTES':
        return await handleGetNotes()

      case 'GET_NOTE_AUDIO':
        return await handleGetNoteAudio(message.noteId)

      case 'DELETE_NOTE':
        return await handleDeleteNote(message.noteId)

      case 'GET_RECORDING_STATE':
        return { isRecording: isCurrentlyRecording }

      case 'SAVE_RECORDED_NOTE':
        return await handleSaveRecordedNote(message.audioBase64, message.duration)

      case 'RECORDING_STATE_UPDATE':
        isCurrentlyRecording = !!message.isRecording
        return { success: true }

      case 'GET_SITE_PREFERENCE':
        return await handleGetSitePreference(message.domain)

      case 'SAVE_SITE_PREFERENCE':
        return await handleSaveSitePreference(message.preference)

      default:
        console.warn('[Service Worker] Unknown message type:', message.type)
        return { success: false, error: 'Unknown message type' }
    }
  }

  handleMessage()
    .then(response => sendResponse(response))
    .catch(error => {
      console.error('[Service Worker] Message handler error:', error)
      sendResponse({ success: false, error: 'Handler error' })
    })

  return true
})

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] Extension installed', details)
  initializeStorage().catch(console.error)
})

chrome.runtime.onStartup.addListener(() => {
  console.log('[Service Worker] Service worker started')
  initializeStorage().catch(console.error)
})

chrome.alarms?.create('keepAlive', { periodInMinutes: 1 })
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('[Service Worker] Keep-alive ping')
  }
})

console.log('[Service Worker] Initialized and ready')
