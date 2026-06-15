/**
 * Shared @font-face CSS for the bundled dyslexia-friendly fonts.
 *
 * Used by both the content script (web pages) and the PDF reader so the two
 * never drift. Each non-system font ships latin + latin-ext woff2 subsets so
 * Turkish glyphs (ğ, ş, ı, İ, …) render. Lexend is a variable font — a single
 * file per subset covers every weight (declared `100 900` so bold/bionic use
 * the real weight axis instead of faux-bolding). Atkinson Hyperlegible ships
 * separate regular/bold files.
 *
 * The URLs resolve via chrome.runtime.getURL, so these files must stay listed
 * under `web_accessible_resources` in manifest.json.
 */

import type { Settings } from './types/storage'

/** Selectable font families that need a bundled @font-face. */
export const BUNDLED_FONT_FAMILIES = ['OpenDyslexic', 'Lexend', 'Atkinson Hyperlegible'] as const

/**
 * Canonical font-family picker options, shared by the popup, the Options page,
 * and per-site settings so the list never drifts. Dyslexia-friendly faces are
 * grouped first.
 */
export const FONT_FAMILY_OPTIONS: { value: Settings['fontFamily']; label: string }[] = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Lexend', label: 'Lexend (dyslexia-friendly)' },
  { value: 'Atkinson Hyperlegible', label: 'Atkinson Hyperlegible (dyslexia-friendly)' },
  { value: 'OpenDyslexic', label: 'OpenDyslexic' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'system', label: 'System Default' },
]

// Subset coverage matches Google Fonts' own split. `latin` carries ı (U+0131)
// and the Latin-1 block (ç, ö, ü, …); `latin-ext` carries ğ, ş, İ (U+011E…015F,
// U+0130) — together they cover Turkish for both fonts.
const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF'

/**
 * Builds the @font-face block for every bundled font. Idempotent string build;
 * callers inject it once into a `<style id="dyslexia-tool-font-face">`.
 */
export function buildFontFaceCss(): string {
  const url = (file: string) => chrome.runtime.getURL(`fonts/${file}`)
  return `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${url('OpenDyslexic-Regular.woff2')}') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${url('OpenDyslexic-Bold.woff2')}') format('woff2');
      font-weight: bold;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Lexend';
      src: url('${url('Lexend.woff2')}') format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: ${LATIN};
    }
    @font-face {
      font-family: 'Lexend';
      src: url('${url('Lexend-ext.woff2')}') format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: ${LATIN_EXT};
    }
    @font-face {
      font-family: 'Atkinson Hyperlegible';
      src: url('${url('AtkinsonHyperlegible-Regular.woff2')}') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
      unicode-range: ${LATIN};
    }
    @font-face {
      font-family: 'Atkinson Hyperlegible';
      src: url('${url('AtkinsonHyperlegible-Regular-ext.woff2')}') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
      unicode-range: ${LATIN_EXT};
    }
    @font-face {
      font-family: 'Atkinson Hyperlegible';
      src: url('${url('AtkinsonHyperlegible-Bold.woff2')}') format('woff2');
      font-weight: 700;
      font-style: normal;
      font-display: swap;
      unicode-range: ${LATIN};
    }
    @font-face {
      font-family: 'Atkinson Hyperlegible';
      src: url('${url('AtkinsonHyperlegible-Bold-ext.woff2')}') format('woff2');
      font-weight: 700;
      font-style: normal;
      font-display: swap;
      unicode-range: ${LATIN_EXT};
    }
  `
}
