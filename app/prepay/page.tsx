'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../page.module.css'

interface PrepayResults {
  transcription: string
  sentiment: string
  summary: string
}

export default function PrepayPage() {
  const router = useRouter()
  const [results, setResults] = useState<PrepayResults | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processRecording = async () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[PREPAY PAGE] Loaded')
      console.log('[PREPAY PAGE] Timestamp:', new Date().toISOString())
      console.log('[PREPAY PAGE] Checking for transcription...')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Check for pending transcription
      const pendingTranscription = localStorage.getItem('pendingTranscription')

      if (!pendingTranscription) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('[PREPAY PAGE] ❌ No transcription found')
        console.error('[PREPAY PAGE] Redirecting to home page...')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        setError('No recording found. Please record audio first.')
        setTimeout(() => router.push('/'), 3000)
        return
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[PREPAY PAGE] ✅ Transcription found!')
      console.log('[PREPAY PAGE] Transcription length:', pendingTranscription.length)
      console.log('[PREPAY PAGE] Running FREE analyses: Sentiment & Summary')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      try {
        // Run only sentiment and summary (FREE)
        const [sentimentRes, summaryRes] = await Promise.all([
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

        console.log('[PREPAY PAGE] Sentiment response status:', sentimentRes.status)
        console.log('[PREPAY PAGE] Summary response status:', summaryRes.status)

        if (!sentimentRes.ok || !summaryRes.ok) {
          const errors = []
          if (!sentimentRes.ok) {
            const text = await sentimentRes.text()
            console.error('[PREPAY PAGE] Sentiment error:', text.substring(0, 500))
            errors.push('sentiment')
          }
          if (!summaryRes.ok) {
            const text = await summaryRes.text()
            console.error('[PREPAY PAGE] Summary error:', text.substring(0, 500))
            errors.push('summary')
          }
          throw new Error(`Agent requests failed: ${errors.join(', ')}`)
        }

        let sentiment, summary
        try {
          sentiment = await sentimentRes.json()
          summary = await summaryRes.json()
          
          if (!sentiment.sentiment || !summary.summary) {
            throw new Error('Missing data in responses')
          }
        } catch (e) {
          console.error('[PREPAY PAGE] Failed to parse agent responses:', e)
          throw new Error('Invalid response from AI agents')
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('[PREPAY PAGE] ✅ Free analyses completed!')
        console.log('[PREPAY PAGE] Sentiment length:', sentiment.sentiment?.length || 0)
        console.log('[PREPAY PAGE] Summary length:', summary.summary?.length || 0)
        console.log('[PREPAY PAGE] Displaying results with Mood locked...')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        setResults({
          transcription: pendingTranscription,
          sentiment: sentiment.sentiment,
          summary: summary.summary,
        })
      } catch (err) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('[PREPAY PAGE] ❌ Analysis failed')
        console.error('[PREPAY PAGE] Error:', err)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        setError(err instanceof Error ? err.message : 'Failed to analyze recording')
      } finally {
        setIsProcessing(false)
      }
    }

    processRecording()
  }, [router])

  const handlePayment = () => {
    // Mark that we're waiting for mood payment
    localStorage.setItem('pendingMoodPayment', 'true')
    
    const stripeUrl = 'https://buy.stripe.com/test_3cI3cwc7Rasl18U4ToeAg00'
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[PREPAY PAGE] Pay button clicked')
    console.log('[PREPAY PAGE] Timestamp:', new Date().toISOString())
    console.log('[PREPAY PAGE] Redirecting to Stripe payment...')
    console.log('[PREPAY PAGE] Payment URL:', stripeUrl)
    console.log('[PREPAY PAGE] Expected return URL: http://localhost:3000/result')
    console.log('[PREPAY PAGE] Pending transcription:', !!localStorage.getItem('pendingTranscription'))
    console.log('[PREPAY PAGE] Pending mood payment flag set: true')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Redirect to Stripe
    window.location.href = stripeUrl
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Preview Your Analysis</h1>
        <p className={styles.description}>
          Free preview • Pay to unlock Mood Analysis
        </p>

        {isProcessing && (
          <div className={styles.processing}>
            <div className={styles.loader}></div>
            <p>Analyzing your recording...</p>
            <p className={styles.subtext}>Preparing free preview</p>
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
                <div className={styles.paymentRequired}>
                  <p className={styles.lockMessage}>🔒 Premium Feature</p>
                  <p className={styles.payDescription}>
                    Unlock detailed mood analysis to understand the emotional tone of your recording.
                  </p>
                  <button
                    onClick={handlePayment}
                    className={styles.payButton}
                  >
                    💳 Pay to Unlock Mood Analysis
                  </button>
                </div>
              </div>

              <div className={styles.agentCard}>
                <h3>💭 Sentiment Analysis</h3>
                <div className={styles.freeFeature}>
                  <span className={styles.freeBadge}>✨ FREE</span>
                </div>
                <p>{results.sentiment}</p>
              </div>

              <div className={styles.agentCard}>
                <h3>📊 Summary</h3>
                <div className={styles.freeFeature}>
                  <span className={styles.freeBadge}>✨ FREE</span>
                </div>
                <p>{results.summary}</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className={`${styles.button} ${styles.secondaryButton}`}
              style={{ marginTop: '2rem' }}
            >
              ← Record Another (Skip Payment)
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

