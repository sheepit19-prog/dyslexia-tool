---
stepsCompleted:
  - step-01-validate-prerequisites
inputDocuments:
  - prd.md
  - architecture.md
workflowType: 'epics-and-stories'
project_name: 'dyslexia_tool_lean_mvp'
user_name: 'Berk'
date: '2026-03-17'
---

# dyslexia_tool_lean_mvp - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for dyslexia_tool_lean_mvp, decomposing the requirements from the PRD, Architecture into implementable stories ready for sprint execution.

**MVP Focus:** Phase 1 Chrome Extension with READ, WRITE, REMEMBER features
**Timeline:** 8-12 weeks to Chrome Web Store launch
**Total Stories:** 48 stories across 6 epics

---

## Requirements Inventory

### Functional Requirements (100 FRs)

**READ Features (FR1-10):**
- FR1: Users can activate dyslexia-friendly font rendering on any webpage
- FR2: Users can adjust line spacing between 1.0x and 2.0x
- FR3: Users can adjust letter spacing between normal and wide settings
- FR4: Users can apply reading assistance to the current site with a single click
- FR5: Users can toggle reading assistance on/off per domain
- FR6: Users can use text-to-speech for selected text on any webpage
- FR7: Users can control TTS playback (play, pause, stop)
- FR8: Users can access a visual reading guide/ruler while reading
- FR9: Users can customize which font is used (OpenDyslexic, system fonts)
- FR10: Users can see current reading assistance status in the extension popup

**WRITE Features (FR11-18):**
- FR11: Users can receive contextual writing help when typing in text fields
- FR12: Users can dismiss writing assistance offers with a single click
- FR13: Users can snooze writing assistance for a configurable duration
- FR14: Users can accept spelling suggestions when offered
- FR15: Users can view word suggestions for common misspellings
- FR16: Users can enable/disable companion mode entirely
- FR17: Users can see what triggered a writing assistance offer
- FR18: Users can provide feedback on writing assistance usefulness

**REMEMBER Features (FR19-28):**
- FR19: Users can capture voice notes using a keyboard shortcut
- FR20: Users can record audio for up to 5 minutes per note (free tier)
- FR21: Users can playback recorded voice notes
- FR22: Users can view a list of all saved notes
- FR23: Users can delete individual notes
- FR24: Users can see remaining note quota for the month (free tier)
- FR25: Users can export notes as audio files
- FR26: PRO Users can record unlimited voice notes (Phase 2)
- FR27: PRO Users can organize notes with folders and tags (Phase 2)
- FR28: PRO Users can search through note content (Phase 2)

**Companion Intelligence (FR29-36):**
- FR29: System can detect typing hesitation patterns (backspacing, pauses)
- FR30: System can offer contextual help based on detected struggle patterns
- FR31: System respects user preferences for help frequency
- FR32: System learns from user acceptance/rejection of help offers
- FR33: System can detect reading time on text-heavy pages
- FR34: System can offer reading assistance when fatigue is detected
- FR35: Users can adjust sensitivity of companion detection
- FR36: Users can view companion mode activity history

**Settings & Preferences (FR37-44):**
- FR37: Users can customize extension appearance (light/dark theme)
- FR38: Users can select accent color for UI elements
- FR39: Users can configure default TTS speed
- FR40: Users can set preferred reading font
- FR41: Users can configure default spacing preferences
- FR42: Users can manage site-specific preferences
- FR43: Users can reset all settings to defaults
- FR44: Users can export/import settings configuration

**Privacy & Security (FR53-60):**
- FR53: Users can view what data the extension accesses
- FR54: Users can disable analytics tracking
- FR55: Users can delete all locally stored data
- FR56: Users can operate in privacy mode (reduced features, no cloud)
- FR57: Users can view privacy policy and terms of service
- FR58: Users can report privacy concerns
- FR59: System processes voice data locally by default
- FR60: System does not transmit webpage content to external servers

**Extension Management (FR61-68):**
- FR61: Users can pin extension icon to browser toolbar
- FR62: Users can access extension via keyboard shortcut
- FR63: Users can view extension version and changelog
- FR64: Users can submit bug reports
- FR65: Users can request new features
- FR66: Users can rate and review extension in Chrome Web Store
- FR67: Users can disable extension on specific sites
- FR68: Users can temporarily disable all extension features

**User Onboarding (FR69-75):**
- FR69: Users can view onboarding tutorial on first install
- FR70: Users can skip onboarding and access features immediately
- FR71: Users can replay onboarding tutorial later
- FR72: Users can access help documentation
- FR73: Users can view keyboard shortcut reference
- FR74: Users can access FAQ and troubleshooting guides
- FR75: Users can contact support via email

**Analytics & Reporting (FR89-95):**
- FR89: System tracks anonymous feature usage metrics
- FR90: System tracks extension install/uninstall events
- FR91: System tracks PRO conversion events (Phase 2)
- FR92: Users can view personal usage statistics
- FR93: System generates daily/weekly/monthly usage reports
- FR94: System tracks error rates and crash reports
- FR95: System monitors performance metrics (load times, response times)

