# Phase 3: Technical Debt & Polish - Research

**Researched:** 2026-04-12
**Domain:** Chrome Extension codebase cleanup, test infrastructure, CSP handling, onboarding UI
**Confidence:** HIGH

## Summary

Phase 3 addresses a well-defined set of technical debt items in an existing Chrome Extension codebase (MV3, React 19, TypeScript, Vite 7, Vitest 2, Dexie 4, Tailwind 4, Zustand 5). The codebase is small (~20 source files, ~2000 lines of app code) with only 2 test files (29 tests) and a broken E2E test suite. The content script at `src/content/index.tsx` (417 lines) is the primary refactoring target — it mixes font injection, TTS, reading ruler, companion intelligence, suggestion UI, and message handling into one file. Twelve raw `chrome.*.sendMessage` calls exist across 4 files that should adopt the type-safe `sendMessage` helper in `messages.ts`. The `CompanionNotification.tsx` React component is dead code — never imported anywhere.

The onboarding welcome screen is a new feature: a 3-step tutorial in the popup triggered on first install. CSP handling for restricted sites requires graceful degradation when inline styles (used heavily in content script) are blocked. Performance profiling needs baseline measurements before optimization.

**Primary recommendation:** Split the phase into two sequential plans — (1) debt cleanup (dead code, type-safe messaging, content script refactor, unit tests) that makes the codebase maintainable, then (2) polish (onboarding, CSP, sensitivity tuning, performance, store prep) that builds on the clean foundation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Onboarding welcome screen: 3-step feature tour — Step 1: what the extension does, Step 2: companion demo, Step 3: settings overview
- Warm & encouraging tone — supportive language fitting the dyslexia support mission (e.g., "Let's make reading easier for you.")
- Triggered automatically on first install only
- Accessible later from settings page for revisiting
- Final CTA: "Try it now" button opens a curated sample page where users can immediately test the companion on real text

### Claude's Discretion
- Dead code removal approach and scope
- Content script module split strategy
- Type-safe sendMessage helper adoption order
- Test framework and coverage targets
- CSP handling technical approach for blocked sites
- Companion detection sensitivity tuning parameters
- Sample page content for onboarding CTA
- Onboarding UI design (illustrations, animations, layout)
- Performance profiling methodology
- Chrome Web Store listing copy and assets

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.0.0 | UI components (popup, options, onboarding) | Already in use for popup + options |
| Vitest | ^2.0.0 | Unit testing | Already configured, 29 tests passing |
| Dexie | ^4.0.0 | IndexedDB wrapper | Already in use for all storage |
| Zustand | ^5.0.0 | State management | Already in use for options settings store |
| Tailwind CSS | ^4.0.0 | Styling | Configured with 20px base font |
| Vite | ^7.0.0 | Build tool | Already building successfully |
| Playwright | ^1.40.0 | E2E testing | Installed, config exists, tests broken |

### Supporting (may need adding)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| None needed | All dependencies already in package.json | - |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React for onboarding | Plain HTML/CSS in popup | Simpler but inconsistent with codebase patterns — stick with React |
| New test lib | Keep Vitest | Already configured and working — no reason to switch |

## Architecture Patterns

### Current Source Structure
```
apps/extension/src/
├── background/          # Service worker
│   ├── index.ts         # Message routing (253 lines)
│   └── storage/         # Dexie IndexedDB operations (216 lines)
├── content/             # Content script (NEEDS SPLIT)
│   ├── index.tsx        # Monolithic: fonts + TTS + ruler + companion + UI (417 lines)
│   ├── companion-ui/
│   │   └── CompanionNotification.tsx  # DEAD CODE — never imported
│   └── styles.css       # Content script styles (28 lines)
├── e2e/                 # Broken E2E tests
│   └── companion.spec.ts
├── mic-permission/      # Legacy recording page (unused after Phase 1 popup recording)
│   ├── index.html
│   └── index.ts
├── offscreen/           # Legacy offscreen recording (unused after Phase 1)
│   └── index.ts
├── offscreen-html/
│   └── index.html
├── options/             # Options page (Phase 2)
│   ├── App.tsx
│   ├── components/      # 6 settings panels + sidebar + 3 UI primitives
│   └── hooks/useSettings.ts  # Zustand store
├── popup/               # Popup UI
│   └── App.tsx          # Main popup (376 lines)
├── shared/
│   ├── lib/
│   │   └── companion-utils.ts  # Spelling engine (375 lines)
│   └── types/
│       ├── index.ts
│       ├── messages.ts  # Type-safe sendMessage helper (104 lines)
│       └── storage.ts   # Type definitions (50 lines)
└── test/
    ├── setup.ts         # Chrome API mocks
    ├── companion-utils.test.ts
    └── word-replacement.test.ts
```

