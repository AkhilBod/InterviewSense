import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check what Gemini API keys are available
  const envVars = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET',
    GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2 ? 'SET' : 'NOT SET',
    GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3 ? 'SET' : 'NOT SET',
    GEMINI_API_KEY_4: process.env.GEMINI_API_KEY_4 ? 'SET' : 'NOT SET',
    GEMINI_API_KEY_5: process.env.GEMINI_API_KEY_5 ? 'SET' : 'NOT SET',
  };

  // Show first few characters of each key for debugging (safely)
  const keyPreviews = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING',
    GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2 ? process.env.GEMINI_API_KEY_2.substring(0, 10) + '...' : 'MISSING',
    GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3 ? process.env.GEMINI_API_KEY_3.substring(0, 10) + '...' : 'MISSING',
    GEMINI_API_KEY_4: process.env.GEMINI_API_KEY_4 ? process.env.GEMINI_API_KEY_4.substring(0, 10) + '...' : 'MISSING',
    GEMINI_API_KEY_5: process.env.GEMINI_API_KEY_5 ? process.env.GEMINI_API_KEY_5.substring(0, 10) + '...' : 'MISSING',
  };

  return NextResponse.json({
    success: true,
    envStatus: envVars,
    keyPreviews: keyPreviews,
    totalKeysFound: Object.values(envVars).filter(v => v === 'SET').length
  });
} 