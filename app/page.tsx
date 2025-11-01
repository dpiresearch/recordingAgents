'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

interface AnalysisResults {
  transcription: string
  mood: string
  sentiment: string
  summary: string
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
      setResults(null)
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

  const processAudio = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    setError(null)

    try {
      // First, transcribe the audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const { transcription } = await transcriptionResponse.json()

      // Now run all agents in parallel
      const [moodRes, sentimentRes, summaryRes] = await Promise.all([
        fetch('/api/agents/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcription }),
        }),
        fetch('/api/agents/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcription }),
        }),
        fetch('/api/agents/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcription }),
        }),
      ])

      const mood = await moodRes.json()
      const sentiment = await sentimentRes.json()
      const summary = await summaryRes.json()

      setResults({
        transcription,
        mood: mood.mood,
        sentiment: sentiment.sentiment,
        summary: summary.summary,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
      console.error('Processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

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

          {audioBlob && !isRecording && (
            <button
              onClick={processAudio}
              className={`${styles.button} ${styles.processButton}`}
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ Processing...' : '✨ Analyze Recording'}
            </button>
          )}
        </div>

        {isRecording && (
          <div className={styles.recordingIndicator}>
            <div className={styles.pulse}></div>
            <span>Recording in progress...</span>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {results && (
          <div className={styles.results}>
            <div className={styles.resultCard}>
              <h2>📝 Transcription</h2>
              <p>{results.transcription}</p>
            </div>

            <div className={styles.agentResults}>
              <div className={styles.agentCard}>
                <h3>😊 Mood Analysis</h3>
                <p>{results.mood}</p>
              </div>

              <div className={styles.agentCard}>
                <h3>💭 Sentiment Analysis</h3>
                <p>{results.sentiment}</p>
              </div>

              <div className={styles.agentCard}>
                <h3>📋 Summary</h3>
                <p>{results.summary}</p>
              </div>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <p>Powered by OpenAI Whisper & GPT-4</p>
        </footer>
      </div>
    </main>
  )
}

