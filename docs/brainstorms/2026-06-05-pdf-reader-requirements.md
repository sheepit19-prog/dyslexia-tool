---
date: 2026-06-05
topic: pdf-reader
---

# PDF Reader — Local PDF Support for Dyslexia Tool

## Summary

Add a dedicated PDF reader page to the Chrome extension so users can open local PDF files and apply all existing dyslexia reading features — font switching, bionic reading, TTS, and reading ruler — to PDF content. Uses pdf.js for client-side text extraction; all processing stays local.

---

## Problem Frame

Dyslexia Tool currently works only on web pages (HTML content). However, a large portion of academic and professional reading material exists as PDFs — lecture notes, research papers, reports, e-books. Dyslexic users currently read these PDFs without any assistive support, struggling with standard fonts and dense layouts. They have no single tool that handles both web and PDF content. Adding PDF support closes this gap and makes Dyslexia Tool a unified reading companion.

---

## Actors

- A1. **Dyslexic Reader**: Opens a local PDF file and uses reading features (font, bionic reading, TTS, ruler) to read more comfortably.
- A2. **Extension PDF Reader Page**: The dedicated reader interface that renders PDF content as accessible HTML and applies text transformations.

---

## Key Flows

- F1. **Open PDF via Popup Button**
  - **Trigger:** User clicks "Open PDF" button in the extension popup.
  - **Actors:** A1, A2
  - **Steps:** User clicks popup → clicks "Open PDF" → system opens native file picker (filtered to `.pdf`) → user selects a file → reader page opens with rendered PDF.
  - **Outcome:** PDF content is displayed in the reader page with dyslexia features available.
  - **Covered by:** R1, R2, R4

- F2. **Open PDF via Drag-and-Drop**
  - **Trigger:** User drags a `.pdf` file from their file system onto the reader page drop zone.
  - **Actors:** A1, A2
  - **Steps:** User opens reader page → drags PDF file onto the designated drop area → file is accepted → PDF renders in the reader.
  - **Outcome:** PDF content displayed in the reader page with dyslexia features available.
  - **Covered by:** R3, R4

- F3. **Apply Dyslexia Features to PDF**
  - **Trigger:** User toggles a reading feature while viewing a PDF (via popup, keyboard shortcut, or reader page controls).
  - **Actors:** A1, A2
  - **Steps:** PDF is rendered as HTML text layer → user activates font switching / bionic reading / TTS / reading ruler → transformation applies to the text layer in real time.
  - **Outcome:** PDF text rendered with user's chosen dyslexia reading settings.
  - **Covered by:** R5, R6, R7, R8

---

## Requirements

**File Loading**

- R1. User can open a local PDF file by clicking an "Open PDF" button in the extension popup, which triggers the native OS file picker filtered to `.pdf` files.
- R2. The extension opens the selected PDF in a dedicated reader page within the extension, not in a browser tab.
- R3. User can drag and drop a `.pdf` file from their file system onto the reader page to open it.
- R4. The reader page renders PDF content as an accessible HTML text layer, preserving reading order and text selection.

**Reading Features on PDF Content**

- R5. Font switching (OpenDyslexic, Arial, Verdana) with adjustable letter/line spacing works on the rendered PDF text.
- R6. Bionic Reading mode (bold first ~45% of each word) works on the rendered PDF text.
- R7. Text-to-speech via Web Speech API works on user-selected text within the PDF.
- R8. Reading ruler (horizontal highlight following mouse) works on the rendered PDF text.

**Reader Page Controls**

- R9. The reader page provides page navigation controls (previous page, next page, jump to page number) for multi-page PDFs.
- R10. Reading feature toggles (font, bionic reading, TTS, ruler) are accessible from within the reader page, not only from the popup.
- R11. Dark mode applies to the reader page UI chrome (background, controls), consistent with the extension's existing theme system.

**Privacy & Performance**

- R12. All PDF processing (text extraction, rendering, transformations) happens locally in the browser. No PDF content is uploaded or transmitted.
- R13. The extension must request only the minimum new permissions needed for local file access.