**Integration & Compatibility (FR96-100):**
- FR96: Extension works with major websites (Google Docs, Gmail, etc.)
- FR97: Extension handles Content Security Policy restrictions gracefully
- FR98: Extension is compatible with screen readers
- FR99: Extension supports keyboard-only navigation
- FR100: Extension respects user's browser zoom settings

### Non-Functional Requirements

**Performance:**
- NFR1: Extension cold start must complete within 500ms
- NFR2: Content script injection must complete within 100ms per page load
- NFR3: Font transformation must apply within 50ms after activation
- NFR4: TTS initiation must begin within 2 seconds of user trigger
- NFR5: Note capture interface must appear within 500ms of hotkey press
- NFR6: Service worker must consume less than 50MB RAM
- NFR7: Extension must not impact page load time by more than 100ms

**Security:**
- NFR8: All user data must be encrypted at rest using AES-256
- NFR9: Data transmission must use TLS 1.3 minimum
- NFR10: Voice recordings must be stored locally by default
- NFR11: Webpage content must not be transmitted to external servers
- NFR12: Extension must comply with GDPR data minimization principles

**Accessibility:**
- NFR13: All UI components must meet WCAG 2.1 Level AA standards
- NFR14: Extension must be fully operable via keyboard alone
- NFR15: All interactive elements must have descriptive labels for screen readers
- NFR16: Color contrast ratios must be minimum 4.5:1 for normal text
- NFR17: Extension UI must remain functional at 200% browser zoom

**Reliability:**
- NFR18: Core features must be available 99.5% of the time
- NFR19: Zero data loss tolerance for user notes and settings
- NFR20: Extension must recover from crashes without data loss
- NFR21: System must retry failed operations up to 3 times before failing

**Browser Compatibility:**
- NFR22: Full feature support on Chrome 90+
- NFR23: Full feature support on Edge 90+ (Chromium-based)
- NFR24: Graceful degradation on unsupported browsers

### Additional Requirements from Architecture

**Technical Stack:**
- CRXJS Vite Plugin for Chrome Extension build
- React 19.x + TypeScript 5.x
- Vite 7.x for builds with HMR
- Zustand 5.x for state management
- Tailwind CSS 4.x for styling
- Dexie.js for IndexedDB wrapper
- Vitest for unit testing
- Playwright for E2E testing

**Architecture Decisions:**
- Monorepo structure: apps/extension, apps/webapp, packages/shared
- Manifest V3 compliance (service workers, no remote code)
- IndexedDB for local storage (MVP, no cloud sync)
- No authentication system in MVP (deferred to Phase 2)
- Client-side companion detection only (no server API)
- Chrome Web Store distribution only (MVP)
- Typed message passing with MessageMap pattern
- Co-located tests (*.test.ts files)

**Implementation Patterns:**
- Message types: SCREAMING_SNAKE_CASE with domain prefix
- Storage keys: camelCase
- Components: PascalCase, named exports
- Error handling: try/catch at boundaries, graceful degradation
- TypeScript strict mode mandatory (no `any` without justification)

---

## FR Coverage Map

| Epic | Stories | FRs Covered | Coverage % |
|------|---------|-------------|------------|
| Epic 1: Extension Foundation | 6 | FR61-68, FR96-100 | 100% |
| Epic 2: READ Features | 8 | FR1-10 | 100% |
| Epic 3: REMEMBER Features | 8 | FR19-25, FR59-60 | 100% |
| Epic 4: Companion Intelligence | 10 | FR29-36 | 100% |
| Epic 5: Companion UI | 8 | FR11-18, FR37-44, FR53-58 | 100% |
| Epic 6: Polish & Launch | 8 | FR69-75, FR89-95 | 100% |
| **Total** | **48** | **100 FRs** | **100%** |

---

## Epic List

1. **Epic 1: Extension Foundation** - Project setup, build system, manifest configuration (6 stories)
2. **Epic 2: READ Features** - Font injection, spacing controls, TTS (8 stories)
3. **Epic 3: REMEMBER Features** - Voice note capture, storage, playback (8 stories)
4. **Epic 4: Companion Intelligence** - Typing/reading detection, intervention logic (10 stories)
5. **Epic 5: Companion UI** - Notifications, settings, user controls (8 stories)
6. **Epic 6: Polish & Launch** - Testing, accessibility, Chrome Web Store submission (8 stories)

---

## Epic 1: Extension Foundation

**Goal:** Establish the technical foundation with CRXJS build system, Manifest V3 configuration, and core infrastructure for the Chrome Extension.

**Definition of Done:**
- ✅ Extension builds successfully with CRXJS
- ✅ Service worker loads and responds to messages
- ✅ Content scripts inject on webpages
- ✅ Popup UI renders correctly
- ✅ IndexedDB storage operational
- ✅ Shared package configured and working

---

### Story 1.1: Initialize Extension Project

**As a** developer
**I want** a CRXJS-based Chrome Extension project structure
**So that** I can start implementing MVP features with proper build tooling

**Acceptance Criteria:**

**Given** a new Chrome Extension project is needed
**When** I run the initialization commands
**Then** a complete project structure is created with all required directories

