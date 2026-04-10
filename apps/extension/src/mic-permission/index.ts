// This page opens in a real tab so Chrome can show the mic permission prompt.
// Once permission is granted/denied, it reports back and closes itself.

async function requestPermission() {
  const statusEl = document.getElementById('status')!

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())

    statusEl.textContent = 'Microphone access granted! You can close this tab.'
    statusEl.style.color = '#059669'

    // Tell background permission was granted
    chrome.runtime.sendMessage({ type: 'MIC_PERMISSION_RESULT', granted: true })
  } catch (error: any) {
    statusEl.textContent = 'Microphone access denied. Voice notes require microphone permission.'
    statusEl.style.color = '#DC2626'

    chrome.runtime.sendMessage({ type: 'MIC_PERMISSION_RESULT', granted: false, error: error.message })
  }
}

requestPermission()
