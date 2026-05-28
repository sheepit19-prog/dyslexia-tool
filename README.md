# Dyslexia Tool

Free Chrome extension for dyslexia reading and writing assistance — customizable fonts, bionic reading, text-to-speech, reading ruler, spell checking, and voice notes. Works on any website.

## Features

| Feature | Description | Shortcut |
|---|---|---|
| **Dyslexia-Friendly Fonts** | Switch to OpenDyslexic, Arial, or Verdana with adjustable letter/line spacing | `Ctrl+Shift+F` |
| **Bionic Reading** | Bold first syllables to guide eye movement and improve reading speed | `Ctrl+Shift+B` |
| **Read Aloud (TTS)** | Text-to-speech with adjustable speed (0.5x–2.0x) | `Ctrl+Shift+R` |
| **Reading Ruler** | Highlight the line you're reading to reduce visual clutter | `Ctrl+Shift+L` |
| **Spell Checking** | Real-time spelling suggestions while typing on any page | — |
| **Voice Notes** | Record, transcribe, and tag audio notes (IndexedDB storage) | — |
| **Site Preferences** | Per-website settings override global defaults | — |
| **Dark Mode** | Light, dark, and system-following themes | — |

## How It Works

The extension injects into any web page and applies real-time transformations to text rendering. No data leaves your browser — all processing is local. Voice notes are saved to IndexedDB and never transmitted.

## Usage

1. Click the extension icon to open the quick-toggle popup
2. Right-click the icon → **Options** for full settings
3. Use keyboard shortcuts for fast toggles
4. Right-click selected text → **Read Aloud**

## Development

```bash
cd apps/extension

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** with `@crxjs/vite-plugin`
- **Tailwind CSS 4**
- **Zustand** for state management
- **Dexie.js** for IndexedDB (voice notes, preferences)
- **Chrome Extension Manifest V3**
- **Vitest** + **Playwright** for testing

## Privacy

This extension processes all data locally on your device. It does not collect, transmit, or sell any personal information. Text from web pages is transformed in-browser and never sent anywhere. See [Privacy Policy](apps/extension/docs/PRIVACY_POLICY.md).

## License

MIT
