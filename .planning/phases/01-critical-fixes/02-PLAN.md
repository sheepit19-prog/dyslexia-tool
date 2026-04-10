---
phase: 01-critical-fixes
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/extension/src/shared/lib/companion-utils.ts
  - apps/extension/src/content/index.tsx
  - apps/extension/fonts/OpenDyslexic-Regular.woff2
  - apps/extension/fonts/OpenDyslexic-Bold.woff2
autonomous: true
requirements:
  - COMP-01
  - COMP-02
  - COMP-03
  - COMP-04
  - COMP-05
  - COMP-06

must_haves:
  truths:
    - "OpenDyslexic font loads from extension bundle and applies to page text"
    - "Spelling dictionary has 200+ entries covering common dyslexic patterns"
    - "Fuzzy matching catches near-misses within edit distance 2"
    - "contentEditable word replacement works (Gmail, Google Docs)"
    - "contentEditable cursor tracking uses Selection/Range API"
    - "COMPANION_DETECTED_STRUGGLE message sent from content script to background"
  artifacts:
    - path: "apps/extension/src/shared/lib/companion-utils.ts"
      provides: "200+ dictionary, Levenshtein distance, contentEditable support"
      contains: "levenshteinDistance"
    - path: "apps/extension/src/content/index.tsx"
      provides: "Font loading via @font-face, analytics wiring"
      contains: "COMPANION_DETECTED_STRUGGLE"
    - path: "apps/extension/fonts/OpenDyslexic-Regular.woff2"
      provides: "OpenDyslexic font file bundled with extension"
  key_links:
    - from: "apps/extension/src/content/index.tsx"
      to: "apps/extension/fonts/"
      via: "@font-face with chrome.runtime.getURL('fonts/OpenDyslexic-Regular.woff2')"
      pattern: "chrome\\.runtime\\.getURL.*fonts"
    - from: "apps/extension/src/content/index.tsx"
      to: "background/index.ts"
      via: "chrome.runtime.sendMessage COMPANION_DETECTED_STRUGGLE"
      pattern: "COMPANION_DETECTED_STRUGGLE"
---

<objective>
Fix companion suggestions, font loading, contentEditable support, and analytics wiring.

Purpose: Companion is the core value prop but barely works — font never loads, dictionary is tiny, contentEditable (Gmail/Docs) is broken, and analytics are never reported.
Output: Working companion with real font, fuzzy matching, rich text editor support, and analytics pipeline.
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

From apps/extension/src/shared/lib/companion-utils.ts (current exports):
```typescript
export function generateSpellingSuggestions(word: string): string[]
export const SNOOZE_DURATION = 300000
export const PAUSE_THRESHOLD = 10000
export const BACKSPACE_THRESHOLD = 3
export function getCurrentWordFromElement(element: HTMLElement): { word: string; start: number; end: number } | null
export function replaceWordInElement(element: HTMLElement, newWord: string): boolean
// NEW: export function levenshteinDistance(a: string, b: string): number
```

From apps/extension/src/content/index.tsx (current structure):
- Line 17: `injectFontStyles(_fontFamily: string = 'OpenDyslexic', lineHeight: number = 1.6)` — ignores _fontFamily param
- Line 18: `const fontStack = 'Verdana, Arial, sans-serif'` — hardcoded, never loads OpenDyslexic
- Uses inline styles (no Tailwind) — maintain this pattern
- Font files source: `dysspell/public/fonts/OpenDyslexic-Regular.woff2` and `OpenDyslexic-Bold.woff2`
- Copy to `apps/extension/fonts/` (already in web_accessible_resources in manifest.json)
- Use `chrome.runtime.getURL('fonts/OpenDyslexic-Regular.woff2')` for @font-face src

From apps/extension/src/shared/types/messages.ts:
```typescript
'COMPANION_DETECTED_STRUGGLE': {
  payload: { type: StruggleType; confidence: StruggleConfidence }
  response: void
}
// StruggleType = 'typing' | 'reading'
// StruggleConfidence = 'low' | 'medium' | 'high'
```

