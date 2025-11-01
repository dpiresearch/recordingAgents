import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger, measureTime } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const requestId = `sentiment_${Date.now()}`
  
  logger.info('SentimentAgent', 'Sentiment analysis request received', undefined, { requestId })

  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.error('SentimentAgent', 'API key not configured', undefined, { requestId })
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { transcription } = await request.json()

    if (!transcription) {
      logger.warn('SentimentAgent', 'No transcription provided', { requestId })
      return NextResponse.json(
        { error: 'No transcription provided' },
        { status: 400 }
      )
    }

    logger.info('SentimentAgent', 'Starting GPT-4 sentiment analysis', undefined, {
      requestId,
      transcriptionLength: transcription.length,
    })

    const { result: completion, duration } = await measureTime(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a sentiment analysis expert specializing in emotional state detection. 
            Analyze the following transcription and determine the speaker's emotional state.
            Focus on detecting if the speaker is: nervous, happy, sad, angry, fearful, confident, uncertain, or other emotional states.
            Provide a detailed sentiment analysis in 2-3 sentences with specific emotional indicators you detected.`
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

    const sentiment = completion.choices[0]?.message?.content || 'Unable to determine sentiment'

    logger.info('SentimentAgent', 'GPT-4 sentiment analysis completed', duration, {
      requestId,
      tokensUsed: completion.usage?.total_tokens,
      sentimentLength: sentiment.length,
    })

    return NextResponse.json({ sentiment })
  } catch (error: any) {
    logger.error('SentimentAgent', 'Sentiment analysis failed', error, {
      requestId,
      errorStatus: error?.status,
      errorCode: error?.code,
    })
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze sentiment' },
      { status: 500 }
    )
  }
}

export const maxDuration = 20

