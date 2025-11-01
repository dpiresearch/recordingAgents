import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger, measureTime } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const requestId = `mood_${Date.now()}`
  
  logger.info('MoodAgent', 'Mood analysis request received', undefined, { requestId })

  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.error('MoodAgent', 'API key not configured', undefined, { requestId })
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { transcription } = await request.json()

    if (!transcription) {
      logger.warn('MoodAgent', 'No transcription provided', { requestId })
      return NextResponse.json(
        { error: 'No transcription provided' },
        { status: 400 }
      )
    }

    logger.info('MoodAgent', 'Starting GPT-4 mood analysis', undefined, {
      requestId,
      transcriptionLength: transcription.length,
    })

    const { result: completion, duration } = await measureTime(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a mood analysis expert. Analyze the following transcription and determine the overall mood of the speaker. 
            Consider factors like: tone, word choice, energy level, and emotional indicators.
            Provide a detailed mood analysis in 2-3 sentences. Be specific about the mood (e.g., enthusiastic, contemplative, frustrated, excited, calm, anxious, etc.).`
          },
          {
            role: 'user',
            content: transcription
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      })
    })

    const mood = completion.choices[0]?.message?.content || 'Unable to determine mood'

    logger.info('MoodAgent', 'GPT-4 mood analysis completed', duration, {
      requestId,
      tokensUsed: completion.usage?.total_tokens,
      moodLength: mood.length,
    })

    return NextResponse.json({ mood })
  } catch (error: any) {
    logger.error('MoodAgent', 'Mood analysis failed', error, {
      requestId,
      errorStatus: error?.status,
      errorCode: error?.code,
    })
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze mood' },
      { status: 500 }
    )
  }
}

export const maxDuration = 20