From apps/extension/src/test/companion-utils.test.ts (existing 11 tests):
- Tests generateSpellingSuggestions with specific misspellings
- New Levenshtein and expanded dictionary tests needed but deferred (existing tests must still pass)

From apps/extension/src/test/word-replacement.test.ts (existing 12 tests):
- Tests getCurrentWordFromElement and replaceWordInElement for INPUT/TEXTAREA
- contentEditable test exists (line 60-69) — currently expects word='text' using text.length
- After fix, contentEditable test may need adjustment since cursor tracking changes
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Copy fonts + fix OpenDyslexic loading + wire analytics in content script</name>
  <files>
    apps/extension/fonts/OpenDyslexic-Regular.woff2
    apps/extension/fonts/OpenDyslexic-Bold.woff2
    apps/extension/src/content/index.tsx
  </files>
  <action>
1. Copy font files from `dysspell/public/fonts/` to `apps/extension/fonts/`:
   - `OpenDyslexic-Regular.woff2`
   - `OpenDyslexic-Bold.woff2`

2. In `apps/extension/src/content/index.tsx`, fix `injectFontStyles` (line 17-32):
   - Rename `_fontFamily` parameter to `fontFamily` (remove underscore — we're now using it)
   - Remove hardcoded `const fontStack = 'Verdana, Arial, sans-serif'`
   - Add @font-face injection BEFORE the main style element:
     ```typescript
     let fontFaceStyle = document.getElementById('dyslexia-tool-font-face') as HTMLStyleElement | null
     if (!fontFaceStyle) {
       fontFaceStyle = document.createElement('style')
       fontFaceStyle.id = 'dyslexia-tool-font-face'
       fontFaceStyle.textContent = `
         @font-face {
           font-family: 'OpenDyslexic';
           src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Regular.woff2')}') format('woff2');
           font-weight: normal;
           font-style: normal;
         }
         @font-face {
           font-family: 'OpenDyslexic';
           src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Bold.woff2')}') format('woff2');
           font-weight: bold;
           font-style: normal;
         }
       `
       document.head.appendChild(fontFaceStyle)
     }
     ```
   - Use `fontFamily` param in the CSS rule: `font-family: '${fontFamily}', Verdana, Arial, sans-serif !important;`

3. Wire `COMPANION_DETECTED_STRUGGLE` analytics — in `showStruggleHelp()` function (line 341-345):
   - After `showCompanionNotification(...)` call, add:
     ```typescript
     try {
       chrome.runtime.sendMessage({
         type: 'COMPANION_DETECTED_STRUGGLE',
         payload: { type: type === 'spelling' ? 'typing' : 'reading', confidence: 'medium' }
       })
     } catch (e) {
       console.warn('[Content Script] Failed to report struggle:', e)
     }
     ```
  </action>
  <verify>
    <automated>cd apps/extension && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - OpenDyslexic .woff2 files exist in apps/extension/fonts/
    - injectFontStyles loads @font-face with chrome.runtime.getURL
    - Font family parameter is respected (not ignored)
    - COMPANION_DETECTED_STRUGGLE sent from content script on struggle detection
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Task 2: Expand dictionary to 200+, add Levenshtein fuzzy matching, fix contentEditable</name>
  <files>
    apps/extension/src/shared/lib/companion-utils.ts
    apps/extension/src/test/companion-utils.test.ts
    apps/extension/src/test/word-replacement.test.ts
  </files>
  <action>
In `apps/extension/src/shared/lib/companion-utils.ts`:

1. Add Levenshtein distance function at top of file (after imports):
   ```typescript
   export function levenshteinDistance(a: string, b: string): number {
     const matrix: number[][] = []
     for (let i = 0; i <= b.length; i++) matrix[i] = [i]
     for (let j = 0; j <= a.length; j++) matrix[0][j] = j
     for (let i = 1; i <= b.length; i++) {
       for (let j = 1; j <= a.length; j++) {
         if (b[i - 1] === a[j - 1]) {
           matrix[i][j] = matrix[i - 1][j - 1]
         } else {
           matrix[i][j] = Math.min(
             matrix[i - 1][j - 1] + 1,
             matrix[i][j - 1] + 1,
             matrix[i - 1][j] + 1
           )
         }
       }
     }
     return matrix[b.length][a.length]
   }
   ```

