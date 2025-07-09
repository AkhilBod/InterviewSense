import { NextRequest, NextResponse } from 'next/server'
import { generateContentWithRetry, getFallbackResponse } from '@/lib/gemini-utils'

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json({ 
        success: false,
        error: 'API key not configured',
        response: getFallbackResponse('behavioral')
      })
    }

    // Combine system prompt and user prompt if system prompt is provided
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

    const solution = await generateContentWithRetry(
      fullPrompt,
      {
        model: "gemini-2.0-flash",
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000
      }
    )

    return NextResponse.json({ 
      success: true,
      response: solution 
    })
    
  } catch (error) {
    console.error('Error generating behavioral solution:', error)
    
    // Return a fallback solution instead of an error
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Service temporarily unavailable',
      response: getFallbackResponse('behavioral')
    })
  }
}
