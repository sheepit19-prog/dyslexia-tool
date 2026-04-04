/**
 * Type-safe message passing for Chrome Extension
 * 
 * All messages between extension contexts must be typed here
 */

// Font-related messages
export interface FontSettings {
  enabled: boolean
  fontFamily: string
  lineHeight: number
  letterSpacing: number
}

// Companion-related types
export type StruggleType = 'typing' | 'reading'
export type StruggleConfidence = 'low' | 'medium' | 'high'

// Message Map - ALL message types must be defined here
export interface MessageMap {
  // Font operations
  'FONT_APPLY_SETTINGS': {
    payload: FontSettings
    response: { success: boolean }
  }
  
  // Note operations
  'NOTE_CAPTURE_START': {
    payload: { duration?: number }
    response: { success: boolean; noteId?: string; error?: string }
  }
  
  'NOTE_STOP_CAPTURE': {
    payload: { noteId: string }
    response: { success: boolean }
  }
  
  // Companion operations
  'COMPANION_DETECTED_STRUGGLE': {
    payload: { type: StruggleType; confidence: StruggleConfidence }
    response: void
  }
  
  'COMPANION_SHOW_NOTIFICATION': {
    payload: { type: StruggleType; message: string }
    response: { success: boolean }
  }
  
  'COMPANION_SET_ENABLED': {
    payload: { enabled: boolean }
    response: { success: boolean }
  }
  
  // TTS operations
  'TTS_READ_SELECTION': {
    payload: {}
    response: { success: boolean }
  }
  
  'TTS_STOP': {
    payload: {}
    response: { success: boolean }
  }
  
  // Reading ruler
  'READING_RULER_TOGGLE': {
    payload: { enabled: boolean }
    response: { success: boolean }
  }
  
  // Note operations
  'NOTE_SAVE': {
    payload: { audioBlob: Blob; duration: number }
    response: { success: boolean; error?: string }
  }
  
  'GET_NOTES': {
    payload: {}
    response: { success: boolean; notes?: any[]; error?: string }
  }
  
  'DELETE_NOTE': {
    payload: { noteId: string }
    response: { success: boolean }
  }
  
  // Site preferences
  'GET_SITE_PREFERENCE': {
    payload: { domain: string }
    response: { success: boolean; preference?: any }
  }
  
  'SAVE_SITE_PREFERENCE': {
    payload: { preference: any }
    response: { success: boolean }
  }
  
  // Settings operations
  'SETTINGS_UPDATE': {
    payload: Partial<FontSettings>
    response: { success: boolean }
  }
}

// Helper function for sending typed messages
export async function sendMessage<T extends keyof MessageMap>(
  type: T,
  payload: MessageMap[T]['payload']
): Promise<MessageMap[T]['response']> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      resolve(response)
    })
  })
}
