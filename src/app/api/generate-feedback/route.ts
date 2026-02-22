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

    const { answer, question, jobDetails, resumeText, resumeFileName } = await request.json();

    if (!answer) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
    }

    const hasResume = resumeText && resumeText.trim() !== '';

    const prompt = hasResume
      ? `Analyze this interview answer and provide detailed feedback. I'll also provide the candidate's resume to help you give more personalized feedback that considers their background and experience.

Question: ${question || 'Not provided'}
Answer: "${answer}"
${jobDetails ? `
Role: ${jobDetails.jobTitle || 'Not specified'}${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? `\nIndustry: ${jobDetails.industry}` : ''}
Experience Level: ${jobDetails.experienceLevel || 'Not specified'}
Interview Type: ${jobDetails.interviewType || 'Not specified'}
` : ''}

Candidate Resume (${resumeFileName || 'resume'}):
${resumeText}

Based on both the answer and the candidate's resume, provide a detailed analysis of the interview answer in the following JSON format:

{
  "scores": [
    {"label": "Clarity", "score": <0-100>, "color": "bg-blue-600"},
    {"label": "Conciseness", "score": <0-100>, "color": "bg-emerald-600"},
    {"label": "Confidence", "score": <0-100>, "color": "bg-violet-600"},
    {"label": "Relevance", "score": <0-100>, "color": "bg-amber-600"},
    {"label": "Resume Alignment", "score": <0-100>, "color": "bg-purple-600"}
  ],
  "keywordsDetected": ["keyword1", "keyword2"],
  "keywordsMissing": ["keyword1", "keyword2"],
  "suggestions": [
    {"id": 1, "text": "<improvement suggestion>", "type": "improvement"},
    {"id": 2, "text": "<strength observation>", "type": "strength"},
    {"id": 3, "text": "<keyword suggestion>", "type": "keyword"},
    {"id": 4, "text": "<resume-specific suggestion>", "type": "resume"}
  ],
  "fillerWords": [
    {"word": "<filler word>", "count": <number>}
  ]
}

The scores should be calculated based on:
- Clarity: How well the answer is structured and explained
- Conciseness: How efficiently the response conveys the information
- Confidence: How confident and authoritative the language is
- Relevance: How well the answer addresses the question
- Resume Alignment: How effectively the candidate incorporated relevant experience from their resume

Pay special attention to how the candidate could better leverage their background (from their resume) in their answer. Include at least 2-3 suggestions of type "resume" that tie directly to specific experiences, projects, or skills mentioned in their resume that would strengthen their answer.

Return ONLY the JSON without any markdown formatting or additional text.`
      : `Analyze this interview answer and provide detailed feedback.

Question: ${question || 'Not provided'}
Answer: "${answer}"
${jobDetails ? `
Role: ${jobDetails.jobTitle || 'Not specified'}${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? `\nIndustry: ${jobDetails.industry}` : ''}
Experience Level: ${jobDetails.experienceLevel || 'Not specified'}
Interview Type: ${jobDetails.interviewType || 'Not specified'}
` : ''}

Provide a detailed analysis of the interview answer in the following JSON format:

{
  "scores": [
    {"label": "Clarity", "score": <0-100>, "color": "bg-blue-600"},
    {"label": "Conciseness", "score": <0-100>, "color": "bg-emerald-600"},
    {"label": "Confidence", "score": <0-100>, "color": "bg-violet-600"},
    {"label": "Relevance", "score": <0-100>, "color": "bg-amber-600"}
  ],
  "keywordsDetected": ["keyword1", "keyword2"],
  "keywordsMissing": ["keyword1", "keyword2"],
  "suggestions": [
    {"id": 1, "text": "<improvement suggestion>", "type": "improvement"},
    {"id": 2, "text": "<strength observation>", "type": "strength"},
    {"id": 3, "text": "<keyword suggestion>", "type": "keyword"}
  ],
  "fillerWords": [
    {"word": "<filler word>", "count": <number>}
  ]
}

The scores should be calculated based on:
- Clarity: How well the answer is structured and explained
- Conciseness: How efficiently the response conveys the information
- Confidence: How confident and authoritative the language is
- Relevance: How well the answer addresses the question

Return ONLY the JSON without any markdown formatting or additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_completion_tokens: 2048,
    });

    const text = completion.choices[0].message.content || '';
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const feedback = JSON.parse(cleanText);

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