### Pattern 1: Content Script Module Split
**What:** Break `content/index.tsx` (417 lines) into focused modules
**When to use:** This is the primary refactoring target
**Recommended split:**
```
src/content/
├── index.tsx            # Entry point: message listener + init (~50 lines)
├── font-injection.ts    # injectFontStyles() + removeFontStyles() (~55 lines)
├── tts.ts               # readSelectedText() + stopReading() (~30 lines)
├── reading-ruler.ts     # enableReadingRuler() + disableReadingRuler() + handlers (~40 lines)
├── companion/
│   ├── detection.ts     # startTypingDetection(), startObservingTextField(), state vars (~90 lines)
│   ├── suggestions-ui.ts # showSpellingSuggestions() DOM creation (~75 lines)
│   ├── notification-ui.ts # showCompanionNotification() DOM creation (~45 lines)
│   └── word-ops.ts      # getCurrentWord() + replaceCurrentWord() helpers (~25 lines)
└── styles.css
```

**Example:**
```typescript
// src/content/font-injection.ts
export function injectFontStyles(fontFamily: string = 'OpenDyslexic', lineHeight: number = 1.6) {
  document.body.classList.add('dyslexia-tool-active')
  // ... existing font injection logic
}

export function removeFontStyles() {
  const style = document.getElementById('dyslexia-tool-styles')
  if (style) style.remove()
  document.body.classList.remove('dyslexia-tool-active')
}
```

### Pattern 2: Type-Safe Message Adoption
**What:** Replace raw `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage` with typed helper
**When to use:** All 12 untyped message call sites across 4 files

**Current state:** `messages.ts:95-104` defines `sendMessage<T>()` but it's never imported anywhere. The `MessageMap` interface has 11 message types, but background `index.ts` handles ~15 message types (including `START_RECORDING`, `STOP_RECORDING`, `SAVE_RECORDED_NOTE`, `GET_RECORDING_STATE`, `RECORDING_STATE_UPDATE` which are NOT in `MessageMap`).

**Required before adoption:**
1. Add missing message types to `MessageMap`: `START_RECORDING`, `STOP_RECORDING`, `SAVE_RECORDED_NOTE`, `GET_RECORDING_STATE`, `RECORDING_STATE_UPDATE`
2. Content script uses `chrome.tabs.sendMessage` (not `chrome.runtime.sendMessage`) — need a separate `sendTabMessage` helper
3. Some calls in `popup/App.tsx` use `chrome.tabs.sendMessage` — same issue

**Example:**
```typescript
// Extend MessageMap first
export interface MessageMap {
  // ... existing types ...
  'START_RECORDING': { payload: {}; response: { success: boolean; error?: string } }
  'STOP_RECORDING': { payload: {}; response: { success: boolean } }
  'SAVE_RECORDED_NOTE': {
    payload: { audioBase64: string; duration: number }
    response: { success: boolean; error?: string }
  }
  'GET_RECORDING_STATE': { payload: {}; response: { isRecording: boolean } }
  'RECORDING_STATE_UPDATE': { payload: { isRecording: boolean }; response: { success: boolean } }
}

// Add tab message helper
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
```

### Pattern 3: Onboarding Welcome Screen
**What:** 3-step tutorial in popup, shown on first install
**When to use:** New feature in Phase 3
**Implementation approach:**
- Detect first install via `chrome.runtime.onInstalled` → set flag in `chrome.storage.local`
- Popup checks flag on load → shows onboarding instead of main UI
- 3 steps with "Next" navigation + final "Try it now" CTA
- React component within existing popup architecture
- Accessible later via settings link

