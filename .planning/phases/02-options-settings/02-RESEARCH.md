# Phase 2: Options Page & Settings - Research

**Researched:** 2026-04-11
**Domain:** Chrome Extension Options Page (MV3) with React + Tailwind v4
**Confidence:** HIGH

## Summary

This phase replaces the placeholder options page (`src/options/main.tsx`, 19 lines) with a full sidebar-navigated settings UI. The codebase already has the entry point wired: `manifest.json` declares `"options_page": "options/index.html"`, Vite config includes it as a build input, and `@crxjs/vite-plugin` handles the Chrome extension bundling. The existing storage layer (Dexie/IndexedDB at `src/background/storage/index.ts`) already has `getSettings`, `saveSettings`, `getSitePreference`, `saveSitePreference` functions ready to use.

**Critical pre-existing issue:** The popup stores settings in `chrome.storage.local` (line 95 of `popup/App.tsx`) while the background stores in IndexedDB via Dexie. The options page should consolidate to use IndexedDB directly (same pattern as popup's note access), avoiding the dual-write inconsistency. The popup's direct `chrome.storage.local` reads/writes for settings should be refactored as part of this phase or tracked as debt.

**Primary recommendation:** Build the options page as React components using existing Tailwind v4 setup, reading/writing settings directly via Dexie (import from `background/storage`), with sidebar navigation pattern and auto-save via debounced writes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Sidebar navigation pattern — category links on left, content area on right
- Spacious density — generous spacing, clear labels and descriptions (accessibility-friendly for dyslexic users)
- Category order (most-used first): General → Companion → Notes → Hotkeys → Per-Site → Privacy
- Auto-save — changes apply immediately, no save button needed
- Per-site: Card list display — each site as a card showing domain + its overrides, click to expand/edit
- Per-site: Add overrides from popup — "Customize for this site" button in popup creates the override, then edit in options page
- Per-site: Visual settings only can be overridden per-site: font, spacing, theme (not companion behavior or hotkeys)
- Per-site: Removal: both individual override reset per setting + full site removal
- Single "Export my data" button that downloads a JSON file
- Delete requires typing "DELETE" to confirm
- Nuclear delete only — one "Delete all data" button
- Storage usage shown with breakdown by category
- Hotkeys: View-only reference — no in-app rebinding, just display current shortcuts
- Hotkeys: Table layout: Action name | Keyboard shortcut
- Hotkeys: Link to Chrome's native shortcut editor with brief instructions
- Unconfigured shortcuts show a muted "Not set" badge

### Claude's Discretion
- Exact sidebar styling and responsive behavior
- Auto-save feedback (toast, subtle indicator, etc.)
- Empty state for per-site preferences (no overrides yet)
- Storage breakdown visual format (progress bars, plain text, etc.)
- Card interaction details (hover states, expand/collapse animation)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.0.0 | UI components | Already installed, used by popup |
| Tailwind CSS | ^4.0.0 | Styling | Already installed, configured in options/index.css |
| Dexie | ^4.0.0 | IndexedDB wrapper | Already installed, all storage ops use it |
| Zustand | ^5.0.0 | State management | Already installed but unused — good fit for options page settings state |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @crxjs/vite-plugin | ^2.0.0 | Chrome extension bundling | Already handles options page entry |
| @vitejs/plugin-react | ^4.0.0 | React Fast Refresh | Already configured |
| vitest | ^2.0.0 | Unit testing | Already configured, 29 tests passing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand for settings state | React useState + context | Zustand simpler for this use case — single store with auto-persist |
| Dexie direct import | Chrome messaging to background | Direct Dexie is the established pattern (popup already does this for notes) |

**Installation:** No new packages needed — everything is already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/options/
├── main.tsx              # Entry point (already exists, replace content)
├── index.css             # Tailwind imports (already exists)
├── App.tsx               # Root component with sidebar + content layout
├── components/
│   ├── Sidebar.tsx       # Category navigation
│   ├── GeneralSettings.tsx
│   ├── CompanionSettings.tsx
│   ├── NotesSettings.tsx
│   ├── HotkeysSettings.tsx
│   ├── PerSiteSettings.tsx
│   ├── PrivacySettings.tsx
│   └── ui/
│       ├── Toggle.tsx    # Reusable toggle switch
│       ├── Slider.tsx    # Reusable range slider
│       ├── Select.tsx    # Reusable dropdown
│       └── Toast.tsx     # Auto-save feedback
└── hooks/
    └── useSettings.ts    # Hook wrapping Dexie + Zustand
```

### Pattern 1: Direct Dexie Access from Options Page
**What:** Import storage functions directly from `../background/storage` — same pattern popup uses for notes.
**When to use:** All options page reads/writes to IndexedDB.
**Example:**
```typescript
import { getSettings, saveSettings } from '../background/storage'

export async function loadSettings(): Promise<Settings> {
  const settings = await getSettings()
  return settings || DEFAULT_SETTINGS
}

export async function updateSetting<K extends keyof Settings>(
  key: K, 
  value: Settings[K]
): Promise<void> {
  await saveSettings({ [key]: value } as Partial<Settings>)
}
```
Source: Existing codebase pattern — `popup/App.tsx:6` imports directly from storage.

### Pattern 2: Auto-Save with Debounce
**What:** onChange handlers write to IndexedDB immediately (no save button), with visual feedback.
**When to use:** Every settings control.
**Example:**
```typescript
const handleChange = async (key: keyof Settings, value: any) => {
  setSettings(prev => ({ ...prev, [key]: value }))
  setSaveStatus('saving')
  await saveSettings({ [key]: value } as Partial<Settings>)
  setSaveStatus('saved')
  setTimeout(() => setSaveStatus('idle'), 2000)
}
```

### Pattern 3: chrome.commands.getAll() for Hotkey Display
**What:** Read registered commands and their current shortcuts.
**When to use:** Hotkeys settings section.
**Example:**
```typescript
const [commands, setCommands] = useState<chrome.commands.Command[]>([])

useEffect(() => {
  chrome.commands.getAll((cmds) => setCommands(cmds))
}, [])
```
Source: Chrome Extensions API docs — `chrome.commands.getAll()` returns all registered commands.

### Anti-Patterns to Avoid
- **Don't use chrome.storage.local for settings**: The popup currently does this, creating dual-write inconsistency. Options page should use Dexie exclusively. Popup refactoring is separate work.
- **Don't build custom hotkey rebinding**: Chrome doesn't allow extensions to rebind shortcuts programmatically. Delegate to `chrome://extensions/shortcuts`.
- **Don't use embedded options (options_ui)**: Manifest already declares `options_page` (full page), which gives full tab space. Don't switch to embedded — more restrictive.
- **Don't add a save button**: User decision is auto-save only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Settings persistence | Custom storage adapter | Dexie `saveSettings()`/`getSettings()` | Already exists, handles defaults |
| Per-site preferences | New CRUD layer | Dexie `saveSitePreference()`/`getSitePreference()` | Already exists |
| Hotkey shortcut display | Manual manifest parsing | `chrome.commands.getAll()` | Handles user-customized bindings, edge cases |
| Data export | Custom serializer | `JSON.stringify()` + `URL.createObjectURL()` + download | Simple, no edge cases |
| IndexedDB size estimation | Per-record measurement | Dexie `table.count()` for item counts, estimate per type | `chrome.storage.local.getBytesInUse()` doesn't cover IndexedDB |

**Key insight:** The storage layer is already built. This phase is primarily UI work — wiring existing functions to new React components.

## Common Pitfalls

### Pitfall 1: Dual Storage Inconsistency
**What goes wrong:** Popup reads/writes `chrome.storage.local` for settings. Options page writes to IndexedDB. Changes don't sync.
**Why it happens:** Two different storage mechanisms for the same data — popup was written before Dexie was introduced.
**How to avoid:** Options page uses Dexie directly. Document the popup's `chrome.storage.local` usage as tech debt for Phase 3, OR fix popup to also use Dexie (same pattern as notes). The options page should NOT introduce a third storage path.
**Warning signs:** Settings changed in options not reflected in popup, or vice versa.

### Pitfall 2: Per-Site Override Type Mismatch
**What goes wrong:** CONTEXT.md says "visual settings only" (font, spacing, theme), but `SitePreference` type includes `companionEnabled`.
**Why it happens:** Type was defined before the user decision was made.
**How to avoid:** Either update `SitePreference` type to remove `companionEnabled` (and add `theme`), or constrain the options UI to only show visual settings regardless of what the type allows. Recommend: update the type to match the decision.
**Warning signs:** UI shows companion toggle in per-site settings when it shouldn't.

### Pitfall 3: Missing `commands` in Manifest
**What goes wrong:** `chrome.commands.getAll()` returns empty array because no commands are declared in manifest.
**Why it happens:** The manifest doesn't have a `"commands"` section yet — hotkeys were never configured.
**How to avoid:** Add `"commands"` section to manifest.json with suggested keys and descriptions for extension actions (toggle font, read aloud, toggle companion, etc.).
**Warning signs:** Hotkeys page shows "No shortcuts configured" even after adding commands section.

### Pitfall 4: Delete Confirmation Input Focus
**What goes wrong:** Typing "DELETE" confirmation is awkward if input loses focus, or if case sensitivity confuses users.
**Why it happens:** Modal/overlay patterns can steal focus; dyslexic users may struggle with exact text matching.
**How to avoid:** Case-insensitive comparison, auto-focus the input, clear visual feedback. Consider showing the typed text matching progress (e.g., "DEL..." → "DELET..." → "DELETE ✓").
**Warning signs:** Users report inability to confirm deletion.

### Pitfall 5: IndexedDB Size Estimation
**What goes wrong:** No direct API to get IndexedDB usage per table in Chrome extensions.
**Why it happens:** `chrome.storage.local.getBytesInUse()` only measures chrome.storage, not IndexedDB.
**How to avoid:** Use Dexie `table.count()` for item counts, estimate bytes per item type (notes with audio are large, settings are small). For precise measurement, iterate records — but this is expensive. Recommend: show item counts per category + total estimated size.
**Warning signs:** Storage display shows 0 bytes or wildly inaccurate numbers.

## Code Examples

### Auto-Save Settings Hook Pattern
```typescript
// src/options/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react'
import { getSettings, saveSettings } from '../../background/storage'
import type { Settings } from '../../shared/types/storage'

const DEFAULT_SETTINGS: Settings = {
  id: 'global',
  fontEnabled: false,
  fontFamily: 'OpenDyslexic',
  lineSpacing: 1.6,
  letterSpacing: 0.05,
  companionMode: 'proactive',
  companionSensitivity: 5,
  theme: 'light',
  accentColor: '#3B82F6',
  ttsSpeed: 1.0,
  analyticsEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s || DEFAULT_SETTINGS)
      setLoading(false)
    })
  }, [])

  const update = useCallback(async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    setSaveStatus('saving')
    try {
      await saveSettings({ [key]: value } as Partial<Settings>)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }, [settings])

  return { settings, loading, saveStatus, update }
}
```
Source: Based on existing `popup/App.tsx` pattern + Dexie storage layer.

### Data Export Pattern
```typescript
const exportData = async () => {
  const db = getDB()
  const [settings, notes, sitePrefs, analytics] = await Promise.all([
    db.settings.toArray(),
    db.notes.toArray(),
    db.sitePreferences.toArray(),
    db.analytics.toArray()
  ])
  
  // Strip audio blobs for export (too large for JSON)
  const exportNotes = notes.map(({ audioBlob, ...rest }) => rest)
  
  const data = {
    exportDate: new Date().toISOString(),
    version: '0.1.0',
    settings,
    notes: exportNotes,
    sitePreferences: sitePrefs,
    analytics
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dyslexia-tool-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```
Source: Standard web download pattern + existing Dexie DB instance.

### Hotkeys Display Pattern
```typescript
const HotkeysSettings = () => {
  const [commands, setCommands] = useState<chrome.commands.Command[]>([])

  useEffect(() => {
    chrome.commands.getAll((cmds) => setCommands(cmds))
  }, [])

  return (
    <div>
      <table>
        <thead>
          <tr><th>Action</th><th>Shortcut</th></tr>
        </thead>
        <tbody>
          {commands.map(cmd => (
            <tr key={cmd.name}>
              <td>{cmd.description || cmd.name}</td>
              <td>
                {cmd.shortcut 
                  ? <kbd>{cmd.shortcut}</kbd>
                  : <span className="text-gray-400">Not set</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        To change shortcuts, open{' '}
        <a href="chrome://extensions/shortcuts">Chrome's extension shortcuts page</a>.
      </p>
    </div>
  )
}
```
Source: Chrome Extensions `chrome.commands` API documentation.

### Nuclear Delete with Confirmation Pattern
```typescript
const [deleteInput, setDeleteInput] = useState('')
const [showDelete, setShowDelete] = useState(false)

const handleDeleteAll = async () => {
  if (deleteInput.toUpperCase() !== 'DELETE') return
  
  const db = getDB()
  await Promise.all([
    db.settings.clear(),
    db.notes.clear(),
    db.sitePreferences.clear(),
    db.analytics.clear()
  ])
  await initializeStorage() // Re-initialize with defaults
  window.location.reload()
}
```
Source: Dexie `table.clear()` API + existing `initializeStorage()`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `options_ui` embedded in chrome://extensions | `options_page` full tab | Manifest V3 standard | Full page layout available — use it |
| Chrome MV2 `commands` | Same API in MV3 | Stable | `chrome.commands.getAll()` works identically |
| Tailwind v3 config file | Tailwind v4 CSS-first config | 2024 | No `tailwind.config.js` needed — `@tailwind` directives in CSS |
| React 18 | React 19 | 2024 | Same patterns, slightly improved types |
| Dexie 3 | Dexie 4 | 2024 | Same API, better TypeScript support |

**Deprecated/outdated:**
- `options_ui` with `open_in_tab: false` (embedded): Not recommended for complex settings — too restrictive in sizing
- `chrome.storage.local` for settings when Dexie is available: Dual-write creates inconsistency

## Open Questions

1. **Popup ↔ Options storage sync**
   - What we know: Popup uses `chrome.storage.local` for settings, background/options will use IndexedDB
   - What's unclear: Should popup be refactored to use Dexie in this phase or deferred?
   - Recommendation: Fix in this phase if straightforward (popup already imports from `background/storage` for notes), otherwise document as Phase 3 debt

2. **SitePreference type vs CONTEXT.md constraint**
   - What we know: Type has `companionEnabled`, decision says visual-only overrides
   - What's unclear: Whether to update the type or just the UI
   - Recommendation: Update the `SitePreference` type — add `theme` field, remove `companionEnabled`. Type should match user decision.

3. **Audio blob export strategy**
   - What we know: Audio blobs are stored in IndexedDB, can be large
   - What's unclear: Whether to include audio in export (could be very large) or just metadata
   - Recommendation: Export note metadata only (title, duration, transcript, tags, dates). Audio blobs make exports impractically large. Note this in the export file.

4. **Which commands to register in manifest**
   - What we know: No commands section exists yet
   - What's unclear: Which actions should have suggested shortcuts
   - Recommendation: Register commands for: toggle font, read aloud, toggle companion, toggle reading ruler. Use Ctrl+Shift modifier combinations.

5. **IndexedDB size estimation accuracy**
   - What we know: No API gives per-table byte usage for IndexedDB
   - What's unclear: How precise the storage breakdown needs to be
   - Recommendation: Show item counts per category (notes: 12 items, site preferences: 3, etc.) plus estimate bytes using average sizes. Good enough for user awareness without expensive iteration.

## Sources

### Primary (HIGH confidence)
- Chrome Extensions API docs — `chrome.commands.getAll()`, `chrome.storage`, options page documentation
- Existing codebase: `src/background/storage/index.ts`, `src/options/main.tsx`, `src/popup/App.tsx`, `src/shared/types/storage.ts`
- `manifest.json` — confirmed `options_page` declaration, MV3, existing permissions

### Secondary (MEDIUM confidence)
- Tailwind v4 CSS-first configuration (verified via existing `index.css` with `@tailwind` directives)
- Dexie 4 API patterns (verified via existing storage layer usage)

### Tertiary (LOW confidence)
- IndexedDB per-table size estimation approach — no official API, common workaround pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and used in codebase
- Architecture: HIGH — patterns established by existing popup and storage code
- Pitfalls: HIGH — dual storage issue and type mismatch directly observed in codebase

**Research date:** 2026-04-11
**Valid until:** 2026-05-11