**Given** the project is initialized
**When** I run `npm run dev`
**Then** Vite starts with CRXJS plugin and HMR enabled

**Given** the build completes
**When** I load the extension in Chrome
**Then** it appears in chrome://extensions without errors

**Technical Notes:**
```bash
# Commands to initialize
mkdir -p apps/extension/src/{background,content,popup,options,shared}
cd apps/extension
npm create vite@latest . -- --template react-ts
npm install -D @crxjs/vite-plugin
```

**FR Coverage:** FR61, FR62, FR96

**Estimated Effort:** 1 day

---

### Story 1.2: Manifest V3 Configuration

**As a** developer
**I want** a properly configured manifest.json
**So that** the extension complies with Chrome Web Store requirements

**Acceptance Criteria:**

**Given** the extension needs permissions
**When** manifest.json is configured
**Then** only minimal required permissions are requested (activeTab, storage)

**Given** content scripts are needed
**When** manifest defines content_scripts
**Then** matches pattern covers all HTTP/HTTPS sites

**Given** service worker is required
**When** background service_worker is defined
**Then** it points to the correct entry file

**Technical Notes:**
```json
{
  "manifest_version": 3,
  "name": "Dyslexia Tool",
  "version": "0.1.0",
  "permissions": ["activeTab", "storage"],
  "background": {
    "service_worker": "src/background/index.ts"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["src/content/index.tsx"]
  }],
  "action": {
    "default_popup": "popup/index.html"
  }
}
```

**FR Coverage:** FR61, FR96, FR97

**Estimated Effort:** 0.5 days

---

### Story 1.3: Service Worker Setup

**As a** developer
**I want** a service worker entry point with message routing
**So that** extension contexts can communicate

**Acceptance Criteria:**

**Given** the service worker is active
**When** a message is received
**Then** it routes to the correct handler based on message type

**Given** a message handler processes a request
**When** the operation completes
**Then** it sends a typed response back to the sender

**Given** an error occurs
**When** the handler catches it
**Then** it logs the error and returns a failure response

**Technical Notes:**
```typescript
// src/background/index.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Route based on message type
  switch (message.type) {
    case 'FONT_APPLY_SETTINGS':
      handleFontMessage(message, sender, sendResponse);
      break;
    case 'NOTE_CAPTURE_START':
      handleNoteMessage(message, sender, sendResponse);
      break;
  }
  return true; // Keep channel open for async response
});
```

**FR Coverage:** FR61, FR62

**Estimated Effort:** 1 day

---

### Story 1.4: Content Script Infrastructure

**As a** developer
**I want** a content script entry point with DOM access
**So that** I can inject font changes and detect user behavior

**Acceptance Criteria:**

**Given** a webpage loads
**When** the content script injects
**Then** it has access to the page DOM

**Given** the content script is active
**When** it needs to communicate with service worker
**Then** it can send typed messages via chrome.runtime.sendMessage

**Given** CSP restrictions exist on a site
**When** the script detects them
**Then** it gracefully handles the limitation

**Technical Notes:**
- Use isolated execution context
- Never access page JavaScript directly
- Handle CSP errors gracefully

**FR Coverage:** FR96, FR97, FR98

**Estimated Effort:** 1 day

---

### Story 1.5: Popup UI Foundation

**As a** developer
**I want** a functional extension popup
**So that** users can access quick settings and features

**Acceptance Criteria:**

**Given** user clicks extension icon
**When** popup opens
**Then** it renders React components without errors

**Given** popup needs state
**When** it mounts
**Then** it loads settings from storage

**Given** user interacts with popup
**When** they toggle a setting
**Then** it saves to storage and updates UI

**Technical Notes:**
- Use Zustand for popup state
- Load settings from IndexedDB on mount
- Popup size: 400x500px (Chrome default)

**FR Coverage:** FR10, FR61, FR62

**Estimated Effort:** 1.5 days

---

### Story 1.6: IndexedDB Storage Setup

**As a** developer
**I want** IndexedDB configured with Dexie.js
**So that** I can store notes and settings locally

**Acceptance Criteria:**

**Given** the extension needs persistent storage
**When** Dexie is initialized
**Then** it creates required object stores (settings, notes, analytics)

**Given** a note needs to be saved
**When** add() is called
**Then** it persists to IndexedDB with auto-generated ID

**Given** settings need to be retrieved
**When** get() is called
**Then** it returns the settings object or defaults

**Technical Notes:**
```typescript
// src/background/storage/indexedDB.ts
import Dexie from 'dexie';

export class DyslexiaDB extends Dexie {
  settings!: Dexie.Table<Settings, string>;
  notes!: Dexie.Table<Note, string>;
  analytics!: Dexie.Table<Analytics, string>;
  
  constructor() {
    super('DyslexiaDB');
    this.version(1).stores({
      settings: 'id',
      notes: 'id, createdAt',
      analytics: 'id, date'
    });
  }
}
```

**FR Coverage:** FR55, FR59, FR60

**Estimated Effort:** 1.5 days

---

## Epic 2: READ Features

