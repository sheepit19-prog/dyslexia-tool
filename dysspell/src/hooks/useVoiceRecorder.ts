import { useState, useCallback, useRef } from 'react'

interface VoiceRecorderResult {
  isRecording: boolean
  duration: number
  audioBlob: Blob | null
  analyserNode: AnalyserNode | null
  transcription: string
  startRecording: () => Promise<void>
  stopRecording: () => void
  error: string | null
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export function useVoiceRecorder(): VoiceRecorderResult {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
  const [transcription, setTranscription] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as unknown as ReturnType<typeof setInterval>)
  const audioContextRef = useRef<AudioContext | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const recordingRef = useRef(false)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setAudioBlob(null)
      setDuration(0)
      setTranscription('')
      chunksRef.current = []
      recordingRef.current = true

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Set up analyser for waveform
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      setAnalyserNode(analyser)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        audioContext.close()
        setAnalyserNode(null)
      }

      mediaRecorder.start(100) // collect data every 100ms
      setIsRecording(true)

      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      // Start speech recognition in parallel for live transcription
      if (SpeechRecognitionAPI) {
        let fullTranscript = ''

        const startRecognition = () => {
          if (!recordingRef.current) return

          const recognition = new SpeechRecognitionAPI()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = navigator.language || 'en-US'
          recognitionRef.current = recognition

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = ''
            let final = ''
            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i]
              if (result.isFinal) {
                final += result[0].transcript
              } else {
                interim += result[0].transcript
              }
            }
            // Update fullTranscript with finalized results
            if (final) {
              fullTranscript = (fullTranscript + ' ' + final).trim()
            }
            setTranscription((fullTranscript + ' ' + interim).trim())
          }

          recognition.onend = () => {
            // Chrome stops recognition after ~60s silence — auto-restart if still recording
            if (recordingRef.current) {
              startRecognition()
            }
          }

          recognition.onerror = () => {
            // Non-fatal: transcription is best-effort
            if (recordingRef.current) {
              startRecognition()
            }
          }

          try {
            recognition.start()
          } catch {
            // Ignore — recognition may already be running
          }
        }

        startRecognition()
      }
    } catch {
      setError('Microphone access denied. Please allow microphone access.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    recordingRef.current = false
    mediaRecorderRef.current?.stop()
    clearInterval(timerRef.current)
    setIsRecording(false)

    // Stop speech recognition
    try {
      recognitionRef.current?.stop()
    } catch {
      // Ignore
    }
    recognitionRef.current = null
  }, [])

  return { isRecording, duration, audioBlob, analyserNode, transcription, startRecording, stopRecording, error }
}
