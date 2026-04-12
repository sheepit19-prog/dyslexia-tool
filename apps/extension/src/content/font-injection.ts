export function injectFontStyles(fontFamily: string = 'OpenDyslexic', lineHeight: number = 1.6) {
  const start = performance.now()
  document.body.classList.add('dyslexia-tool-active')

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

  const style = document.createElement('style')
  style.id = 'dyslexia-tool-styles'
  style.textContent = `
    .dyslexia-tool-active * {
      font-family: '${fontFamily}', Verdana, Arial, sans-serif !important;
      line-height: ${lineHeight} !important;
      letter-spacing: 0.05em !important;
      word-spacing: 0.1em !important;
    }
  `
  document.head.appendChild(style)
  console.log(`[Font Injection] Applied in ${(performance.now() - start).toFixed(1)}ms`)
}

export function removeFontStyles() {
  const style = document.getElementById('dyslexia-tool-styles')
  if (style) style.remove()
  document.body.classList.remove('dyslexia-tool-active')
}
