---
phase: 01-critical-fixes
plan: 04
type: execute
wave: 4
depends_on: []
files_modified:
  - apps/extension/src/shared/lib/companion-utils.ts
  - apps/extension/src/test/companion-utils.test.ts
  - apps/extension/src/test/word-replacement.test.ts
autonomous: false
gap_closure: true
requirements: []

must_haves:
  truths:
    - "Spelling dictionary has 200+ actual misspellings (not counting tautological entries)"
    - "All existing tests pass (29/29)"
    - "Audio playback verified end-to-end by human"
  artifacts:
    - path: "apps/extension/src/shared/lib/companion-utils.ts"
      provides: "Expanded misspellings dictionary with 240+ entries, no tautological entries"
    - path: "apps/extension/src/test/companion-utils.test.ts"
      provides: "Fixed test expectations for dictionary overlap"
    - path: "apps/extension/src/test/word-replacement.test.ts"
      provides: "Mocked window.getSelection for jsdom contentEditable test"
  key_links:
    - from: "companion-utils.test.ts"
      to: "companion-utils.ts"
      via: "test assertions against misspellings dict"
      pattern: "misspellings"
---

<objective>
Close 3 gaps found in Phase 01 VERIFICATION (14/17 verified).

Purpose: Dictionary count is below spec (113 vs 200+), 3 tests fail due to dictionary expansion and jsdom limitations, and audio playback needs human confirmation.
Output: Fixed dictionary, passing tests, human-verified audio playback.
</objective>

<execution_context>
@C:/Users/berks/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/berks/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-critical-fixes/01-VERIFICATION.md
@.planning/phases/01-critical-fixes/01-03-SUMMARY.md
@apps/extension/src/shared/lib/companion-utils.ts
@apps/extension/src/test/companion-utils.test.ts
@apps/extension/src/test/word-replacement.test.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Expand dictionary and remove tautological entries</name>
  <files>apps/extension/src/shared/lib/companion-utils.ts</files>
  <action>
Fix the misspellings dictionary in companion-utils.ts:

1. **Remove tautological entries** where the key maps only to itself — these inflate count without value:
   - Remove: 'knight':['knight'], 'helpful':['helpful'], 'powerful':['powerful'], 'wonderful':['wonderful'], 'absence':['absence'], 'calm':['calm'], 'flavor':['flavor'], 'broad':['broad'], 'quick':['quick']

2. **Add ~100 more actual misspellings** covering common dyslexic patterns. Categories:
   - ie/ei confusion: acheive→achieve, decieve→deceive, percieve→perceive, neice→niece, wiegh→weigh, wheight→weight, yeild→yield
   - Double-letter confusion: mispell→misspell, ocurrance→occurrence, occassion→occasion, adres→address, completly→completely, naturaly→naturally, begining→beginning, planing→planning, runing→running, stoping→stopping, shoping→shopping
   - Vowel substitutions: tommorow→tomorrow, tommorrow→tomorrow, tomorow→tomorrow, enviroment→environment, temparature→temperature, intresting→interesting, diffrent→different, differnt→different
   - Prefix/suffix errors: basicly→basically, recomend→recommend, reccomend→recommend, excersize→exercise, exersise→exercise, definitly→definitely, definiton→definition
   - Phonetic spellings: bizness→business, buisness→business, bruther→brother, sistor→sister, muvment→movement, skience→science
   - Other common: gaurd→guard, garantee→guarantee, foriegn→foreign, greatful→grateful, humerous→humorous, ignorence→ignorance, immediatly→immediately, importent→important, liason→liaison, liesure→leisure, loosing→losing, managment→management, posession→possession, privelege→privilege, publically→publicly, religous→religious, repitition→repetition, sargent→sergeant, seige→siege, wether→whether, whitch→which, writting→writing, sence→sense, sentance→sentence, grammer→grammar
   - Contractions: couldnt→couldn't, wouldnt→wouldn't, shouldnt→shouldn't, didnt→didn't, isnt→isn't, wasnt→wasn't, hasnt→hasn't
   - Silent letters: acknowlege→acknowledge, autum→autumn, hym→hymn, solem→solemn
   - Success-related: sucessful→successful, sucess→success, necesarily→necessarily

