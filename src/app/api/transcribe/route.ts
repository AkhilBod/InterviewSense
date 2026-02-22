import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    console.log('Transcribing audio, size:', Math.round(audioFile.size / 1024), 'KB');

    // Transcribe audio using OpenAI Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    const transcription = transcriptionResponse.text;

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json({
        success: true,
        transcription: '[No eligible speech detected]',
        analysis: {
          clarity: '0/10 - No speech detected',
          pace: '0/10 - No speech detected',
          confidence: '0/10 - No speech detected',
        },
        filler_words: [],
        sentiment: { tone: 'neutral', confidence: 0 },
      });
    }

    // Analyze the transcription for speaking style
    const analysisPrompt = `You are an expert interview coach analyzing a candidate's response. Given the following interview response transcript, provide detailed analysis in JSON format:

Transcript:
"${transcription}"

Analyze:
1. Clarity: Rate 1-10 how clear and well-articulated the response is
2. Pace: Rate 1-10 the speaking pace (too fast, too slow, or just right)
3. Confidence: Rate 1-10 how confident the candidate sounds
4. Identify filler words (um, uh, like, you know, etc.) and their count
5. Sentiment: Determine if the tone is positive, neutral, or negative

Return ONLY this JSON format with no other text:
{
  "analysis": {
    "clarity": "Rating from 1-10 with brief explanation",
    "pace": "Rating from 1-10 with brief explanation",
    "confidence": "Rating from 1-10 with brief explanation"
  },
  "filler_words": [
    {"word": "um", "count": 2},
    {"word": "like", "count": 1}
  ],
  "sentiment": {"tone": "positive/neutral/negative", "confidence": 0.85}
}`;

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
      max_completion_tokens: 1024,
    });

    let analysisText = analysisResponse.choices[0].message.content || '{}';

    try {
      const cleanText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      const analysisResult = JSON.parse(cleanText);

      return NextResponse.json({
        success: true,
        transcription,
        analysis: analysisResult.analysis || {
          clarity: 'Unable to analyze',
          pace: 'Unable to analyze',
          confidence: 'Unable to analyze',
        },
        filler_words: analysisResult.filler_words || [],
        sentiment: analysisResult.sentiment || { tone: 'neutral', confidence: 0.5 },
      });
    } catch (parseError) {
      console.error('Failed to parse analysis response:', parseError);
      return NextResponse.json({
        success: true,
        transcription,
        analysis: {
          clarity: 'Analysis unavailable',
          pace: 'Analysis unavailable',
          confidence: 'Analysis unavailable',
        },
        filler_words: [],
        sentiment: { tone: 'neutral', confidence: 0.5 },
      });
    }
  } catch (error) {
    console.error('Transcription error:', error);

    let errorType = 'SERVICE_UNAVAILABLE';
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('quota') || msg.includes('limit') || msg.includes('429')) {
        errorType = 'QUOTA_EXCEEDED';
      } else if (msg.includes('authentication') || msg.includes('401')) {
        errorType = 'AUTHENTICATION_ERROR';
      }
    }

    return NextResponse.json(
      { error: errorType, message: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}
