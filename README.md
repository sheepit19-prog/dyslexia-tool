# Dyslexia Tool

A free, privacy-first Chrome extension for dyslexia reading and writing assistance. Customizable fonts, bionic reading, text-to-speech, a reading ruler, spell checking, voice notes — and a built-in **PDF reader** that applies the same reading aids to local PDFs. Everything runs locally in the browser; no data ever leaves your device.

> Available on the [Chrome Web Store](https://chromewebstore.google.com/detail/hkingdeoobbaddphljhgolilcdlfhkfe).

## Features

| Feature | Description | Shortcut |
|---|---|---|
| **Dyslexia-Friendly Fonts** | Switch to OpenDyslexic, Arial, or Verdana with adjustable letter/line spacing | `Ctrl+Shift+F` |
| **Bionic Reading** | Bold the leading part of each word to guide eye movement | `Ctrl+Shift+B` |
| **Read Aloud (TTS)** | Text-to-speech with adjustable speed (0.5×–2.0×) | `Ctrl+Shift+R` |
| **Reading Ruler** | Highlight the current line to reduce visual clutter | `Ctrl+Shift+L` |
| **PDF Reader** | Open local PDFs and apply the reading aids via a clean reflowed reading mode | — |
| **Spell Checking** | Real-time spelling suggestions while typing on any page | — |
| **Voice Notes** | Record and store audio notes locally (IndexedDB) | — |
| **Site Preferences** | Per-website settings that override global defaults | — |
| **Dark Mode** | Light, dark, and system-following themes | — |

## PDF Reader

Open a PDF from the popup ("Open PDF") or drag-and-drop one onto the reader page. When you enable a text feature (font or bionic), the page switches to **reading mode**: the PDF's text is extracted and reflowed into a clean single column where the dyslexia font, spacing, and bionic reading render correctly. Text size is adjustable (A−/A+) and remembered. The original page view stays the default and is used as a fallback for scanned/image-only PDFs. All parsing happens locally with [pdf.js](https://mozilla.github.io/pdf.js/).

## How It Works

The extension injects into web pages and applies real-time transformations to text rendering; the PDF reader is a standalone extension page. No data leaves your browser — all processing is local, and voice notes are stored only in IndexedDB.

## Installation

### Chrome Web Store
Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/hkingdeoobbaddphljhgolilcdlfhkfe).

### From source (developer mode)
```bash
cd apps/extension
npm install        # postinstall copies the pdf.js worker into public/workers
npm run build      # output in apps/extension/dist
```
Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select `apps/extension/dist`.

## Development

```bash
cd apps/extension

npm install        # install deps (also copies the pdf.js worker)
npm run dev        # dev server with hot reload
npm test           # unit tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright)
npm run build      # production build → dist/
```

## Project Structure

```
apps/extension/
├── manifest.json          # Manifest V3
├── popup/ · options/ · reader/   # HTML entry points
├── public/workers/        # pdf.js worker (generated on install)
└── src/
    ├── background/        # service worker
    ├── content/          # content scripts (font, bionic, TTS, ruler, spelling)
    ├── popup/ · options/  # extension UIs
    ├── reader/           # PDF reader page (canvas + reading-mode reflow)
    └── shared/           # shared types and pure utilities
```

## Tech Stack

- **React 19** + **TypeScript** (strict)
- **Vite 7** with `@crxjs/vite-plugin`
- **Tailwind CSS 4**
- **Zustand** (state) · **Dexie.js** (IndexedDB)
- **pdf.js** for PDF rendering and text extraction
- **Chrome Extension Manifest V3**
- **Vitest** + **Playwright** for testing

## Privacy

All processing happens locally on your device. Nothing is collected, transmitted, or sold. See the [Privacy Policy](apps/extension/docs/PRIVACY_POLICY.md).

## License

[MIT](LICENSE)
