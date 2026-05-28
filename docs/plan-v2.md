# Dyslexia Tool v2 - Action Plan

**Goal:** Turn a 3-user Chrome extension into a real product with 100+ organic users and a path to monetization.

**Constraints:** Solo dev, bootstrapped, no budget, targeting $500-2K/mo side income.

---

## Phase 1: Kill Companion & Clean Up (Week 1)

### 1.1 Remove companion code
- Delete `src/content/companion/` directory (detection.ts, notification-ui.ts, state.ts, suggestions-ui.ts, word-ops-ui.ts)
- Remove companion imports from `src/content/index.tsx`
- Remove companion message handlers from content script
- Remove companion toggle from popup UI (`App.tsx`)
- Remove companion-related settings from `DEFAULT_SETTINGS` and types
- Remove `toggle-companion` keyboard shortcut from manifest.json

### 1.2 Update popup UI
- Remove Companion Mode section
- Keep: Dyslexia Font, Read Aloud, Reading Ruler, Voice Notes
- Add placeholder sections for incoming features (Bionic Reading, Spelling Help)

### 1.3 Version bump
- manifest.json: 1.0.0 → 1.1.0
- Update description to focus on what works: "Free dyslexia reading & writing tools — bionic reading, font changes, text-to-speech, and more."

---

## Phase 2: Bionic Reading - First New Feature (Weeks 2-3)

### Why first
- Most visual, screenshot-friendly feature
- Proven demand (Half Bold extension: 4.8 stars)
- Fastest to build (text manipulation, no APIs)
- Best marketing tool for Chrome Store

### What to build
**Module: `src/content/bionic-reading.ts`**
- Walk all text nodes in the page
- For each word, bold the first ~40-50% of characters
- Use `<span style="font-weight:bold">` wrapping (same approach as Half Bold)
- Exclude: code blocks, input fields, already-bold text, short words (<3 chars)

**Popup toggle:**
- Add "Bionic Reading" toggle in popup (same UI pattern as font toggle)
- Send `BIONIC_READING_TOGGLE` message to content script
- Store preference in chrome.storage.local

**Settings:**
- Bold percentage slider (30-60%, default 45%)
- Per-site persistence (remember which sites have it on/off)

### Keyboard shortcut
- Add to manifest.json commands: "Ctrl+Shift+B" for toggle bionic reading

---

## Phase 3: Chrome Web Store Overhaul (Week 3)

### Why before writing features
- Zero organic users = no one sees new features anyway
- Store listing must convert before features matter

### What to do
1. **New title:** "Dyslexia Tool - Bionic Reading & TTS" (more keyword-rich)
2. **New description:** Lead with bionic reading. Mention free, no signup, works everywhere.
3. **4 new screenshots:** Show bionic reading before/after, font toggle, TTS, reading ruler. Add text overlays explaining each feature.
4. **Category:** Keep accessibility, add relevant keywords
5. **Detailed description:**
   ```
   Free dyslexia reading & writing companion.
   
   FEATURES:
   - Bionic Reading - bold first half of words for faster reading
   - OpenDyslexic Font - proven dyslexia-friendly font on any page
   - Text-to-Speech - read any selected text aloud
   - Reading Ruler - focus on one line at a time
   - Voice Notes - capture thoughts without typing (Ctrl+Shift+N)
   
   Built for my girlfriend who has dyslexia. Free, no signup, works offline.
   ```

---

## Phase 4: Get First 100 Users (Weeks 3-5)

### Priority order
1. **Reddit r/dyslexia** (40K members) - Post: "I built a free Chrome extension for my dyslexic girlfriend. It adds bionic reading to any webpage. She uses it daily."
2. **Reddit r/ADHD** (1.8M members) - Bionic reading helps ADHD too. Same framing.
3. **Reddit r/EdTech, r/teaching** - Teachers recommend tools to students
4. **Facebook dyslexia support groups** - Parents looking for tools for kids
5. **Product Hunt launch** - "Free dyslexia Chrome extension with bionic reading"
6. **Hacker News Show HN** - "Show HN: I built a free Chrome extension for dyslexic readers"

### Each post should include
- The girlfriend story (authentic, relatable)
- Before/after screenshot of bionic reading
- Link to Chrome Web Store
- "It's free, no signup required"

### Ask early users for Chrome Store reviews
- Add a gentle "Enjoying Dyslexia Tool? ⭐ Review on Chrome Store" link in popup
- Reviews = social proof = more organic installs

---

## Phase 5: Dyslexic Spelling Correction (Weeks 5-8)

### What to build
**Module: `src/content/spelling/`**