**Example:**
```typescript
// In popup App.tsx or separate Onboarding.tsx
const [showOnboarding, setShowOnboarding] = useState(false)

useEffect(() => {
  chrome.storage.local.get('onboardingComplete', (result) => {
    if (!result.onboardingComplete) setShowOnboarding(true)
  })
}, [])
```

### Pattern 4: CSP Graceful Degradation
**What:** Handle sites with strict Content Security Policy that blocks inline styles
**When to use:** Banking/government sites that block `style` attributes
**Approach:** The content script uses inline `element.style.cssText` for all UI injection. On CSP sites, this fails silently. Solution:
1. Detect CSP failure (try-catch around style injection)
2. Fall back to a CSS class-based approach using the existing `styles.css` (loaded via manifest)
3. Move critical inline styles to classes in `styles.css`
4. Add `!important` overrides for CSP-safe styling

### Anti-Patterns to Avoid
- **Don't split content script too fine:** 7+ files is overkill for 417 lines. Target 5-6 focused modules, not micro-modules
- **Don't refactor and add features simultaneously:** Complete content script split + dead code removal BEFORE adding onboarding or CSP handling
- **Don't add a routing library to popup:** The popup is a simple toggle UI. Onboarding is just a conditional render, not a route
- **Don't mock IndexedDB for storage tests:** Use `fake-indexeddb` or Dexie's test utilities for realistic storage tests
- **Don't use Playwright for extension E2E without proper setup:** Current Playwright config has no extension loading — tests are broken because they don't load the extension context

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chrome API mocking in tests | Custom mock objects | Existing `test/setup.ts` chrome mock pattern | Already works for 29 tests |
| Spelling suggestions | Custom dictionary | Existing `companion-utils.ts` with 260+ misspellings + Levenshtein fallback | Already battle-tested with 29 unit tests |
| Settings persistence | Custom save logic | Existing Zustand auto-save in `useSettings.ts` | Already working in options page |
| First-install detection | Complex install tracking | `chrome.storage.local` flag set on first popup open | Simple, reliable, survives updates |

**Key insight:** This codebase already has good patterns established. The debt is primarily organizational (monolithic files) and coverage (missing tests), not architectural.

## Common Pitfalls

### Pitfall 1: Content Script Module Split Breaks Initialization Order
**What goes wrong:** Module-level state (`let companionEnabled = true`, `let lastFullWord`, etc.) is shared across functions. Splitting into separate files breaks the shared closure.
**Why it happens:** All state in `content/index.tsx` is module-scoped, not passed between functions.
**How to avoid:** Either (a) create a shared state module that all companion modules import, or (b) use a simple class/object to hold companion state and pass it explicitly. Option (a) is simpler and matches current patterns.
**Warning signs:** Tests fail after split, or companion doesn't detect typing.

### Pitfall 2: MessageMap Is Incomplete
**What goes wrong:** The type-safe `sendMessage` helper only covers 11 of ~15 actual message types. Adopting it without completing `MessageMap` will cause TypeScript errors at call sites.
**Why it happens:** New message types were added during Phase 1 (recording) without updating `MessageMap`.
**How to avoid:** Audit ALL `switch` cases in `background/index.ts` (lines 167-223) and all `chrome.*.sendMessage` calls (12 locations). Add missing types to `MessageMap` BEFORE adopting the helper.
**Warning signs:** TypeScript compilation fails after adopting sendMessage helper.

### Pitfall 3: E2E Tests Can't Load Extension Context
**What goes wrong:** Current Playwright tests (`companion.spec.ts`) use `page.setContent()` which creates a plain HTML page without the extension's content script. Tests verify browser behavior, not extension behavior.
**Why it happens:** Playwright needs a special setup to load Chrome extensions — `browser.newContext()` with `--load-extension` flag, or use the `@anthropic/chrome-extension-test` pattern.
**How to avoid:** Either (a) fix Playwright config to load the extension properly (complex but correct), or (b) convert E2E tests to unit tests that test content script functions in isolation with jsdom (simpler, matches existing test patterns).
**Warning signs:** Tests pass but don't actually test extension functionality.

