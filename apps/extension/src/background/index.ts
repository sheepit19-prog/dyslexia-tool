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

initializeStorage().catch(console.error)

let offscreenDocumentReady = false

async function ensureOffscreenDocument(): Promise<void> {
  if (offscreenDocumentReady) return

  const offscreenUrl = 'src/offscreen-html/index.html'

  try {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType],
      documentUrls: [chrome.runtime.getURL(offscreenUrl)]
    })
    if (existingContexts.length > 0) {
      offscreenDocumentReady = true
      return
    }
  } catch {
    // getContexts may not be available in older Chrome
  }

  try {
    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: 'Recording voice notes requires microphone access'
    })
    offscreenDocumentReady = true
  } catch (error) {
    offscreenDocumentReady = false
    console.error('[Service Worker] Failed to create offscreen document:', error)
    throw new Error('Failed to create offscreen document for recording')
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
      await chrome.tabs.sendMessage(sender.tab.id, message)
    }
    return { success: true }
  } catch (error) {
    console.error('[Service Worker] Font application failed:', error)
    return { success: false }
  }
}

async function handleStartRecording(): Promise<{ success: boolean; error?: string }> {
  try {
    const count = await getNotesCount()
    if (count >= 50) {
      return { success: false, error: 'Monthly note limit reached (50 notes).' }
    }

    await ensureOffscreenDocument()

    const response: any = await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      target: 'offscreen'
    })

    if (!response?.success) {
      return { success: false, error: response?.error || 'Failed to start recording' }
    }

    await trackFeatureUsage('note_capture_start')
    return { success: true }
  } catch (error: any) {
    console.error('[Service Worker] Start recording failed:', error)
    return { success: false, error: error.message || 'Failed to start recording' }
  }
}

async function handleStopRecording(): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureOffscreenDocument()

    const response: any = await chrome.runtime.sendMessage({
      type: 'STOP_RECORDING',
      target: 'offscreen'
    })

    if (!response?.success) {
      return { success: false, error: response?.error || 'Failed to stop recording' }
    }

    const audioBlob = new Blob([response.audioData], { type: 'audio/webm' })
    const currentCount = await getNotesCount()
    const title = `Voice Note #${currentCount} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    await addNote({
      title,
      audioBlob,
      duration: response.duration,
      transcript: null,
      tags: []
    })

    await trackFeatureUsage('note_saved')
    return { success: true }
  } catch (error: any) {
    console.error('[Service Worker] Stop recording failed:', error)
    return { success: false, error: error.message || 'Failed to save note' }
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

async function handleGetNoteAudio(noteId: string): Promise<{ success: boolean; audioBlob?: Blob; error?: string }> {
  try {
    const audioBlob = await getNoteAudio(noteId)
    if (!audioBlob) return { success: false, error: 'Note not found' }
    return { success: true, audioBlob }
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
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'COMPANION_SHOW_NOTIFICATION',
              payload: message.payload
            })
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