**Goal:** Implement dyslexia-friendly reading assistance including font rendering, spacing controls, and text-to-speech functionality.

**Definition of Done:**
- ✅ OpenDyslexic font injects on any webpage
- ✅ Line/letter spacing controls work
- ✅ TTS reads selected text aloud
- ✅ Reading ruler/highlighting active
- ✅ Per-site preferences persist

---

### Story 2.1: Font Injection Engine

**As a** user with dyslexia
**I want** dyslexia-friendly fonts applied to any webpage
**So that** I can read text more easily

**Acceptance Criteria:**

**Given** I'm on any webpage
**When** I activate font rendering
**Then** OpenDyslexic font applies to all text within 100ms

**Given** font is applied
**When** I navigate to a new page
**Then** font automatically applies without manual re-activation

**Given** a site has CSP restrictions
**When** font injection fails
**Then** I see a notification with workaround instructions

**Technical Notes:**
- Inject @font-face with OpenDyslexic from extension package
- Use !important to override site styles
- Handle CSP errors with overlay mode fallback

**FR Coverage:** FR1, FR4, FR5, FR9

**Estimated Effort:** 2 days

---

### Story 2.2: Line Spacing Controls

**As a** user with dyslexia
**I want** to adjust line spacing
**So that** text is easier to track

**Acceptance Criteria:**

**Given** I'm reading a webpage
**When** I select 1.5x line spacing
**Then** all paragraphs increase line-height to 1.5

**Given** I select 2.0x spacing
**When** applied
**Then** line-height updates to 2.0 immediately

**Given** I change spacing
**When** I navigate to another page
**Then** my spacing preference persists

**FR Coverage:** FR2, FR4, FR5

**Estimated Effort:** 1 day

---

### Story 2.3: Letter Spacing Controls

**As a** user with dyslexia
**I want** to adjust letter spacing
**So that** characters are easier to distinguish

**Acceptance Criteria:**

**Given** text is displayed
**When** I select wide letter spacing
**Then** letter-spacing increases to 0.05em

**Given** I adjust spacing
**When** applied
**Then** change is visible within 50ms

**FR Coverage:** FR3, FR4

**Estimated Effort:** 1 day

---

### Story 2.4: Text-to-Speech Integration

**As a** user with dyslexia
**I want** selected text read aloud
**So that** I can comprehend better with audio support

**Acceptance Criteria:**

**Given** I've selected text on a webpage
**When** I trigger TTS
**Then** browser native Web Speech API reads the text

**Given** TTS is playing
**When** I click pause
**Then** audio stops and can resume from same position

**Given** TTS starts
**When** triggered
**Then** audio begins within 2 seconds

**FR Coverage:** FR6, FR7, FR39

**Estimated Effort:** 2 days

---

### Story 2.5: Reading Ruler/Highlight

**As a** user with dyslexia
**I want** a visual reading guide
**So that** I can track lines more easily

**Acceptance Criteria:**

**Given** I'm reading a long article
**When** I enable reading ruler
**Then** a highlighted bar follows my cursor/scroll position

**Given** ruler is active
**When** I scroll
**Then** highlight moves smoothly with viewport

**FR Coverage:** FR8

**Estimated Effort:** 1.5 days

---

### Story 2.6: Font Selection

**As a** user
**I want** to choose which font is used
**So that** I can find what works best for me

**Acceptance Criteria:**

**Given** multiple fonts are available
**When** I open settings
**Then** I can select from OpenDyslexic, Arial, Verdana, system default

**Given** I select a font
**When** saved
**Then** it applies immediately to all pages

**FR Coverage:** FR9, FR40

**Estimated Effort:** 1 day

---

### Story 2.7: Per-Site Preferences

**As a** user
**I want** different settings per website
**So that** I can optimize for each site's layout

**Acceptance Criteria:**

**Given** I'm on nytimes.com
**When** I set specific spacing for this site
**Then** it remembers and auto-applies on return visits

**Given** I visit a new site
**When** no preferences exist
**Then** it uses global defaults

**FR Coverage:** FR5, FR42

**Estimated Effort:** 1.5 days

---

### Story 2.8: READ Feature Settings UI

**As a** user
**I want** quick access to READ settings in popup
**So that** I can adjust reading preferences easily

**Acceptance Criteria:**

**Given** I open the popup
**When** I view READ section
**Then** I see font toggle, spacing controls, TTS button

**Given** I adjust a setting
**When** changed
**Then** it applies immediately and saves to storage

**FR Coverage:** FR4, FR10, FR37, FR41

**Estimated Effort:** 1.5 days

---

*(Continuing with Epics 3-6...)*

---

## Epic 3: REMEMBER Features

**Goal:** Implement voice note capture, local storage, and playback functionality for capturing thoughts without context switching.

**Definition of Done:**
- ✅ Voice notes captured via hotkey (Ctrl/Cmd+Shift+N)
- ✅ Notes stored in IndexedDB (50 note MVP limit)
- ✅ Playback functional
- ✅ Note list view in popup
- ✅ Export capability

---

### Story 3.1: Voice Note Capture