### Pitfall 4: CSP Detection False Positives
**What goes wrong:** Detecting CSP by catching style injection errors is fragile — some sites allow inline styles but block other resources.
**Why it happens:** CSP policies vary wildly. A site might allow `style-src 'unsafe-inline'` but block `font-src`.
**How to avoid:** Check `document.styleSheets` rules after injection — if CSS rules were applied, CSP allowed it. Don't rely solely on try-catch.
**Warning signs:** Companion UI appears but looks wrong on some banking sites.

### Pitfall 5: Onboarding Shows After Extension Updates
**What goes wrong:** `chrome.runtime.onInstalled` fires with reason `"update"` on every extension update, not just first install.
**Why it happens:** `onInstalled` has three reasons: `"install"`, `"update"`, `"chrome_update"`.
**How to avoid:** Use a `chrome.storage.local` flag set only on first popup open. Check the flag in popup, not in background. Never rely on `onInstalled` reason alone.
**Warning signs:** Onboarding re-appears after Chrome Web Store update.

### Pitfall 6: Performance Profiling Without Baselines
**What goes wrong:** Setting arbitrary targets (font injection <100ms, startup <500ms) without measuring current performance.
**Why it happens:** Targets from ROADMAP may already be met, or may be impossible on certain hardware.
**How to avoid:** Measure FIRST. Use `performance.now()` in content script init, use Chrome DevTools Performance tab on the popup. Record actual numbers before optimizing.
**Warning signs:** Spending time "optimizing" code that's already fast enough.

## Code Examples

### Companion State Module Pattern
```typescript
// src/content/companion/state.ts
export const companionState = {
  lastTypingTime: 0,
  backspaceCount: 0,
  companionEnabled: true,
  lastOfferTime: 0,
  lastFullWord: null as string | null,
  savedActiveElement: null as HTMLElement | null,
  currentTextField: null as HTMLElement | null,
  keydownHandler: null as ((e: KeyboardEvent) => void) | null,
  pauseCheckInterval: null as number | null,
}

export function resetCompanionState() {
  companionState.backspaceCount = 0
  companionState.lastOfferTime = 0
  companionState.lastFullWord = null
}
```

### Unit Test Pattern for Storage Operations
```typescript
// src/test/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { addNote, getNotes, deleteNote, getNotesCount } from '../background/storage'

describe('Note storage operations', () => {
  beforeEach(async () => {
    // fake-indexeddb/auto clears between tests
  })

  it('adds and retrieves a note', async () => {
    const id = await addNote({
      title: 'Test Note',
      audioBlob: new Blob(['fake audio'], { type: 'audio/webm' }),
      duration: 5.0,
      transcript: null,
      tags: [],
    })
    const notes = await getNotes(10)
    expect(notes).toHaveLength(1)
    expect(notes[0].id).toBe(id)
    expect(notes[0].title).toBe('Test Note')
  })
})
```

### First-Install Detection Pattern
```typescript
// In popup/App.tsx
const [showOnboarding, setShowOnboarding] = useState(false)
const [onboardingLoading, setOnboardingLoading] = useState(true)

useEffect(() => {
  chrome.storage.local.get('onboardingComplete', (result) => {
    setShowOnboarding(!result.onboardingComplete)
    setOnboardingLoading(false)
  })
}, [])

const completeOnboarding = async () => {
  await chrome.storage.local.set({ onboardingComplete: true })
  setShowOnboarding(false)
}
```

