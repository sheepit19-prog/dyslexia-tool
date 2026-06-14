/**
 * IndexedDB Storage Manager
 * 
 * Handles all database operations using Dexie.js
 */

import Dexie, { Table } from 'dexie'
import type { Settings, Note, SitePreference, Analytics } from '../../shared/types/storage'

// Dexie database class
export class DyslexiaDB extends Dexie {
  settings!: Table<Settings, string>
  notes!: Table<Note, string>
  sitePreferences!: Table<SitePreference, string>
  analytics!: Table<Analytics, string>
  
  constructor() {
    super('DyslexiaDB')
    
    // Define schema
    this.version(1).stores({
      settings: 'id', // Single global settings object
      notes: 'id, createdAt', // Indexed by creation date
      sitePreferences: 'id', // Domain name as ID
      analytics: 'id, date' // Date-based analytics
    })
  }
}

// Singleton instance
let dbInstance: DyslexiaDB | null = null

export function getDB(): DyslexiaDB {
  if (!dbInstance) {
    dbInstance = new DyslexiaDB()
    console.log('[Storage] IndexedDB initialized')
  }
  return dbInstance
}

export async function resetDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  await Dexie.delete('DyslexiaDB')
}

// Settings operations
export async function getSettings(): Promise<Settings | null> {
  const db = getDB()
  const settings = await db.settings.get('global')
  return settings || getDefaultSettings()
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const db = getDB()
  const existing = await getSettings()
  
  const updated: Settings = {
    id: 'global',
    fontEnabled: false,
    fontFamily: 'Helvetica',
    lineSpacing: 1.6,
    letterSpacing: 0.05,
    bionicReadingEnabled: false,
    spellingEnabled: false,
    theme: 'light',
    accentColor: '#3B82F6',
    ttsSpeed: 1.0,
    analyticsEnabled: true,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
    ...settings
  }
  
  await db.settings.put(updated)
  console.log('[Storage] Settings saved')
}

// Notes operations
export async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getDB()
  const id = crypto.randomUUID()
  
  await db.notes.add({
    id,
    title: note.title,
    audioBlob: note.audioBlob,
    duration: note.duration,
    transcript: note.transcript,
    tags: note.tags,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  console.log('[Storage] Note added:', id)
  return id
}

export async function getNotes(limit: number = 50): Promise<Note[]> {
  const db = getDB()
  return await db.notes.orderBy('createdAt').reverse().limit(limit).toArray()
}

export async function deleteNote(noteId: string): Promise<void> {
  const db = getDB()
  await db.notes.delete(noteId)
  console.log('[Storage] Note deleted:', noteId)
}

export async function getNotesCount(): Promise<number> {
  const db = getDB()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return await db.notes.where('createdAt').aboveOrEqual(startOfMonth).count()
}

export async function getNoteAudio(noteId: string): Promise<Blob | null> {
  const db = getDB()
  const note = await db.notes.get(noteId)
  return note?.audioBlob ?? null
}

// Site preferences operations
export async function getSitePreference(domain: string): Promise<SitePreference | null> {
  const db = getDB()
  const result = await db.sitePreferences.get(domain)
  return result ?? null
}

export async function saveSitePreference(preference: Partial<SitePreference> & { id: string }): Promise<void> {
  const db = getDB()
  const existing = await getSitePreference(preference.id)
  
  await db.sitePreferences.put({
    id: preference.id,
    fontEnabled: preference.fontEnabled ?? null,
    fontFamily: preference.fontFamily ?? null,
    lineSpacing: preference.lineSpacing ?? null,
    letterSpacing: preference.letterSpacing ?? null,
    theme: preference.theme ?? null,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date()
  })
}

// Site preferences helpers
export async function getAllSitePreferences(): Promise<SitePreference[]> {
  const db = getDB()
  return await db.sitePreferences.toArray()
}

export async function deleteSitePreference(domain: string): Promise<void> {
  const db = getDB()
  await db.sitePreferences.delete(domain)
  console.log('[Storage] Site preference deleted:', domain)
}

export async function deleteAllSitePreferences(): Promise<void> {
  const db = getDB()
  await db.sitePreferences.clear()
  console.log('[Storage] All site preferences deleted')
}

export async function getStorageStats(): Promise<{ notes: number; sitePreferences: number; analytics: number }> {
  const db = getDB()
  const [notes, sitePreferences, analytics] = await Promise.all([
    db.notes.count(),
    db.sitePreferences.count(),
    db.analytics.count()
  ])
  return { notes, sitePreferences, analytics }
}

// Analytics operations
export async function trackFeatureUsage(featureName: string): Promise<void> {
  const db = getDB()
  const today = new Date().toISOString().split('T')[0]
  
  let analytics = await db.analytics.get(today)
  
  if (!analytics) {
    analytics = {
      id: today,
      featuresUsed: {},
      sessionDuration: 0,
      sitesVisited: 0,
      interventionsAccepted: 0,
      interventionsDismissed: 0
    }
  }
  
  analytics.featuresUsed[featureName] = (analytics.featuresUsed[featureName] || 0) + 1
  await db.analytics.put(analytics)
}

// Helper: Get default settings
function getDefaultSettings(): Settings {
  return {
    id: 'global',
    fontEnabled: false,
    fontFamily: 'Helvetica',
    lineSpacing: 1.6,
    letterSpacing: 0.05,
    bionicReadingEnabled: false,
    spellingEnabled: false,
    theme: 'light',
    accentColor: '#3B82F6',
    ttsSpeed: 1.0,
    analyticsEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Initialize database with defaults
export async function initializeStorage(): Promise<void> {
  const settings = await getSettings()
  if (!settings) {
    await saveSettings({})
    console.log('[Storage] Initialized with default settings')
  }
}
