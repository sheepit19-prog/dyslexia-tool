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

// Message Map - ALL message types must be defined here
export interface MessageMap {
  // Font operations
  'FONT_APPLY_SETTINGS': {
    payload: FontSettings
    response: { success: boolean }
  }
  
  // Note operations
  'GET_NOTE_AUDIO': {
    payload: { noteId: string }
    response: { success: boolean; audioBlob?: Blob; error?: string }
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
  
  // Bionic reading
  'BIONIC_READING_TOGGLE': {
    payload: { enabled: boolean }
    response: { success: boolean }
  }
  
  // Spelling monitor
  'SPELLING_TOGGLE': {
    payload: { enabled: boolean }
    response: { success: boolean }
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

  // Recording operations
  'START_RECORDING': {
    payload: {}
    response: { success: boolean; error?: string }
  }

  'STOP_RECORDING': {
    payload: {}
    response: { success: boolean }
  }

  'SAVE_RECORDED_NOTE': {
    payload: { audioBase64: string; duration: number }
    response: { success: boolean; error?: string }
  }

  'GET_RECORDING_STATE': {
    payload: {}
    response: { isRecording: boolean }
  }

  'RECORDING_STATE_UPDATE': {
    payload: { isRecording: boolean }
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

export async function sendTabMessage<T extends keyof MessageMap>(
  tabId: number,
  type: T,
  payload: MessageMap[T]['payload']
): Promise<MessageMap[T]['response']> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type, payload }, (response) => {
      resolve(response)
    })
  })
}
