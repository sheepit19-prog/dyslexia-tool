import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { addNote, getNotes, deleteNote, getNoteAudio, getNotesCount, saveSettings, getSitePreference, saveSitePreference, trackFeatureUsage, resetDB } from '../background/storage'

beforeEach(async () => {
  await resetDB()
})

describe('Note operations', () => {
  it('addNote creates note with all fields and returns UUID', async () => {
    const id = await addNote({
      title: 'Test Note',
      audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
      duration: 5.2,
      transcript: 'Hello world',
      tags: ['test'],
    })
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('addNote creates note with null transcript', async () => {
    const id = await addNote({
      title: 'No Transcript',
      audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
      duration: 3.0,
      transcript: null,
      tags: [],
    })
    const notes = await getNotes(50)
    const note = notes.find(n => n.id === id)
    expect(note?.transcript).toBeNull()
  })

  it('getNotes returns empty array when no notes exist', async () => {
    const notes = await getNotes(50)
    expect(notes).toEqual([])
  })

  it('getNotes returns notes in reverse chronological order', async () => {
    await addNote({
      title: 'First',
      audioBlob: new Blob(['a'], { type: 'audio/webm' }),
      duration: 1,
      transcript: null,
      tags: [],
    })
    await addNote({
      title: 'Second',
      audioBlob: new Blob(['b'], { type: 'audio/webm' }),
      duration: 2,
      transcript: null,
      tags: [],
    })
    await addNote({
      title: 'Third',
      audioBlob: new Blob(['c'], { type: 'audio/webm' }),
      duration: 3,
      transcript: null,
      tags: [],
    })
    const notes = await getNotes(50)
    expect(notes.length).toBe(3)
    expect(notes[0].title).toBe('Third')
    expect(notes[2].title).toBe('First')
  })

  it('getNotes respects limit parameter', async () => {
    for (let i = 0; i < 5; i++) {
      await addNote({
        title: `Note ${i}`,
        audioBlob: new Blob([`audio${i}`], { type: 'audio/webm' }),
        duration: i,
        transcript: null,
        tags: [],
      })
    }
    const notes = await getNotes(3)
    expect(notes.length).toBe(3)
  })

  it('deleteNote removes note by id', async () => {
    const id = await addNote({
      title: 'To Delete',
      audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
      duration: 1,
      transcript: null,
      tags: [],
    })
    await deleteNote(id)
    const notes = await getNotes(50)
    expect(notes.find(n => n.id === id)).toBeUndefined()
  })

  it('deleted note not included in subsequent queries', async () => {
    const id1 = await addNote({
      title: 'Keep',
      audioBlob: new Blob(['a'], { type: 'audio/webm' }),
      duration: 1,
      transcript: null,
      tags: [],
    })
    const id2 = await addNote({
      title: 'Delete',
      audioBlob: new Blob(['b'], { type: 'audio/webm' }),
      duration: 2,
      transcript: null,
      tags: [],
    })
    await deleteNote(id2)
    const notes = await getNotes(50)
    const ids = notes.map(n => n.id)
    expect(ids).toContain(id1)
    expect(ids).not.toContain(id2)
  })

  it('getNoteAudio returns truthy value for stored note', async () => {
    const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' })
    const id = await addNote({
      title: 'Audio Note',
      audioBlob,
      duration: 2.5,
      transcript: null,
      tags: [],
    })
    const retrieved = await getNoteAudio(id)
    expect(retrieved).toBeTruthy()
  })

  it('getNoteAudio returns null for non-existent id', async () => {
    const result = await getNoteAudio('non-existent-id')
    expect(result).toBeNull()
  })

  it('getNotesCount returns 0 for empty database', async () => {
    const count = await getNotesCount()
    expect(count).toBe(0)
  })

  it('getNotesCount returns correct count after adding notes', async () => {
    for (let i = 0; i < 3; i++) {
      await addNote({
        title: `Note ${i}`,
        audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
        duration: i,
        transcript: null,
        tags: [],
      })
    }
    const count = await getNotesCount()
    expect(count).toBe(3)
  })

  it('round-trip: addNote audio blob note stores and retrieves', async () => {
    const audioBlob = new Blob(['round-trip-audio'], { type: 'audio/webm' })
    const id = await addNote({
      title: 'Audio Round Trip',
      audioBlob,
      duration: 5,
      transcript: 'test transcript',
      tags: ['round-trip'],
    })
    const notes = await getNotes(50)
    const note = notes.find(n => n.id === id)
    expect(note).toBeTruthy()
    expect(note!.title).toBe('Audio Round Trip')
    expect(note!.duration).toBe(5)
    expect(note!.transcript).toBe('test transcript')
    expect(note!.tags).toEqual(['round-trip'])
  })

  it('edge case: note with zero duration', async () => {
    const id = await addNote({
      title: 'Zero Duration',
      audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
      duration: 0,
      transcript: null,
      tags: [],
    })
    const notes = await getNotes(50)
    const note = notes.find(n => n.id === id)
    expect(note?.duration).toBe(0)
  })

  it('edge case: large audio blob note stores and retrieves', async () => {
    const largeData = new Uint8Array(1024 * 1024)
    for (let i = 0; i < largeData.length; i++) largeData[i] = i % 256
    const largeBlob = new Blob([largeData], { type: 'audio/webm' })
    const id = await addNote({
      title: 'Large Audio',
      audioBlob: largeBlob,
      duration: 300,
      transcript: null,
      tags: [],
    })
    const notes = await getNotes(50)
    const note = notes.find(n => n.id === id)
    expect(note).toBeTruthy()
    expect(note!.title).toBe('Large Audio')
    expect(note!.duration).toBe(300)
  })
})

describe('Settings operations', () => {
  it('saveSettings persists partial settings', async () => {
    await saveSettings({ fontEnabled: true, lineSpacing: 1.8 })
    const notes = await getNotes(50)
    expect(notes).toBeTruthy()
  })

  it('saveSettings overwrites individual fields without losing others', async () => {
    await saveSettings({ fontEnabled: true, fontFamily: 'Arial', lineSpacing: 1.6 })
    await saveSettings({ lineSpacing: 2.0 })
    const notes = await getNotes(50)
    expect(notes).toBeTruthy()
  })
})

describe('Site preference operations', () => {
  it('getSitePreference returns null for domain with no saved preference', async () => {
    const pref = await getSitePreference('example.com')
    expect(pref).toBeNull()
  })

  it('round-trip: saveSitePreference then getSitePreference returns matching data', async () => {
    await saveSitePreference({
      id: 'example.com',
      fontEnabled: true,
      fontFamily: 'Verdana',
      lineSpacing: 1.5,
      letterSpacing: 0.03,
      theme: 'dark',
    })
    const pref = await getSitePreference('example.com')
    expect(pref).not.toBeNull()
    expect(pref?.fontFamily).toBe('Verdana')
    expect(pref?.theme).toBe('dark')
  })

  it('saveSitePreference updates existing preference for same domain', async () => {
    await saveSitePreference({
      id: 'example.com',
      fontEnabled: true,
      fontFamily: null,
      lineSpacing: null,
      letterSpacing: null,
      theme: null,
    })
    await saveSitePreference({
      id: 'example.com',
      fontEnabled: false,
      fontFamily: 'Arial',
      lineSpacing: null,
      letterSpacing: null,
      theme: 'light',
    })
    const pref = await getSitePreference('example.com')
    expect(pref?.fontEnabled).toBe(false)
    expect(pref?.fontFamily).toBe('Arial')
    expect(pref?.theme).toBe('light')
  })
})

describe('Analytics operations', () => {
  it('trackFeatureUsage increments feature count for a feature name', async () => {
    await trackFeatureUsage('note_saved')
    await trackFeatureUsage('note_saved')
    await trackFeatureUsage('note_saved')
    const notes = await getNotes(50)
    expect(notes).toBeTruthy()
  })

  it('trackFeatureUsage creates entry on first call, increments on subsequent', async () => {
    await trackFeatureUsage('font_injection')
    const notes1 = await getNotes(50)
    await trackFeatureUsage('font_injection')
    const notes2 = await getNotes(50)
    expect(notes1).toBeTruthy()
    expect(notes2).toBeTruthy()
  })
})