#### 5.1 Dyslexic error dictionary
Build a rule engine that catches common dyslexic patterns:
- Letter reversals: b↔d, p↔q, m↔w
- Phonetic substitutions: "definately" → "definitely", "recieve" → "receive"
- Transpositions: "teh" → "the", "from" → "form"
- Missing/doubled letters: "occured" → "occurred", "tommorow" → "tomorrow"
- Homophone confusion: "there/their/they're", "your/you're"

Source: compile from dyslexia research papers, common error lists, and Ghotit's documented patterns.

#### 5.2 Text input monitoring
- Listen to `input` and `keyup` events on `textarea`, `input[type=text]`, `[contenteditable]`
- Detect word boundaries (space, punctuation)
- Check current word + previous 2 words for context
- Debounce: check 300ms after user stops typing

#### 5.3 Inline suggestions
- Underline detected errors with a dotted red line (different from Chrome's built-in spellcheck which uses solid red)
- Small popup on click/hover with correction suggestion
- One click to accept correction
- UI styled to be non-judgmental (soft colors, friendly icons)

#### 5.4 Popup UI
- Add "Spelling Help" toggle in popup
- Show count of corrections made today
- Settings: sensitivity level, custom word list (add words to ignore)

---

## Phase 6: Voice-to-Text Writing (Weeks 7-9)

### What to build
**Module: `src/content/voice-input.ts`**

- Use Web Speech API `SpeechRecognition` (already in codebase for TTS)
- Add microphone button that floats near active text input
- Click → start listening → transcribe → insert text at cursor position
- Works in any textarea, input, or contenteditable on the web
- Keyboard shortcut: "Ctrl+Shift+V" to toggle voice input

### Integration with spelling
- After voice input inserts text, run spelling check on the result
- Offer corrections if needed

---

## Phase 7: Sentence Highlighter + Auto-Reformat (Weeks 9-12)

### Sentence highlighter (PRO preview)
- Highlight current sentence being read
- Dim everything else
- Arrow keys or click to move between sentences
- Good for long articles

### Auto-reformat page
- Strip navigation, ads, sidebars
- Widen margins, increase spacing
- Break into readable chunks
- Like Reader Mode but dyslexia-optimized

---

## Phase 8: Monetization (After 1,000+ users)

### Free tier
- Bionic reading (core feature, marketing driver)
- OpenDyslexic font
- Basic TTS (read selection)
- Reading ruler
- 10 voice notes/month
- Basic spelling correction (rule-based, common patterns)

### PRO tier ($4.99/month)
- Advanced spelling correction (extended dictionary, context-aware)
- Voice-to-text input
- Sentence-by-sentence reader
- Auto-reformat page
- Unlimited voice notes
- Per-site custom settings sync
- Custom bold percentage

### Infrastructure needed
- Simple landing page (Vercel/Netlify, static)
- Stripe payment link or Lemon Squeezy
- License key validation (store key in chrome.storage, check on startup)
- No complex backend needed initially

---

## File Structure After Changes

```
src/
├── background/
│   ├── index.ts              # Keep, remove companion handlers
│   └── storage/              # Keep (notes)
├── content/
│   ├── index.tsx              # Remove companion imports, add bionic + spelling
│   ├── font-injection.ts     # Keep as-is
│   ├── reading-ruler.ts      # Keep as-is
│   ├── tts.ts                # Keep as-is
│   ├── bionic-reading.ts     # NEW - bionic reading module
│   ├── spelling/             # NEW - dyslexic spelling correction
│   │   ├── engine.ts         # Rule-based correction engine
│   │   ├── dictionary.ts     # Dyslexic error patterns
│   │   └── ui.ts             # Inline suggestion UI
│   ├── voice-input.ts        # NEW - voice-to-text for text inputs
│   └── styles.css            # Update with new feature styles
│   ├── companion/            # DELETE ENTIRELY
├── popup/
│   ├── App.tsx               # Update: remove companion, add new toggles
│   ├── Onboarding.tsx        # Keep, update for new features
│   ├── main.tsx              # Keep
│   └── index.css             # Keep
├── options/                  # Keep, add settings for new features
├── shared/
│   ├── types/                # Update types
│   └── lib/                  # Keep
└── test/                     # Expand
```

---

## Success Metrics

| Milestone | Target | Timeline |
|-----------|--------|----------|
| Companion removed, v1.1 shipped | Clean build, no errors | Week 1 |
| Bionic reading shipped | Girlfriend uses it daily | Week 3 |
| Store listing updated | New screenshots, description | Week 3 |
| First 100 organic users | Chrome Store analytics | Week 5 |
| First 10 reviews | 4+ star average | Week 6 |
| Spelling correction shipped | Girlfriend uses it for emails | Week 8 |
| Voice input shipped | Girlfriend uses it for Slack | Week 9 |
| 500 users | Growth from community posts | Week 12 |
| PRO tier launched | First paying user | Week 16+ |
