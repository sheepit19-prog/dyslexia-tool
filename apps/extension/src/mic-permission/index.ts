// This page handles mic permission + recording + sending audio to background.
// Chrome won't kill visible tabs, so the recording is safe here.

let recorder: MediaRecorder | null = null
let chunks: Blob[] = []
let recStartTime = 0
let timerInterval: ReturnType<typeof setInterval> | null = null

const micIcon = document.getElementById('micIcon')!
const heading = document.getElementById('heading')!
const subtitle = document.getElementById('subtitle')!
const timer = document.getElementById('timer')!
const statusEl = document.getElementById('status')!
const actionBtn = document.getElementById('actionBtn')! as HTMLButtonElement

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - recStartTime) / 1000
    timer.textContent = formatTime(elapsed)
  }, 100)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

async function beginRecording() {
  try {
    statusEl.textContent = 'Requesting microphone access...'
    statusEl.className = 'status'

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    recorder = new MediaRecorder(stream)
    recStartTime = Date.now()

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    recorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop())
      const audioBlob = new Blob(chunks, { type: 'audio/webm' })
      const duration = (Date.now() - recStartTime) / 1000
      chunks = []
      recorder = null
      stopTimer()

      // Send audio to background to save
      try {
        const audioData = await audioBlob.arrayBuffer()
        const response = await chrome.runtime.sendMessage({
          type: 'SAVE_RECORDED_NOTE',
          audioData,
          duration: Math.round(duration) / 1000
        })
        if (response?.success) {
          micIcon.className = 'mic-icon'
          heading.textContent = 'Voice Note'
          subtitle.textContent = 'Ready to record'
          timer.textContent = '0:00'
          statusEl.textContent = '✓ Note saved! You can close this tab.'
          statusEl.className = 'status done'
          actionBtn.textContent = 'Record Another'
          actionBtn.className = 'btn btn-record'
          actionBtn.disabled = false

          // Auto-close after 2 seconds
          setTimeout(() => window.close(), 2000)
        } else {
          statusEl.textContent = 'Failed to save: ' + (response?.error || 'Unknown error')
          statusEl.className = 'status error'
          actionBtn.textContent = 'Try Again'
          actionBtn.className = 'btn btn-record'
          actionBtn.disabled = false
        }
      } catch (err: any) {
        statusEl.textContent = 'Failed to save: ' + (err.message || 'Unknown error')
        statusEl.className = 'status error'
        actionBtn.textContent = 'Try Again'
        actionBtn.className = 'btn btn-record'
        actionBtn.disabled = false
      }
    }

    await new Promise<void>(resolve => {
      recorder!.onstart = () => resolve()
      recorder!.start()
    })

    // Recording started — update UI
    micIcon.className = 'mic-icon recording'
    heading.textContent = 'Recording...'
    subtitle.textContent = 'Speak now, click Stop when done'
    statusEl.textContent = ''
    startTimer()

    actionBtn.textContent = '⏹ Stop Recording'
    actionBtn.className = 'btn btn-stop'
    actionBtn.onclick = endRecording

    // Tell background recording started
    chrome.runtime.sendMessage({ type: 'RECORDING_STATE_UPDATE', isRecording: true }).catch(() => {})

  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      statusEl.textContent = 'Microphone permission is required. Please allow access and try again.'
    } else {
      statusEl.textContent = 'Error: ' + (err.message || 'Could not start recording')
    }
    statusEl.className = 'status error'
    actionBtn.textContent = 'Try Again'
    actionBtn.className = 'btn btn-record'
    actionBtn.disabled = false
  }
}

function endRecording() {
  if (!recorder || recorder.state !== 'recording') return

  actionBtn.disabled = true
  actionBtn.textContent = 'Saving...'
  statusEl.textContent = 'Saving note...'
  statusEl.className = 'status'
  micIcon.className = 'mic-icon'

  recorder.stop()

  // Tell background recording stopped (will be confirmed when SAVE_RECORDED_NOTE succeeds)
  chrome.runtime.sendMessage({ type: 'RECORDING_STATE_UPDATE', isRecording: false }).catch(() => {})
}

// Wire up initial button
actionBtn.onclick = beginRecording

// Listen for stop command from popup (user clicks Stop in popup while recording tab is open)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STOP_FROM_POPUP') {
    endRecording()
  }
})
