let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

async function startRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

  audioChunks = []
  mediaRecorder = new MediaRecorder(stream)

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) audioChunks.push(event.data)
  }

  await new Promise<void>((resolve) => {
    mediaRecorder!.onstart = () => resolve()
    mediaRecorder!.start()
  })
}

async function stopRecording(): Promise<{ audioData: ArrayBuffer; duration: number }> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') {
      reject(new Error('No active recording'))
      return
    }

    mediaRecorder!.onstop = async () => {
      mediaRecorder!.stream.getTracks().forEach((track) => track.stop())
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      const audioData = await audioBlob.arrayBuffer()
      audioChunks = []
      mediaRecorder = null
      resolve({ audioData, duration: audioBlob.size / 1000 })
    }

    mediaRecorder!.stop()
  })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    startRecording()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'STOP_RECORDING') {
    stopRecording()
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true
  }
})
