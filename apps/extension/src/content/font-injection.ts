import { buildFontFaceCss } from '../shared/fonts'

export function injectFontStyles(fontFamily: string = 'OpenDyslexic', lineHeight: number = 1.6) {
  const start = performance.now()
  document.body.classList.add('dyslexia-tool-active')

  let fontFaceStyle = document.getElementById('dyslexia-tool-font-face') as HTMLStyleElement | null
  if (!fontFaceStyle) {
    fontFaceStyle = document.createElement('style')
    fontFaceStyle.id = 'dyslexia-tool-font-face'
    fontFaceStyle.textContent = buildFontFaceCss()
    document.head.appendChild(fontFaceStyle)
  }

  // Reuse the existing style element on re-apply (e.g. switching fonts from the
  // popup). Creating a fresh one each time stacked duplicate universal-selector
  // `* { … !important }` rules on the page, compounding full-page style recalcs
  // until it hung.
  let style = document.getElementById('dyslexia-tool-styles') as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = 'dyslexia-tool-styles'
    document.head.appendChild(style)
  }
  style.textContent = `
    .dyslexia-tool-active * {
      font-family: '${fontFamily}', Verdana, Arial, sans-serif !important;
      line-height: ${lineHeight} !important;
      letter-spacing: 0.05em !important;
      word-spacing: 0.1em !important;
    }
  `
  console.log(`[Font Injection] Applied in ${(performance.now() - start).toFixed(1)}ms`)
}

export function removeFontStyles() {
  const style = document.getElementById('dyslexia-tool-styles')
  if (style) style.remove()
  document.body.classList.remove('dyslexia-tool-active')
}