**As a** user with dyslexia
**I want** to capture voice notes instantly
**So that** I don't lose important thoughts while reading/writing

**Acceptance Criteria:**

**Given** I'm on any webpage
**When** I press Ctrl+Shift+N
**Then** voice recording starts within 500ms

**Given** recording is active
**When** I speak for up to 5 minutes
**Then** audio captures clearly

**Given** I finish speaking
**When** I press the hotkey again or click stop
**Then** recording saves to IndexedDB

**Technical Notes:**
- Use Web Speech API / MediaRecorder API
- Store as Blob in IndexedDB
- Show visual indicator while recording

**FR Coverage:** FR19, FR20

**Estimated Effort:** 2 days

---

### Story 3.2: Note Playback

**As a** user
**I want** to playback my recorded notes
**So that** I can review captured thoughts

**Acceptance Criteria:**

**Given** I have saved notes
**When** I open the notes list
**Then** I see all notes with title/date/duration

**Given** I click play on a note
**When** playback starts
**Then** audio plays through speakers

**Given** audio is playing
**When** I click pause
**Then** playback stops and can resume

**FR Coverage:** FR21, FR22

**Estimated Effort:** 1.5 days

---

### Story 3.3: Note Management

**As a** user
**I want** to manage my notes
**So that** I can organize and clean up old recordings

**Acceptance Criteria:**

**Given** I have notes saved
**When** I view the notes list
**Then** I can delete individual notes

**Given** I delete a note
**When** confirmed
**Then** it's removed from IndexedDB

**FR Coverage:** FR22, FR23

**Estimated Effort:** 1 day

---

### Story 3.4: Note Quota Display

**As a** free tier user
**I want** to see my remaining note quota
**So that** I know how many notes I can capture this month

**Acceptance Criteria:**

**Given** I'm on the notes page
**When** I view my quota
**Then** I see "X of 50 notes used this month"

**Given** I reach 50 notes
**When** I try to record another
**Then** I see a message about the limit

**FR Coverage:** FR24

**Estimated Effort:** 1 day

---

### Story 3.5: Note Export

**As a** user
**I want** to export my notes as audio files
**So that** I can backup or share them

**Acceptance Criteria:**

**Given** I have a note saved
**When** I click export
**Then** it downloads as .webm or .mp3 file

**Given** I export multiple notes
**When** selected
**Then** they download as a zip file

**FR Coverage:** FR25

**Estimated Effort:** 1.5 days

---

### Story 3.6: Note List UI

**As a** user
**I want** a clean note list interface in popup
**So that** I can quickly access my recent notes

**Acceptance Criteria:**

**Given** I open the popup
**When** I navigate to Notes tab
**Then** I see my 10 most recent notes

**Given** I want to see more
**When** I click "View All"
**Then** it opens full notes page

**FR Coverage:** FR22, FR10

**Estimated Effort:** 1.5 days

---

### Story 3.7: Recording Permissions

**As a** user
**I want** microphone access handled gracefully
**So that** I understand why it's needed

**Acceptance Criteria:**

**Given** I press the note capture hotkey
**When** microphone permission is not granted
**Then** I see a clear explanation popup

**Given** I deny permission
**When** declined
**Then** I see instructions to enable in Chrome settings

**FR Coverage:** FR53, FR57

**Estimated Effort:** 1 day

---

### Story 3.8: Voice Data Privacy

**As a** privacy-conscious user
**I want** assurance my voice data stays local
**So that** I trust the extension with sensitive information

**Acceptance Criteria:**

**Given** I record a note
**When** saved
**Then** it stores only in IndexedDB (no server upload)

**Given** I view privacy settings
**When** opened
**Then** I see clear statement: "Voice notes never leave your device"

**FR Coverage:** FR59, FR60, FR55

**Estimated Effort:** 0.5 days

---

## Epic 4: Companion Intelligence

**Goal:** Implement the "Invisible Companion" - real-time detection of typing struggles and reading fatigue with contextual intervention offers.

**Definition of Done:**
- ✅ Typing hesitation detection (backspacing, pauses)
- ✅ Reading fatigue detection (time-on-page)
- ✅ Contextual help offers
- ✅ User control (dismiss, snooze)
- ✅ Learning from user feedback

---

### Story 4.1: Typing Pattern Detection

**As a** user who struggles with spelling
**I want** the system to notice when I'm hesitating
**So that** it can offer help before I get frustrated

**Acceptance Criteria:**

**Given** I'm typing in a text field
**When** I backspace 3+ times in 10 seconds
**Then** the system detects a struggle pattern

**Given** I pause for 3+ seconds while typing
**When** detected
**Then** it flags as potential hesitation

**Given** I'm typing confidently
**When** no struggle detected
**Then** no intervention is offered

**Technical Notes:**
- Track backspace frequency in content script
- Measure pause duration between keystrokes
- Thresholds: 3+ backspaces OR 3+ second pause

**FR Coverage:** FR29, FR35

**Estimated Effort:** 2 days

---

### Story 4.2: Reading Fatigue Detection

**As a** user who gets tired reading long articles
**I want** the system to notice when I've been reading too long
**So that** it can suggest a break or read-aloud

