'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // No useEffect needed on home page anymore - payment flow moved to /result

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        audioChunksRef.current = []
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('[RECORDING] Recording stopped')
        console.log('[RECORDING] Audio blob size:', (audioBlob.size / 1024).toFixed(2), 'KB')
        console.log('[RECORDING] Processing and redirecting to payment...')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        
        processAudioAndRedirect(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
    } catch (err) {
      setError('Failed to access microphone. Please grant permission.')
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudioAndRedirect = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      console.log('[TRANSCRIPTION] Sending audio to Whisper API...')
      
      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const { transcription } = await transcriptionResponse.json()

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[TRANSCRIPTION] Success!')
      console.log('[TRANSCRIPTION] Transcription length:', transcription.length)
      console.log('[TRANSCRIPTION] Storing in localStorage...')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Store transcription for after-payment processing
      localStorage.setItem('pendingTranscription', transcription)
      localStorage.setItem('pendingPayment', 'true')

      // Redirect to Stripe payment
      const stripeUrl = 'https://buy.stripe.com/test_3cI3cwc7Rasl18U4ToeAg00'
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[STRIPE] Redirecting to payment page')
      console.log('[STRIPE] Timestamp:', new Date().toISOString())
      console.log('[STRIPE] Payment URL:', stripeUrl)
      console.log('[STRIPE] Expected return URL: http://localhost:3000/result')
      console.log('[STRIPE] Transcription stored: ✓')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      window.location.href = stripeUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('[ERROR] Processing failed:', err)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      setIsProcessing(false)
    }
  }

  // handleMoodPayment removed - payment now happens immediately after recording

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Voice Recording & AI Analysis</h1>
        <p className={styles.subtitle}>
          Record your voice and get instant transcription with AI-powered mood, sentiment, and summary analysis
        </p>

        <div className={styles.controls}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              className={`${styles.button} ${styles.recordButton}`}
              disabled={isProcessing}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className={`${styles.button} ${styles.stopButton}`}
            >
              ⏹️ Stop Recording
            </button>
          )}

        </div>

        {isRecording && (
          <div className={styles.recordingIndicator}>
            <div className={styles.pulse}></div>
            <span>Recording in progress...</span>
          </div>
        )}

        {isProcessing && (
          <div className={styles.processing}>
            <div className={styles.loader}></div>
            <p>Transcribing audio... You will be redirected to payment.</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <footer className={styles.footer}>
          <p>Powered by OpenAI Whisper & GPT-4</p>
        </footer>
      </div>
    </main>
  )
}