---

## Acceptance Examples

- AE1. **Covers R1, R2, R4.** Given the extension popup is open, when the user clicks "Open PDF" and selects a valid `.pdf` file, the reader page opens and displays the first page of the PDF as readable text.
- AE2. **Covers R3, R4.** Given the reader page is open with no PDF loaded, when the user drags a `.pdf` file onto the drop zone, the file is accepted and the PDF renders.
- AE3. **Covers R5.** Given a PDF is rendered, when the user enables the OpenDyslexic font and adjusts letter spacing to 1.5x, all text on the current page re-renders with those settings.
- AE4. **Covers R6.** Given a PDF is rendered, when the user enables Bionic Reading mode, the first ~45% of each word on the current page appears bold.
- AE5. **Covers R7.** Given a PDF is rendered, when the user selects a paragraph and presses Ctrl+Shift+R (or clicks Read Aloud), the selected text is spoken aloud.
- AE6. **Covers R9.** Given a 10-page PDF is rendered, when the user clicks "Next Page," page 2 renders. When the user types "5" in the page number input and presses Enter, page 5 renders.
- AE7. **Covers R12.** Given a PDF is loaded, no network requests containing PDF content are sent. All text extraction and rendering executes in the browser's main thread or a web worker.

---

## Success Criteria

- A dyslexic user can open a local PDF and read it with dyslexia-friendly font within 3 clicks or one drag-and-drop.
- All four reading features (font, bionic reading, TTS, ruler) function on PDF content with behavior matching the existing web page experience.
- PDF text extraction and rendering completes in under 2 seconds for a typical 20-page document.
- No regression in existing web page feature behavior or extension performance.

---

## Scope Boundaries

- Spell checking and voice notes do not apply to PDF content — PDFs are read-only and these are writing/memory features.
- Scanned/image-based PDFs without a selectable text layer are not supported — OCR is out of scope.
- PDF annotations, form filling, highlighting, and editing are out of scope.
- Export or save of modified/annotated PDFs is out of scope.
- Opening PDFs from URLs (online PDFs) is handled by existing web page features if the browser renders them as HTML; a dedicated online-PDF flow is deferred.

---

## Key Decisions

- **Dedicated reader page over intercepting Chrome's PDF viewer**: Full control over rendering and text extraction with pdf.js. Chrome's built-in PDF viewer is sandboxed and changes between versions, making interception fragile.
- **pdf.js as the PDF rendering engine**: The standard, well-tested client-side PDF library (MIT license). Renders PDF pages to HTML canvas + text layer, which is the format the existing text transformation pipeline needs.
- **Reading features only on PDFs**: Writing/memory features (spell checking, voice notes) are excluded because PDFs are read-only content — they add UI complexity without proportional value in the PDF reading flow.
- **Global settings only for PDF reader**: Font, spacing, and other reading preferences changed while viewing a PDF apply globally (same as web pages). No per-PDF preference storage — simpler architecture and consistent user experience across all content types.

---

## Dependencies / Assumptions

- pdf.js (~2MB) will be bundled with the extension. No external CDN dependency.
- A new extension permission for local file access will be required. The exact permission depends on the chosen API (File System Access API vs. traditional `<input type="file">`).
- Multi-page PDF support (R9) is in scope for the initial version. Page navigation is basic (prev/next/jump) without thumbnail previews.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R13][Technical] Which file access API to use: File System Access API (modern, `showOpenFilePicker`) vs. traditional `<input type="file">` (broader browser support). Trade-off between UX and compatibility.
- [Affects R4][Technical] Whether to run pdf.js in a Web Worker to keep the main thread responsive during text extraction of large PDFs.
- [Affects R9][Technical] Whether to support continuous scroll mode (all pages in one scrollable view) in addition to single-page mode.
- [Affects R10][Technical] Exact layout of reader page controls — whether to replicate the popup's toggle UI inline or use a sidebar/toolbar pattern.
