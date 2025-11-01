import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger, measureTime } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const requestId = `summary_${Date.now()}`
  
  logger.info('SummaryAgent', 'Summary request received', undefined, { requestId })

  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.error('SummaryAgent', 'API key not configured', undefined, { requestId })
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { transcription } = await request.json()

    if (!transcription) {
      logger.warn('SummaryAgent', 'No transcription provided', { requestId })
      return NextResponse.json(
        { error: 'No transcription provided' },
        { status: 400 }
      )
    }

    logger.info('SummaryAgent', 'Starting GPT-4 summary generation', undefined, {
      requestId,
      transcriptionLength: transcription.length,
    })

    const { result: completion, duration } = await measureTime(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert at summarizing spoken content. 
            Create a concise, clear summary of the following transcription.
            Capture the main points, key ideas, and important details.
            Keep the summary to 2-4 sentences and maintain the speaker's intent.`
          },
          {
            role: 'user',
            content: transcription
          }
        ],
        temperature: 0.5,
        max_tokens: 250,
      })
    })

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary'

    logger.info('SummaryAgent', 'GPT-4 summary generation completed', duration, {
      requestId,
      tokensUsed: completion.usage?.total_tokens,
      summaryLength: summary.length,
    })

    return NextResponse.json({ summary })
  } catch (error: any) {
    logger.error('SummaryAgent', 'Summary generation failed', error, {
      requestId,
      errorStatus: error?.status,
      errorCode: error?.code,
    })
    return NextResponse.json(
      { error: error?.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

export const maxDuration = 20