**Acceptance Criteria:**

**Given** I'm on a text-heavy page
**When** I've spent 2+ minutes reading
**Then** the system detects extended reading time

**Given** I'm scrolling through dense text
**When** detected
**Then** it analyzes text density (>70% text content)

**FR Coverage:** FR33, FR35

**Estimated Effort:** 1.5 days

---

### Story 4.3: Contextual Help Offers

**As a** user struggling with writing
**I want** a subtle offer of help
**So that** I can accept assistance without feeling judged

**Acceptance Criteria:**

**Given** typing struggle detected
**When** confidence > threshold
**Then** a notification appears: "Need help wording this?"

**Given** the offer is shown
**When** I click it
**Then** it provides spelling/wording suggestions

**Given** reading fatigue detected
**When** threshold met
**Then** offer: "Want me to read this aloud?"

**Technical Notes:**
- Notification appears near text cursor
- Dismissible with single click
- Offers are contextual based on struggle type

**FR Coverage:** FR30, FR34

**Estimated Effort:** 2 days

---

### Story 4.4: Dismiss & Snooze Controls

**As a** user
**I want** to dismiss or snooze companion offers
**So that** I'm not interrupted when I don't need help

**Acceptance Criteria:**

**Given** a help offer appears
**When** I click dismiss
**Then** notification closes immediately

**Given** I dismiss an offer
**When** done
**Then** no new offers for 1 hour (snooze)

**Given** I want to adjust snooze duration
**When** in settings
**Then** I can set 30min, 1hr, 2hr, or 4hr

**FR Coverage:** FR12, FR13, FR31

**Estimated Effort:** 1.5 days

---

### Story 4.5: Companion Mode Toggle

**As a** user
**I want** to enable/disable companion mode
**So that** I control when it's active

**Acceptance Criteria:**

**Given** I open settings
**When** I toggle companion mode
**Then** detection stops/starts immediately

**Given** companion is disabled
**When** off
**Then** no interventions are offered

**Given** I re-enable it
**When** turned on
**Then** detection resumes

**FR Coverage:** FR16, FR31

**Estimated Effort:** 1 day

---

### Story 4.6: Acceptance Learning

**As a** user
**I want** the system to learn from my choices
**So that** it offers help at better times

**Acceptance Criteria:**

**Given** I accept a help offer
**When** recorded
**Then** system increases confidence for similar patterns

**Given** I dismiss multiple offers
**When** pattern detected
**Then** system reduces offer frequency

**FR Coverage:** FR32

**Estimated Effort:** 1.5 days

---

### Story 4.7: Struggle Type Identification

**As a** user
**I want** the system to understand what kind of struggle I'm having
**So that** it offers the right type of help

**Acceptance Criteria:**

**Given** I'm backspacing repeatedly
**When** detected
**Then** it identifies as "spelling uncertainty"

**Given** I'm pausing mid-sentence
**When** detected
**Then** it identifies as "wording difficulty"

**Given** I'm on a dense page for 5+ minutes
**When** detected
**Then** it identifies as "reading fatigue"

**FR Coverage:** FR17, FR29, FR33

**Estimated Effort:** 1.5 days

---

### Story 4.8: Intervention Timing

**As a** user
**I want** help offered at appropriate times
**So that** I'm not interrupted mid-thought

**Acceptance Criteria:**

**Given** I'm actively typing
**When** struggle detected
**Then** wait for natural pause before offering

**Given** I'm in a flow state
**When** rapid typing detected
**Then** delay intervention until pause

**FR Coverage:** FR30, FR31

**Estimated Effort:** 1.5 days

---

### Story 4.9: Companion Activity History

**As a** user
**I want** to see when companion helped me
**So that** I understand its value

**Acceptance Criteria:**

**Given** I've used companion mode
**When** I view activity history
**Then** I see a list of interventions (accepted/dismissed)

**Given** I view history
**When** opened
**Then** it shows date, type, and outcome

**FR Coverage:** FR36

**Estimated Effort:** 1 day

---

### Story 4.10: Detection Sensitivity Settings

**As a** user
**I want** to adjust how sensitive detection is
**So that** I get the right amount of intervention

**Acceptance Criteria:**

**Given** I open companion settings
**When** I adjust sensitivity
**Then** I can choose Low, Medium, or High

**Given** Low sensitivity selected
**When** active
**Then** only obvious struggles trigger offers

**Given** High sensitivity selected
**When** active
**Then** subtle struggles also trigger offers

**FR Coverage:** FR35

**Estimated Effort:** 1 day

---

## Epic 5: Companion UI

**Goal:** Create user-facing UI for companion notifications, settings management, and user controls.

**Definition of Done:**
- ✅ Companion notification component
- ✅ Settings pages complete
- ✅ Theme customization
- ✅ Privacy controls
- ✅ Help documentation

---

### Story 5.1: Companion Notification Component

**As a** user receiving help offers
**I want** a clean, non-intrusive notification
**So that** I don't feel judged or interrupted

**Acceptance Criteria:**

