'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../page.module.css'

interface AnalysisResults {
  transcription: string
  mood: string
  sentiment: string
  summary: string
}

export default function ResultPage() {
  const router = useRouter()
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPaymentReturn = async () => {
      const currentUrl = window.location.href
      const urlParams = new URLSearchParams(window.location.search)
      const stripeSessionId = urlParams.get('session_id')
      
      // Log ALL URL parameters for debugging
      const allParams: Record<string, string> = {}
      urlParams.forEach((value, key) => {
        allParams[key] = value
      })
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[RESULT PAGE] Loaded')
      console.log('[RESULT PAGE] Timestamp:', new Date().toISOString())
      console.log('[RESULT PAGE] Full URL:', currentUrl)
      console.log('[RESULT PAGE] All query parameters:', JSON.stringify(allParams, null, 2))
      console.log('[RESULT PAGE] session_id detected:', stripeSessionId || 'none')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Check for pending transcription
      const pendingTranscription = localStorage.getItem('pendingTranscription')
      const isPendingMoodPayment = localStorage.getItem('pendingMoodPayment') === 'true'

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[RESULT PAGE] Checking localStorage')
      console.log('[RESULT PAGE] Pending transcription exists:', !!pendingTranscription)
      console.log('[RESULT PAGE] Transcription length:', pendingTranscription?.length || 0)
      console.log('[RESULT PAGE] Pending mood payment flag:', isPendingMoodPayment)
      console.log('[RESULT PAGE] Stripe session ID:', stripeSessionId || 'none')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      if (!pendingTranscription) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('[RESULT PAGE] ❌ No transcription found in localStorage')
        console.error('[RESULT PAGE] Redirecting to home page...')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        setError('No recording found. Please record audio first.')
        setTimeout(() => router.push('/'), 3000)
        return
      }

      if (!stripeSessionId) {
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.warn('[RESULT PAGE] ⚠️ No Stripe session ID found')
        console.warn('[RESULT PAGE] Payment may not have completed')
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      }

      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('[RESULT PAGE] ✅ Payment successful!')
        console.log('[RESULT PAGE] Starting AI analysis...')
        console.log('[RESULT PAGE] Running 3 agents in parallel: Mood, Sentiment, Summary')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        // Run all three agents in parallel
        const [moodRes, sentimentRes, summaryRes] = await Promise.all([
          fetch('/api/agents/mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription: pendingTranscription }),
          }),
          fetch('/api/agents/sentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription: pendingTranscription }),
          }),
          fetch('/api/agents/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription: pendingTranscription }),
          }),
        ])

        if (!moodRes.ok || !sentimentRes.ok || !summaryRes.ok) {
          throw new Error('One or more agent requests failed')
        }

        const mood = await moodRes.json()
        const sentiment = await sentimentRes.json()
        const summary = await summaryRes.json()

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('[RESULT PAGE] ✅ All analyses completed successfully!')
        console.log('[RESULT PAGE] Mood length:', mood.mood?.length || 0)
        console.log('[RESULT PAGE] Sentiment length:', sentiment.sentiment?.length || 0)
        console.log('[RESULT PAGE] Summary length:', summary.summary?.length || 0)
        console.log('[RESULT PAGE] Displaying results...')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        setResults({
          transcription: pendingTranscription,
          mood: mood.mood,
          sentiment: sentiment.sentiment,
          summary: summary.summary,
        })

        // Clean up localStorage
        console.log('[RESULT PAGE] Cleaning up localStorage')
        localStorage.removeItem('pendingTranscription')
        localStorage.removeItem('pendingMoodPayment')
        
        // Clean up URL
        console.log('[RESULT PAGE] Cleaning up URL (removing query parameters)')
        window.history.replaceState({}, '', '/result')
        
        console.log('[RESULT PAGE] Complete! ✓')
      } catch (err) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('[RESULT PAGE] ❌ Analysis failed')
        console.error('[RESULT PAGE] Error:', err)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        setError(err instanceof Error ? err.message : 'Failed to analyze recording')
      } finally {
        setIsProcessing(false)
      }
    }

    processPaymentReturn()
  }, [router])

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Analysis Results</h1>
        <p className={styles.description}>
          Your voice recording has been analyzed by AI agents
        </p>

        {isProcessing && (
          <div className={styles.processing}>
            <div className={styles.loader}></div>
            <p>Analyzing your recording with AI agents...</p>
            <p className={styles.subtext}>This may take a few moments</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button
              onClick={() => router.push('/')}
              className={styles.button}
            >
              ← Back to Home
            </button>
          </div>
        )}

        {results && (
          <div className={styles.results}>
            <div className={styles.transcriptionCard}>
              <h3>📝 Transcription</h3>
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
                <h3>📊 Summary</h3>
                <p>{results.summary}</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className={styles.button}
              style={{ marginTop: '2rem' }}
            >
              ← Record Another
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

