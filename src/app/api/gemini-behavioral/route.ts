import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasEnoughCredits, deductCredits } from '@/lib/credits'
import { FeatureType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check credits
    const creditCheck = await hasEnoughCredits(user.id, FeatureType.BEHAVIORAL_PRACTICE)
    if (!creditCheck.hasCredits) {
      return NextResponse.json({
        error: 'Insufficient credits',
        message: `You need ${creditCheck.required} credits but only have ${creditCheck.available} remaining today.`,
        creditsAvailable: creditCheck.available,
        creditsRequired: creditCheck.required,
      }, { status: 402 })
    }

    const { prompt, systemPrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found in environment variables')
      return NextResponse.json({
        success: false,
        error: 'API key not configured',
        response: "Sample answer: Focus on a specific situation where you demonstrated the relevant skill. Use the STAR method (Situation, Task, Action, Result) to structure your response, and highlight what you learned from the experience."
      })
    }

    const openai = new OpenAI({ apiKey })

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano', // Fastest model for quick interview feedback
      messages,
      temperature: 0.7,
      max_completion_tokens: 2048,
    })

    const solution = completion.choices[0].message.content || ''

    // Deduct credits after successful generation
    const deduction = await deductCredits(
      user.id,
      FeatureType.BEHAVIORAL_PRACTICE,
      1,
      { promptLength: prompt.length }
    )

    if (!deduction.success) {
      console.error('Failed to deduct credits:', deduction.error)
    }

    return NextResponse.json({
      success: true,
      response: solution,
      creditsRemaining: deduction.remainingCredits,
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