**Given** a struggle is detected
**When** notification appears
**Then** it's positioned near the text cursor

**Given** notification is shown
**When** displayed
**Then** it has warm, supportive messaging

**Given** I'm done with the notification
**When** I dismiss it
**Then** it fades smoothly without jarring animation

**Technical Notes:**
- Use Framer Motion for smooth animations
- Position with caret coordinates
- Auto-dismiss after 10 seconds

**FR Coverage:** FR30, FR12

**Estimated Effort:** 2 days

---

### Story 5.2: Notification Messaging

**As a** user
**I want** supportive, non-judgmental messaging
**So that** I feel helped not judged

**Acceptance Criteria:**

**Given** typing struggle detected
**When** offer shown
**Then** message: "Need help wording this?"

**Given** reading fatigue detected
**When** offer shown
**Then** message: "Want me to read this aloud?" or "Shall I summarize?"

**Given** I dismiss the offer
**When** done
**Then** no negative messaging

**FR Coverage:** FR30, FR34

**Estimated Effort:** 1 day

---

### Story 5.3: General Settings Page

**As a** user
**I want** a central settings page
**So that** I can customize the extension

**Acceptance Criteria:**

**Given** I open options page
**When** I view General tab
**Then** I see theme selector, accent color, font preferences

**Given** I change a setting
**When** saved
**Then** it applies immediately and persists

**FR Coverage:** FR37, FR38, FR40, FR41, FR43, FR44

**Estimated Effort:** 2 days

---

### Story 5.4: Companion Settings Page

**As a** user
**I want** dedicated companion settings
**So that** I can control intervention behavior

**Acceptance Criteria:**

**Given** I open Companion settings
**When** viewed
**Then** I see mode toggle, sensitivity, snooze duration

**Given** I adjust sensitivity
**When** changed
**Then** it takes effect immediately

**FR Coverage:** FR16, FR31, FR35, FR13

**Estimated Effort:** 1.5 days

---

### Story 5.5: Privacy Settings Page

**As a** privacy-conscious user
**I want** clear privacy controls
**So that** I trust the extension with my data

**Acceptance Criteria:**

**Given** I open Privacy settings
**When** viewed
**Then** I see analytics toggle, data deletion option

**Given** I click "Delete All Data"
**When** confirmed
**Then** all IndexedDB data is cleared

**Given** I disable analytics
**When** toggled off
**Then** no usage tracking occurs

**FR Coverage:** FR54, FR55, FR56, FR53, FR57, FR58

**Estimated Effort:** 1.5 days

---

### Story 5.6: Theme Customization

**As a** user
**I want** to customize the appearance
**So that** the extension feels personalized

**Acceptance Criteria:**

**Given** I open appearance settings
**When** I select dark theme
**Then** all UI components switch to dark mode

**Given** I select an accent color
**When** chosen
**Then** buttons/highlights use that color

**FR Coverage:** FR37, FR38

**Estimated Effort:** 1.5 days

---

### Story 5.7: Keyboard Shortcuts Reference

**As a** user
**I want** to see all keyboard shortcuts
**So that** I can use the extension efficiently

**Acceptance Criteria:**

**Given** I open help documentation
**When** I view shortcuts
**Then** I see: Ctrl+Shift+N (voice note), Ctrl+Shift+R (toggle reading), etc.

**Given** I want to customize shortcuts
**When** in settings (Phase 2)
**Then** I can remap them

**FR Coverage:** FR62, FR73

**Estimated Effort:** 1 day

---

### Story 5.8: Help Documentation

**As a** new user
**I want** accessible help documentation
**So that** I can learn how to use features

**Acceptance Criteria:**

**Given** I click Help
**When** opened
**Then** I see FAQ, troubleshooting guides, contact support

**Given** I have a question
**When** I search help
**Then** relevant articles appear

**FR Coverage:** FR72, FR74, FR75

**Estimated Effort:** 1.5 days

---

## Epic 6: Polish & Launch

**Goal:** Finalize the extension with comprehensive testing, accessibility validation, and Chrome Web Store submission preparation.

**Definition of Done:**
- ✅ All features tested (unit + E2E)
- ✅ Accessibility audit passed (WCAG 2.1 AA)
- ✅ Performance targets met
- ✅ Chrome Web Store listing ready
- ✅ Onboarding flow complete

---

### Story 6.1: Unit Test Suite

**As a** developer
**I want** comprehensive unit tests
**So that** I catch bugs before users do

**Acceptance Criteria:**

**Given** utility functions exist
**When** tests run
**Then** 80%+ code coverage achieved

**Given** a test fails
**When** CI runs
**Then** build is blocked

**FR Coverage:** FR94, FR95

**Estimated Effort:** 2 days

---

### Story 6.2: E2E Test Suite

**As a** developer
**I want** end-to-end tests for critical flows
**So that** user journeys work correctly

**Acceptance Criteria:**

**Given** critical user flows exist
**When** E2E tests run
**Then** font injection, note capture, companion mode all pass

**Given** a regression introduced
**When** tests run
**Then** failure is detected

**Technical Notes:**
- Use Playwright for browser automation
- Test in Chrome and Edge

