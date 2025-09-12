import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
        response: "Sample answer: Focus on a specific situation where you demonstrated the relevant skill. Use the STAR method (Situation, Task, Action, Result) to structure your response, and highlight what you learned from the experience."
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Combine system prompt and user prompt if system prompt is provided
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const solution = response.text()

    return NextResponse.json({ 
      success: true,
      response: solution 
    })
    
  } catch (error) {
    console.error('Error generating behavioral solution:', error)
    
    // Return a fallback solution instead of an error
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: "Sample answer: Focus on a specific situation where you demonstrated the relevant skill. Use the STAR method (Situation, Task, Action, Result) to structure your response, and highlight what you learned from the experience."
    })
  }
}
