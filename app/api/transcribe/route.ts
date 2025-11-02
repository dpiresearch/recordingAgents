import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger, measureTime } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}`
  
  // Dual logging for Vercel
  console.log('[Whisper API] Request received', { requestId, timestamp: new Date().toISOString() })
  logger.info('Whisper', 'Transcription request received', undefined, { requestId })

  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.error('Whisper', 'API key not configured', undefined, { requestId })
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      console.error('[Whisper API] No audio file provided', { requestId })
      logger.warn('Whisper', 'No audio file provided in request', { requestId })
      return NextResponse.json(
        { error: 'No audio file provided', requestId },
        { status: 400 }
      )
    }

    const fileSize = audioFile.size
    const fileType = audioFile.type
    
    logger.info('Whisper', 'Starting OpenAI Whisper API call', undefined, {
      requestId,
      fileSize: `${(fileSize / 1024).toFixed(2)} KB`,
      fileType,
    })

    // Measure the API call duration
    const { result: transcription, duration } = await measureTime(async () => {
      return await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en', // You can make this dynamic or remove for auto-detection
      })
    })

    const transcriptionLength = transcription.text.length

    console.log('[Whisper API] Success', {
      requestId,
      transcriptionLength,
      duration,
    })

    logger.info('Whisper', 'OpenAI Whisper API call completed successfully', duration, {
      requestId,
      transcriptionLength,
      wordsEstimate: transcription.text.split(/\s+/).length,
    })

    return NextResponse.json({
      transcription: transcription.text,
    })
  } catch (error: any) {
    console.error('[Whisper API] Error:', {
      requestId,
      error: error?.message || 'Unknown error',
      errorStatus: error?.status,
      errorCode: error?.code,
      timestamp: new Date().toISOString(),
    })

    logger.error('Whisper', 'Transcription failed', error, {
      requestId,
      errorStatus: error?.status,
      errorCode: error?.code,
    })
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your credentials.', requestId },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to transcribe audio', requestId },
      { status: 500 }
    )
  }
}

// Remove the deprecated config export for Next.js App Router
export const maxDuration = 30 // Maximum duration in seconds for this route

