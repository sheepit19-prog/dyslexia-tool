let synth: SpeechSynthesis | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null

export function readSelectedText() {
  const selectedText = window.getSelection()?.toString().trim()
  if (!selectedText) {
    alert('Please select some text first.')
    return
  }

  stopReading()
  synth = window.speechSynthesis
  currentUtterance = new SpeechSynthesisUtterance(selectedText)
  currentUtterance.rate = 0.9
  currentUtterance.lang = 'en-US'
  synth.speak(currentUtterance)
}

export function stopReading() {
  if (synth) {
    synth.cancel()
    currentUtterance = null
  }
}