2. Create a reference word list (correctly spelled words that dyslexic users commonly misspell). This is an array of ~120 common words. After the misspellings object, add:
   ```typescript
   const referenceWords: string[] = [
     'because', 'receive', 'believe', 'separate', 'definitely', 'necessary',
     'government', 'friend', 'their', 'there', 'they\'re', 'write', 'right',
     'which', 'witch', 'where', 'were', 'wear', 'through', 'thought',
     'although', 'together', 'different', 'important', 'interesting',
     'environment', 'beginning', 'beautiful', 'comfortable', 'possible',
     'probably', 'actually', 'basically', 'especially', 'particular',
     'experience', 'knowledge', 'language', 'paragraph', 'question',
     'remember', 'sentence', 'something', 'sometimes', 'surprise',
     'trouble', 'watching', 'working', 'writing', 'school', 'people',
     'little', 'mountain', 'country', 'picture', 'children', 'animal',
     'example', 'special', 'problem', 'complete', 'consider', 'develop',
     'machine', 'produce', 'various', 'natural', 'surface', 'without',
     'million', 'position', 'remember', 'continue', 'increase', 'several',
     'suddenly', 'standard', 'industry', 'movement', 'question', 'business',
     'occasion', 'exercise', 'strength', 'straight', 'difficult', 'excellent',
     'familiar', 'favorite', 'generous', 'gathering', 'hurricane', 'imagine',
     'journal', 'knocking', 'library', 'material', 'necessary', 'original',
     'personal', 'possible', 'question', 'railroad', 'science', 'thousand',
     'umbrella', 'vacation', 'weather', 'measure', 'pleasure', 'treasure',
     'capture', 'picture', 'mixture', 'culture', 'adventure', 'creature',
     'century', 'general', 'natural', 'village', 'message', 'passage',
     'advance', 'balance', 'evidence', 'influence', 'practice', 'service',
     'silence', 'violence', 'distance', 'instance', 'substance', 'accident',
     'recent', 'confident', 'different', 'independent', 'innocent',
     'patient', 'ancient', 'sufficient', 'transparent', 'intelligent',
     'absent', 'consistent', 'efficient', 'magnificent', 'permanent'
   ]
   ```
   (Remove duplicates from the list — ensure ~120 unique entries)

3. Expand the existing `misspellings` object to reach 200+ total entries. Add categories for:
   - Letter reversals (b/d, p/q): 'broud' → ['proud'], 'qrint' → ['print'], 'dack' → ['back']
   - Vowel confusions: 'depind' → ['depend'], 'cammon' → ['common'], 'studebt' → ['student']
   - Phonetic spelling: 'enuff' → ['enough'], 'nolij' → ['knowledge'], 'skool' → ['school']
   - Transpositions (expand existing): 'siad' → ['said'], 'olec' → ['cole'], 'ni' → ['in']
   - Double letter issues: 'occurence' → ['occurrence'], 'adress' → ['address'], ' acomodate' → ['accommodate']
   - Prefix/suffix errors: 'unfortunatly' → ['unfortunately'], 'happly' → ['happily'], 'truely' → ['truly']
   - Add at minimum 160 more entries to reach 200+ total

4. Update `generateSpellingSuggestions` function:
   - Keep the existing dictionary lookup: `const exact = misspellings[lower] || []`
   - Add fuzzy matching fallback:
     ```typescript
     if (exact.length > 0) return exact

     const suggestions: Array<{ word: string; distance: number }> = []
     for (const ref of referenceWords) {
       if (Math.abs(ref.length - lower.length) > 2) continue
       const dist = levenshteinDistance(lower, ref)
       if (dist > 0 && dist <= 2) {
         suggestions.push({ word: ref, distance: dist })
       }
     }
     suggestions.sort((a, b) => a.distance - b.distance)
     return suggestions.slice(0, 5).map(s => s.word)
     ```

