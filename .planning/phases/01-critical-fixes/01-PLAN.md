---
phase: 01-critical-fixes
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/extension/src/offscreen/index.ts
  - apps/extension/src/background/storage/index.ts
  - apps/extension/src/background/index.ts
  - apps/extension/src/shared/types/messages.ts
autonomous: true
requirements:
  - NOTES-03
  - NOTES-04
  - NOTES-05
  - NOTES-07
  - NOTES-06

must_haves:
  truths:
    - "Note duration is calculated from actual wall-clock recording time"
    - "Monthly note count filters by current calendar month, not total count"
    - "NOTE_SAVE handler is removed — only STOP_RECORDING path exists"
    - "Dead message types NOTE_CAPTURE_START and NOTE_STOP_CAPTURE are removed"
    - "New GET_NOTE_AUDIO message returns audioBlob for a given note ID"
    - "Notes get auto-generated titles like 'Voice Note #3 — Apr 10, 2026'"
  artifacts:
    - path: "apps/extension/src/offscreen/index.ts"
      provides: "Fixed duration calculation using Date.now() delta"
      contains: "recordingStartTime"
    - path: "apps/extension/src/background/storage/index.ts"
      provides: "Monthly-filtered getNotesCount + getNoteAudio function"
      contains: "startOfMonth"
    - path: "apps/extension/src/background/index.ts"
      provides: "Removed handleNoteSave, added GET_NOTE_AUDIO handler, auto-titles"
      contains: "GET_NOTE_AUDIO"
    - path: "apps/extension/src/shared/types/messages.ts"
      provides: "Removed dead types, added GET_NOTE_AUDIO type"
      contains: "GET_NOTE_AUDIO"
  key_links:
    - from: "apps/extension/src/offscreen/index.ts"
      to: "apps/extension/src/background/index.ts"
      via: "STOP_RECORDING response with Date.now()-based duration"
      pattern: "recordingStartTime"
    - from: "apps/extension/src/background/storage/index.ts"
      to: "apps/extension/src/background/index.ts"
      via: "getNotesCount filtered monthly + getNoteAudio function"
      pattern: "getNoteAudio"
---

<objective>
Fix note-taking backend bugs and prepare storage/API for popup UI.

Purpose: Notes are recorded but inaccessible — duration is wrong, monthly limit counts all-time, duplicate handler exists, and no way to retrieve audio for playback.
Output: Clean backend with correct duration, monthly limit, auto-titles, and audio retrieval endpoint.
</objective>

<execution_context>
@C:/Users/berks/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/berks/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

<interfaces>

From apps/extension/src/shared/types/storage.ts:
```typescript
export interface Note {
  id: string
  title: string | null
  audioBlob: Blob
  duration: number
  transcript: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

From apps/extension/src/shared/types/messages.ts (current MessageMap keys):
```typescript
// Dead types to REMOVE:
'NOTE_CAPTURE_START': { payload: { duration?: number }; response: { success: boolean; noteId?: string; error?: string } }
'NOTE_STOP_CAPTURE': { payload: { noteId: string }; response: { success: boolean } }

// Existing types to KEEP:
'NOTE_SAVE': { payload: { audioBlob: Blob; duration: number }; response: { success: boolean; error?: string } }
'GET_NOTES': { payload: {}; response: { success: boolean; notes?: any[]; error?: string } }
'DELETE_NOTE': { payload: { noteId: string }; response: { success: boolean } }

