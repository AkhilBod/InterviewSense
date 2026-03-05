import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing cron job...')
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      return NextResponse.json({ 
        error: 'CRON_SECRET not found in environment variables' 
      }, { status: 500 })
    }

    // Test the cron job endpoint
    const response = await fetch(`${baseUrl}/api/sync-internships`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      cronResponse: result,
      timestamp: new Date().toISOString(),
      baseUrl,
      hasSecret: !!cronSecret
    })
    
  } catch (error) {
    console.error('Test cron error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}