### CSP-Safe Style Injection Pattern
```typescript
// src/content/companion/suggestions-ui.ts
function injectStylesSafe(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): boolean {
  try {
    Object.assign(element.style, styles)
    // Verify the styles were actually applied
    return element.style.cssText.length > 0
  } catch {
    return false // CSP blocked inline styles
  }
}

// Fallback: use CSS classes from styles.css
function createCSPSafeElement(tag: string, className: string): HTMLElement {
  const el = document.createElement(tag)
  el.className = className
  return el
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Playwright extension testing via `--load-extension` | `playwright` + `browser.newContext()` with channel | 2024+ | Extension E2E testing still awkward — consider unit tests instead |
| Chrome Manifest V2 | Manifest V3 (in use) | 2023-2024 | Service workers, no persistent background pages |
| Tailwind CSS v3 config files | Tailwind CSS v4 CSS-first config | 2024-2025 | Already using v4 — no `tailwind.config.js` needed |
| `fake-indexeddb` for testing Dexie | `fake-indexeddb/auto` import | Ongoing | Simplest approach for Dexie unit tests |

**Deprecated/outdated:**
- `offscreen/index.ts` + `offscreen-html/index.html`: Legacy recording approach, replaced by popup-side recording in Phase 1. Consider dead code — but mic-permission page still exists too.
- `mic-permission/index.ts`: Another recording path. Popup recording is the primary path now. Both mic-permission and offscreen recording are likely dead code.

## Open Questions

1. **Are `offscreen/` and `mic-permission/` dead code?**
   - What we know: Phase 1 moved recording to popup-side MediaRecorder. `mic-permission/index.ts` still uses `chrome.runtime.sendMessage` with `SAVE_RECORDED_NOTE`, and background handles it.
   - What's unclear: Is mic-permission page still accessible from any UI? Is there a code path that opens it?
   - Recommendation: Search for any `chrome.tabs.create` or window.open pointing to mic-permission. If none found, both can be removed as dead code.

2. **What message types does the popup actually send to tabs?**
   - What we know: `COMPANION_SET_ENABLED`, `FONT_APPLY_SETTINGS`, `TTS_READ_SELECTION`, `READING_RULER_TOGGLE`, `COMPANION_SHOW_NOTIFICATION` — 5 message types sent to tabs from popup.
   - What's unclear: The `sendMessage` helper in `messages.ts` only wraps `chrome.runtime.sendMessage`. We need a parallel `sendTabMessage` helper for `chrome.tabs.sendMessage`.
   - Recommendation: Add a `sendTabMessage` helper alongside the existing `sendMessage` in `messages.ts`.

3. **What sensitivity tuning is needed for companion detection?**
   - What we know: Constants `SNOOZE_DURATION=300000` (5min), `PAUSE_THRESHOLD=10000` (10s), `BACKSPACE_THRESHOLD=3` are defined in `companion-utils.ts`.
   - What's unclear: No user feedback yet on whether these feel right. The `companionSensitivity` setting (1-10) exists in Settings type but isn't wired to any detection logic.
   - Recommendation: Wire `companionSensitivity` setting to dynamically adjust thresholds. Sensitivity 1 = lenient (5 backspaces, 15s pause), sensitivity 10 = aggressive (1 backspace, 5s pause).

4. **Chrome Web Store readiness requirements?**
   - What we know: Manifest V3, proper icons exist (16/48/128), permissions declared. Version is 0.1.0.
   - What's unclear: Whether screenshots, privacy policy URL, detailed description, and promotional tiles are needed.
   - Recommendation: Prepare 1280x800 screenshot, 440x280 small tile, privacy policy (analytics toggle already exists), and detailed description. Set version to 1.0.0 for store submission.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis — all source files read and analyzed
- `apps/extension/package.json` — dependency versions verified
- `apps/extension/manifest.json` — MV3 structure confirmed
- Chrome Extension MV3 docs — CSP handling, onInstalled API

### Secondary (MEDIUM confidence)
- Vitest 2 documentation — test patterns, fake-indexeddb compatibility
- Playwright extension testing patterns — confirmed E2E testing is awkward

### Tertiary (LOW confidence)
- Chrome Web Store submission requirements — checklist items may change

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, versions verified in package.json
- Architecture: HIGH - full codebase analyzed, 417-line content script is the primary target
- Pitfalls: HIGH - identified from direct code analysis (incomplete MessageMap, broken E2E, shared state in content script)
- Onboarding: MEDIUM - clear requirements from CONTEXT.md, implementation is straightforward React
- CSP handling: MEDIUM - known pattern, but site-specific testing needed
- Performance: LOW - no baseline measurements exist yet

**Research date:** 2026-04-12
**Valid until:** 2026-05-12