**FR Coverage:** FR94, FR95

**Estimated Effort:** 2 days

---

### Story 6.3: Accessibility Audit

**As a** user with disabilities
**I want** the extension fully accessible
**So that** I can use all features independently

**Acceptance Criteria:**

**Given** WCAG 2.1 AA compliance required
**When** audit run with axe-core
**Then** zero critical violations

**Given** screen reader user needs
**When** tested with NVDA/JAWS
**Then** all features navigable

**Given** keyboard-only user needs
**When** tested
**Then** all features accessible without mouse

**FR Coverage:** FR98, FR99, NFR13-17

**Estimated Effort:** 2 days

---

### Story 6.4: Performance Optimization

**As a** user
**I want** the extension to be fast
**So that** it doesn't slow down my browsing

**Acceptance Criteria:**

**Given** performance targets defined
**When** profiling run
**Then** extension start <500ms, font injection <100ms

**Given** memory usage monitored
**When** measured
**Then** service worker <50MB RAM

**FR Coverage:** NFR1-7

**Estimated Effort:** 2 days

---

### Story 6.5: Onboarding Tutorial

**As a** new user
**I want** a quick onboarding tutorial
**So that** I understand how to use the extension

**Acceptance Criteria:**

**Given** I install the extension
**When** first opened
**Then** I see a 3-step welcome tour

**Given** I'm viewing the tutorial
**When** completed
**Then** I can skip or replay anytime

**Given** I skip onboarding
**When** done
**Then** I can still access all features

**FR Coverage:** FR69, FR70, FR71

**Estimated Effort:** 2 days

---

### Story 6.6: Chrome Web Store Listing

**As a** potential user
**I want** a compelling store listing
**So that** I understand the value and install

**Acceptance Criteria:**

**Given** Chrome Web Store submission
**When** listing viewed
**Then** it has screenshots, description, privacy policy

**Given** screenshots needed
**When** created
**Then** they show key features (font injection, companion, notes)

**Given** privacy policy required
**When** published
**Then** it's accessible from store listing

**FR Coverage:** FR66, FR57

**Estimated Effort:** 1.5 days

---

### Story 6.7: Bug Reporting System

**As a** user who encounters a bug
**I want** an easy way to report it
**So that** it can be fixed

**Acceptance Criteria:**

**Given** I find a bug
**When** I click "Report Bug"
**Then** a form opens with auto-filled extension version, browser info

**Given** I submit a report
**When** sent
**Then** it goes to the support team

**FR Coverage:** FR64

**Estimated Effort:** 1 day

---

### Story 6.8: Launch Preparation

**As a** developer
**I want** everything ready for launch
**So that** submission goes smoothly

**Acceptance Criteria:**

**Given** launch checklist exists
**When** all items checked
**Then** ready for Chrome Web Store submission

**Given** submission package needed
**When** built
**Then** zip file ready with manifest, assets, metadata

**Given** review process starts
**When** submitted
**Then** tracking for approval (1-7 days)

**FR Coverage:** FR63, FR66

**Estimated Effort:** 1 day

---

## Sprint Planning Summary

**Total Stories:** 48 stories across 6 epics

**Effort Estimation Summary:**

| Epic | Stories | Total Days | Priority |
|------|---------|------------|----------|
| Epic 1: Extension Foundation | 6 | 6.5 days | P0 (Must do first) |
| Epic 2: READ Features | 8 | 11.5 days | P0 (Core MVP) |
| Epic 3: REMEMBER Features | 8 | 10 days | P1 (Core MVP) |
| Epic 4: Companion Intelligence | 10 | 15 days | P1 (Key differentiator) |
| Epic 5: Companion UI | 8 | 12 days | P1 (Enabler) |
| Epic 6: Polish & Launch | 8 | 13 days | P0 (Required for launch) |
| **Total** | **48** | **~68 days** | |

**Recommended Sprint Breakdown (2-week sprints):**

**Sprint 1:** Epic 1 (Stories 1.1-1.6) + Epic 2 Story 2.1
**Sprint 2:** Epic 2 (Stories 2.2-2.8)
**Sprint 3:** Epic 3 (Stories 3.1-3.8)
**Sprint 4:** Epic 4 (Stories 4.1-4.7)
**Sprint 5:** Epic 4 (Stories 4.8-4.10) + Epic 5 (5.1-5.2)
**Sprint 6:** Epic 5 (Stories 5.3-5.8)
**Sprint 7:** Epic 6 (Stories 6.1-6.4)
**Sprint 8:** Epic 6 (Stories 6.5-6.8) + Buffer

**Total Timeline:** 16 weeks (8 sprints × 2 weeks) = ~4 months to launch

**MVP Launch Readiness:** All 48 stories complete, Chrome Web Store submission ready

---

## Next Steps

1. **Prioritize stories** in sprint planning tool (Jira, Linear, GitHub Projects)
2. **Assign story points** based on team velocity
3. **Create GitHub issues** for each story with acceptance criteria
4. **Begin Sprint 1** with Story 1.1 (Initialize Extension Project)

**Ready for implementation!** 🚀