5. Fix `getCurrentWordFromElement` for contentEditable (lines 55-57):
   - Replace `cursorPos = text.length` with Selection/Range API:
     ```typescript
     const selection = window.getSelection()
     if (selection && selection.rangeCount > 0) {
       const range = selection.getRangeAt(0)
       const preRange = document.createRange()
       preRange.selectNodeContents(element)
       preRange.setEnd(range.startContainer, range.startOffset)
       cursorPos = preRange.toString().length
     } else {
       cursorPos = text.length
     }
     ```

6. Fix `replaceWordInElement` for contentEditable (currently returns false at line 94):
   - Add contentEditable branch before the `return false`:
     ```typescript
     if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
       const current = getCurrentWordFromElement(element)
       if (!current) return false

       const selection = window.getSelection()
       if (!selection || selection.rangeCount === 0) return false

       const text = element.textContent || ''
       const before = text.substring(0, current.start)
       const after = text.substring(current.end)
       element.textContent = before + newWord + after

       const range = document.createRange()
       const textNode = element.firstChild
       if (textNode) {
         const newPos = current.start + newWord.length
         range.setStart(textNode, Math.min(newPos, textNode.textContent?.length ?? 0))
         range.collapse(true)
         selection.removeAllRanges()
         selection.addRange(range)
       }
       element.dispatchEvent(new Event('input', { bubbles: true }))
       return true
     }
     ```

In `apps/extension/src/test/companion-utils.test.ts`:
- Add test for levenshteinDistance:
  ```typescript
  describe('levenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0)
    })
    it('returns correct distance for single edits', () => {
      expect(levenshteinDistance('hte', 'the')).toBe(2)
      expect(levenshteinDistance('cat', 'car')).toBe(1)
    })
  })
  ```
- Add import for `levenshteinDistance`
- Add test for fuzzy matching on unrecognized words:
  ```typescript
  it('returns fuzzy matches for near-misses', () => {
    const suggestions = generateSpellingSuggestions('beacuse')
    expect(suggestions.length).toBeGreaterThan(0)
  })
  ```
- Verify existing exact-match tests still pass (becuase, recieve, etc.)

In `apps/extension/src/test/word-replacement.test.ts`:
- The existing contentEditable test (line 60-69) tests `getCurrentWordFromElement` with a div.
  After the fix, since there's no real selection in jsdom, the fallback to `text.length` may still apply.
  If tests break: update the test to account for the Selection API fallback path, or mock window.getSelection.
  The safest approach: the contentEditable branch already falls back to `cursorPos = text.length` when no selection exists, so existing tests should still pass.
  </action>
  <verify>
    <automated>cd apps/extension && npx vitest run 2>&1 | tail -20</automated>
  </verify>
  <done>
    - Dictionary has 200+ entries (grep count the misspellings object keys)
    - levenshteinDistance function exported and tested
    - Fuzzy matching catches near-misses within edit distance 2
    - contentEditable getCurrentWordFromElement uses Selection API (falls back to text.length)
    - contentEditable replaceWordInElement implements replacement using Range API
    - All existing and new tests pass
    - TypeScript compiles cleanly
  </done>
</task>

</tasks>

<verification>
- `cd apps/extension && npx tsc --noEmit` passes
- `cd apps/extension && npx vitest run` — all tests pass (23 existing + new tests)
- Font files exist in `apps/extension/fonts/`
- Grep confirms `levenshteinDistance` in companion-utils.ts
- Grep confirms `chrome.runtime.getURL` in content/index.tsx for font loading
- Grep confirms `COMPANION_DETECTED_STRUGGLE` sent in content/index.tsx
</verification>

<success_criteria>
- OpenDyslexic font loads from extension bundle via @font-face
- Dictionary expanded to 200+ entries
- Levenshtein distance-based fuzzy matching for near-misses (edit distance ≤ 2)
- contentEditable word replacement works using Selection/Range API
- contentEditable cursor tracking uses Selection API
- COMPANION_DETECTED_STRUGGLE analytics wired from content script → background
- All tests pass
</success_criteria>

<output>
After completion, create `.planning/phases/01-critical-fixes/01-02-SUMMARY.md`
</output>
