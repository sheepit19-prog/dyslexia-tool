import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import { saveAudioBlob } from '../../utils/indexedDB'
import { useNotesStore } from '../../stores/notesStore'
import { parseReminder } from '../../utils/reminderParser'

interface RecorderProps {
  open: boolean
  onClose: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function Recorder({ open, onClose }: RecorderProps) {
  const { isRecording, duration, audioBlob, analyserNode, transcription, startRecording, stopRecording, error } =
    useVoiceRecorder()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const addNote = useNotesStore((s) => s.addNote)

  // Waveform visualization
  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw)
      analyserNode!.getByteTimeDomainData(dataArray)

      ctx.fillStyle = 'transparent'
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim() || '#7c5cbf'
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [analyserNode])

  // Save recording when blob is ready
  const handleSave = useCallback(async () => {
    if (!audioBlob) return
    const id = crypto.randomUUID()
    await saveAudioBlob(id, audioBlob)

    // Parse reminder from transcription
    const parsed = parseReminder(transcription)

    addNote({
      id,
      title: '',
      duration,
      tags: [],
      createdAt: Date.now(),
      transcription: transcription || undefined,
      reminder: parsed?.reminder,
    })
    onClose()
  }, [audioBlob, duration, transcription, addNote, onClose])

  // Auto-start recording when opened
  useEffect(() => {
    if (open && !isRecording && !audioBlob) {
      startRecording()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
        >
          <button
            onClick={() => {
              if (isRecording) stopRecording()
              onClose()
            }}
            className="absolute top-4 right-4 text-on-surface-muted hover:text-on-surface text-xl p-2"
            aria-label="Close recorder"
          >
            ✕
          </button>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <div className="text-6xl font-mono text-on-surface mb-8 tabular-nums">
            {formatTime(duration)}
          </div>

          <canvas
            ref={canvasRef}
            width={300}
            height={80}
            className="mb-4 rounded-lg"
          />

          {/* Live transcription */}
          {transcription && (
            <div className="mb-6 max-w-sm w-full">
              <p className="text-sm text-on-surface-muted text-center italic leading-relaxed">
                {transcription}
              </p>
            </div>
          )}

          {isRecording ? (
            <motion.button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              aria-label="Stop recording"
            >
              <div className="w-8 h-8 rounded-sm bg-white" />
            </motion.button>
          ) : audioBlob ? (
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-surface-dim text-on-surface border border-border"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-accent text-white"
              >
                Save Note
              </button>
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