// New type to ADD:
'GET_NOTE_AUDIO': { payload: { noteId: string }; response: { success: boolean; audioBlob?: Blob; error?: string } }
```

From apps/extension/src/background/storage/index.ts (current exports):
```typescript
export async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
export async function getNotes(limit?: number): Promise<Note[]>
export async function deleteNote(noteId: string): Promise<void>
export async function getNotesCount(): Promise<number>
// NEW: export async function getNoteAudio(noteId: string): Promise<Blob | null>
```

From apps/extension/src/offscreen/index.ts (current structure):
- Line 33 bug: `duration: audioBlob.size / 1000` — must use Date.now() delta
- Top-level scope for `recordingStartTime` variable
- `startRecording()` sets `recordingStartTime = Date.now()`
- `stopRecording()` calculates `duration: (Date.now() - recordingStartTime) / 1000`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix offscreen duration + storage monthly limit + getNoteAudio</name>
  <files>
    apps/extension/src/offscreen/index.ts
    apps/extension/src/shared/types/messages.ts
    apps/extension/src/background/storage/index.ts
  </files>
  <action>
In `apps/extension/src/offscreen/index.ts`:
- Add `let recordingStartTime = 0` at module top level (after line 2)
- In `startRecording()`: set `recordingStartTime = Date.now()` before `mediaRecorder.start()` (after `mediaRecorder = new MediaRecorder(stream)`)
- In `stopRecording()` onstop handler (line 33): change `duration: audioBlob.size / 1000` to `duration: Math.round((Date.now() - recordingStartTime)) / 1000`

In `apps/extension/src/shared/types/messages.ts`:
- Remove `NOTE_CAPTURE_START` entry (lines 28-31)
- Remove `NOTE_STOP_CAPTURE` entry (lines 33-36)
- Remove `NOTE_SAVE` entry (lines 72-75)
- Add new `GET_NOTE_AUDIO` entry:
  ```typescript
  'GET_NOTE_AUDIO': {
    payload: { noteId: string }
    response: { success: boolean; audioBlob?: Blob; error?: string }
  }
  ```

In `apps/extension/src/background/storage/index.ts`:
- Fix `getNotesCount()` (lines 104-107): replace `db.notes.count()` with:
  ```typescript
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return await db.notes.where('createdAt').aboveOrEqual(startOfMonth).count()
  ```
- Add new exported function after `getNotesCount()`:
  ```typescript
  export async function getNoteAudio(noteId: string): Promise<Blob | null> {
    const db = getDB()
    const note = await db.notes.get(noteId)
    return note?.audioBlob ?? null
  }
  ```
  </action>
  <verify>
    <automated>cd apps/extension && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - Duration uses Date.now() delta (not blob.size)
    - getNotesCount filters by current calendar month
    - getNoteAudio exported from storage module
    - Dead message types removed from messages.ts
    - NOTE_SAVE type removed from messages.ts
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Task 2: Clean background handler + auto-titles + GET_NOTE_AUDIO wiring</name>
  <files>
    apps/extension/src/background/index.ts
  </files>
  <action>
In `apps/extension/src/background/index.ts`:

1. Update imports: add `getNoteAudio` to the import from `'./storage'` (line 1-11)

2. Delete `handleNoteSave` function entirely (lines 152-168)

3. In `handleStopRecording()` (lines 93-121), after `await addNote(...)`:
   - Get notes count for auto-title: `const notes = await getNotes(50)`
   - Calculate title: `const title = \`Voice Note #${notes.length} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\``
   - BUT: addNote already saved without title. Better approach: modify addNote to accept title, or update after save.
   - Best: generate title BEFORE addNote. Get count first, then:
     ```typescript
     const currentCount = await getNotesCount()
     const title = `Voice Note #${currentCount} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
     ```
   - Pass `title` instead of `null` to addNote on line 108

4. In `handleGetNotes()` (lines 136-150): the notes response already maps to `{ id, title, duration, createdAt }` — this is fine, no audioBlob sent in list.

5. Add new handler function:
   ```typescript
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
   ```

6. In the `switch` statement (line 195+):
   - Remove the `case 'NOTE_SAVE':` block (lines 223-224)
   - Add `case 'GET_NOTE_AUDIO': return await handleGetNoteAudio(message.noteId)`
  </action>
  <verify>
    <automated>cd apps/extension && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - handleNoteSave function removed
    - NOTE_SAVE case removed from switch
    - Auto-generated titles in format "Voice Note #N — Apr 10, 2026"
    - GET_NOTE_AUDIO case in switch returns audioBlob
    - No dead code paths
    - TypeScript compiles cleanly
  </done>
</task>

</tasks>

<verification>
- `cd apps/extension && npx tsc --noEmit` passes with no errors
- `cd apps/extension && npx vitest run` — all 23 existing tests still pass
- Grep confirms no references to NOTE_CAPTURE_START, NOTE_STOP_CAPTURE, NOTE_SAVE, or handleNoteSave remain
- Grep confirms recordingStartTime exists in offscreen/index.ts
- Grep confirms GET_NOTE_AUDIO exists in messages.ts and background/index.ts
</verification>

<success_criteria>
- Note duration uses wall-clock time (Date.now() delta)
- Monthly note count filters by current calendar month
- Duplicate NOTE_SAVE handler removed, only STOP_RECORDING path exists
- Dead message types removed
- Auto-generated titles applied to new notes
- GET_NOTE_AUDIO endpoint returns audioBlob for playback
- All existing tests pass, TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/phases/01-critical-fixes/01-01-SUMMARY.md`
</output>