Do NOT add any entry where the key is a correctly-spelled word mapping to itself. Every entry must be an actual misspelling mapping to its correction.
  </action>
  <verify>
    <automated>node -e "const {misspellings} = require('./apps/extension/src/shared/lib/companion-utils.ts'); const keys = Object.keys(misspellings); const taut = Object.entries(misspellings).filter(([k,v]) => v.length === 1 && v[0] === k); console.log('Keys:', keys.length, 'Tautological:', taut.length); process.exit(keys.length >= 200 && taut.length === 0 ? 0 : 1)" 2>/dev/null || echo "Manual check: count keys in misspellings object, verify >=200, verify 0 tautological entries"</automated>
  </verify>
  <done>Misspellings dictionary has 200+ keys, 0 tautological entries, build passes</done>
</task>

<task type="auto">
  <name>Task 2: Fix 3 failing tests</name>
  <files>apps/extension/src/test/companion-utils.test.ts, apps/extension/src/test/word-replacement.test.ts</files>
  <action>
Fix 3 failing tests across 2 test files:

**Test 1: companion-utils.test.ts — "returns empty for correctly spelled words"**
Root cause: 'there' and 'were' now match dictionary entries as homophone confusion words.
Fix: Replace test words 'there' and 'were' with 'apple', 'green', 'chair', 'water' — common words NOT in referenceWords and NOT close to any referenceWord (all edit distances > 2).

**Test 2: companion-utils.test.ts — "returns empty for unknown words"**
Root cause: 'qwert' may fuzzy-match a referenceWord within edit distance 2.
Fix: Replace 'qwert' with 'asdfg' — nonsense string that cannot match any referenceWord.

**Test 3: word-replacement.test.ts — "handles contentEditable elements"**
Root cause: jsdom's window.getSelection() returns null — Selection API not implemented.
Fix: Mock window.getSelection before the test:
```typescript
const mockSelection = {
  rangeCount: 1,
  getRangeAt: () => ({
    startContainer: div.firstChild,
    startOffset: 13,
  }),
}
vi.stubGlobal('getSelection', () => mockSelection)
```
If the actual error is different (e.g., isContentEditable), run the test first to see exact error, then apply minimal fix.
  </action>
  <verify>
    <automated>npx vitest run --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>All 29 tests pass (0 failures), build passes</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify audio playback end-to-end</name>
  <files>apps/extension/src/popup/App.tsx</files>
  <action>
No code changes needed. Audio playback code is correctly wired (direct IndexedDB → Blob → ObjectURL → HTMLAudioElement → play). This task requires human verification in a real browser because:
- Requires real microphone hardware
- Requires Chrome extension runtime
- Audio pipeline (IndexedDB → Blob → ObjectURL → HTMLAudioElement → speakers) cannot be verified in automated tests

Human should:
1. Build extension: cd apps/extension && npm run build
2. Load unpacked extension in Chrome from apps/extension/dist
3. Open popup, click Record, speak 3-5 seconds, click Stop
4. Note should appear in list with title and duration
5. Click the ▶ play button on the recorded note
6. Expected: Audio plays back through speakers. Button toggles to ⏹. Click ⏹ to stop.
  </action>
  <verify>Human confirms audio plays back correctly with no console errors</verify>
  <done>Human approved — audio playback works end-to-end in browser</done>
</task>

</tasks>

<verification>
- Object.keys(misspellings).length >= 200
- 0 tautological entries in misspellings
- npx vitest run — all tests pass
- npm run build — builds cleanly
- Human confirms audio playback works
</verification>

<success_criteria>
- Dictionary expanded to 200+ actual misspellings with no tautological entries
- All 29 tests pass
- Human verified audio playback works end-to-end
</success_criteria>

<output>
After completion, create .planning/phases/01-critical-fixes/01-04-SUMMARY.md
</output>
