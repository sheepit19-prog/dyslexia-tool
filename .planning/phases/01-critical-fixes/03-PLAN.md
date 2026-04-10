---
phase: 01-critical-fixes
plan: 03
type: execute
wave: 2
depends_on:
  - 01
files_modified:
  - apps/extension/src/popup/App.tsx
autonomous: false
requirements:
  - NOTES-01
  - NOTES-02

must_haves:
  truths:
    - "User can see a scrollable list of their voice notes in the popup"
    - "Each note shows title, date, duration, play and delete buttons"
    - "User can play a note's audio recording via HTMLAudioElement"
    - "User can delete a note from the list"
    - "Note count shows current monthly count (not total)"
  artifacts:
    - path: "apps/extension/src/popup/App.tsx"
      provides: "Full note listing UI with playback controls"
      contains: "GET_NOTE_AUDIO"
  key_links:
    - from: "apps/extension/src/popup/App.tsx"
      to: "background/index.ts"
      via: "GET_NOTES message to fetch list, GET_NOTE_AUDIO for playback, DELETE_NOTE for removal"
      pattern: "GET_NOTE_AUDIO"
---

<objective>
Build the note listing and playback UI in the popup.

Purpose: Notes are recorded but users have no way to see, play, or manage them. This is the user-facing half of the note-taking feature.
Output: Popup with scrollable note list, audio playback, and delete functionality.
</objective>

<execution_context>
@C:/Users/berks/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/berks/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-critical-fixes/01-01-SUMMARY.md

<interfaces>

From apps/extension/src/popup/App.tsx (current structure — 229 lines):
- Uses inline styles (no Tailwind) — maintain this pattern
- Width constraint: 400px
- Currently shows noteCount only (no list, no playback)
- State: settings, noteCount, loading, error, readingRulerEnabled, isRecording, companionEnabled

Background API available (from Plan 01):
```typescript
// GET_NOTES response shape (from handleGetNotes):
{ success: boolean, notes?: Array<{ id: string; title: string | null; duration: number; createdAt: Date }> }

// GET_NOTE_AUDIO response shape (new):
{ success: boolean; audioBlob?: Blob; error?: string }
// Message format: { type: 'GET_NOTE_AUDIO', noteId: string }

// DELETE_NOTE response shape:
{ success: boolean }
// Message format: { type: 'DELETE_NOTE', noteId: string }

// Note: GET_NOTES response does NOT include audioBlob (stripped in handleGetNotes)
// Must call GET_NOTE_AUDIO separately when user clicks play
```

Audio playback approach:
```typescript
// Create object URL from blob, play via HTMLAudioElement
const audioBlob = response.audioBlob  // Blob from GET_NOTE_AUDIO
const url = URL.createObjectURL(audioBlob)
const audio = new Audio(url)
audio.play()
// Revoke URL when done: audio.onended = () => URL.revokeObjectURL(url)
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add note listing state and data fetching to popup</name>
  <files>
    apps/extension/src/popup/App.tsx
  </files>
  <action>
In `apps/extension/src/popup/App.tsx`:

1. Add new state variables (after existing state declarations ~line 27):
   ```typescript
   const [notes, setNotes] = useState<Array<{ id: string; title: string | null; duration: number; createdAt: string | Date }>>([])
   const [playingNoteId, setPlayingNoteId] = useState<string | null>(null)
   const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
   ```

2. Create a `loadNotes` function (before the toggleFont function):
   ```typescript
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
   ```

3. Update the useEffect loadData (lines 45-64):
   - Replace the manual GET_NOTES + setNoteCount with: `await loadNotes()`
   - Keep settings loading logic unchanged

4. In `stopRecording` (lines 130-145), replace the GET_NOTES refresh:
   - Change `const notesResponse = await chrome.runtime.sendMessage({ type: 'GET_NOTES' })` + `setNoteCount` to: `await loadNotes()`

5. Add playback handler:
   ```typescript
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
   ```

6. Add delete handler:
   ```typescript
   const handleDeleteNote = async (noteId: string) => {
     try {
       const response = await chrome.runtime.sendMessage({ type: 'DELETE_NOTE', noteId })
       if (response.success) await loadNotes()
     } catch (error) {
       console.error('[Popup] Delete failed:', error)
     }
   }
   ```
  </action>
  <verify>
    <automated>cd apps/extension && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - Notes state holds full note objects from GET_NOTES
    - loadNotes() fetches and sets both notes and noteCount
    - playNote() fetches audio blob via GET_NOTE_AUDIO and plays via HTMLAudioElement
    - handleDeleteNote() calls DELETE_NOTE and refreshes list
    - Playing state tracked with playingNoteId
    - Object URLs properly revoked on playback end
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Task 2: Build scrollable note list UI in popup</name>
  <files>
    apps/extension/src/popup/App.tsx
  </files>
  <action>
In the popup JSX, replace the existing Voice Note section (lines 212-221) with an expanded version that includes a scrollable note list:

Replace the `<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...}}>` section for Voice Note (lines 212-221) with:

```tsx
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
```

Key design decisions:
- Note list maxHeight: 200px with overflow scroll — fits within 400px popup
- Each note is a compact card with title, date, duration
- Play button toggles between ▶ and ⏹ (same button to stop)
- Delete button uses red styling for destructive action
- No confirmation dialog for delete (single-click, fast UX — notes are casual memos)
  </action>
  <verify>
    <automated>cd apps/extension && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - Scrollable note list (maxHeight 200px) fits within 400px popup
    - Each note shows: title (auto-generated), date, duration in seconds
    - Play button fetches audio blob and plays via HTMLAudioElement
    - Delete button removes note and refreshes list
    - Empty state handled (notes.length > 0 guard)
    - Inline styles maintained (no Tailwind)
    - TypeScript compiles cleanly
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify complete note-taking flow in browser</name>
  <files>apps/extension/src/popup/App.tsx</files>
  <action>Human verification of the complete note-taking UI. Steps:
    1. Build extension: `cd apps/extension && npm run build`
    2. Load extension in Chrome (chrome://extensions → Developer mode → Load unpacked → select dist/ folder)
    3. Click extension icon to open popup
    4. Click "Record" button — should start recording (button turns red "Stop")
    5. Speak for 3-5 seconds, then click "Stop"
    6. Note should appear in the list with auto-generated title (e.g., "Voice Note #1 — Apr 10, 2026")
    7. Click play to play back the recording — audio should play
    8. Click stop to stop playback
    9. Click delete to remove the note — note disappears from list
    10. Verify note count updates correctly after recording and deleting</action>
  <verify>Manual: follow steps above, confirm all 10 steps work</verify>
  <done>User confirms record → list → play → delete flow works end-to-end in popup</done>
</task>

</tasks>

<verification>
- `cd apps/extension && npx tsc --noEmit` passes
- `cd apps/extension && npm run build` succeeds
- Manual verification: record → list → play → delete flow works in popup
</verification>

<success_criteria>
- Popup shows scrollable list of voice notes with title, date, duration
- Audio playback works (GET_NOTE_AUDIO → HTMLAudioElement → object URL)
- Delete removes note and refreshes list
- Note count reflects monthly count
- Auto-generated titles display correctly
- UI fits within 400px popup constraint
</success_criteria>

<output>
After completion, create `.planning/phases/01-critical-fixes/01-03-SUMMARY.md`
</output>
