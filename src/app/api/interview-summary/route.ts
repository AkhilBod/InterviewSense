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

    const { answersArray, jobDetails, resumeText } = await request.json();

    if (!answersArray || !Array.isArray(answersArray) || answersArray.length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    const hasResume = resumeText && resumeText.trim() !== '';
    const combinedAnswerText = answersArray
      .map((a: any) => `Q: ${a.question}\nA: ${a.answer}`)
      .join('\n\n');

    const prompt = hasResume
      ? `Analyze this entire interview and provide a comprehensive summary. I'll also provide the candidate's resume to help you give more personalized feedback that considers their background and experience.

Combined Interview Answers:
${combinedAnswerText}

Job Details:
Role: ${jobDetails.jobTitle}
Company: ${jobDetails.company || 'Not specified'}${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? `\nIndustry: ${jobDetails.industry}` : ''}
Experience Level: ${jobDetails.experienceLevel}
Interview Type: ${jobDetails.interviewType}
Interview Stage: ${jobDetails.interviewStage}

Candidate Resume:
${resumeText}

Based on both the interview answers and the candidate's resume, provide a comprehensive interview summary in the following JSON format:

{
  "jobRole": "${jobDetails.jobTitle}",
  "company": "${jobDetails.company || 'Not specified'}",
  "date": "${new Date().toISOString()}",
  "duration": "CALCULATE_DURATION_MINUTES",
  "overallScore": <0-100>,
  "strengthAreas": ["strength1", "strength2", "strength3"],
  "improvementAreas": ["improvement1", "improvement2", "improvement3"],
  "completedQuestions": ${answersArray.length},
  "questionScores": [
    {"id": 1, "question": "Question text 1", "score": <0-100>},
    {"id": 2, "question": "Question text 2", "score": <0-100>}
  ],
  "fillerWordStats": {
    "total": <number>,
    "mostCommon": "<most common filler word>"
  },
  "keywordStats": {
    "matched": <number>,
    "missed": <number>,
    "mostImpactful": ["keyword1", "keyword2", "keyword3"]
  }
}

Return ONLY the JSON without any markdown formatting or additional text.`
      : `Analyze this entire interview and provide a comprehensive summary.

Combined Interview Answers:
${combinedAnswerText}

Job Details:
Role: ${jobDetails.jobTitle}
Company: ${jobDetails.company || 'Not specified'}${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? `\nIndustry: ${jobDetails.industry}` : ''}
Experience Level: ${jobDetails.experienceLevel}
Interview Type: ${jobDetails.interviewType}
Interview Stage: ${jobDetails.interviewStage}

Provide a comprehensive interview summary in the following JSON format:

{
  "jobRole": "${jobDetails.jobTitle}",
  "company": "${jobDetails.company || 'Not specified'}",
  "date": "${new Date().toISOString()}",
  "duration": "CALCULATE_DURATION_MINUTES",
  "overallScore": <0-100>,
  "strengthAreas": ["strength1", "strength2", "strength3"],
  "improvementAreas": ["improvement1", "improvement2", "improvement3"],
  "completedQuestions": ${answersArray.length},
  "questionScores": [
    {"id": 1, "question": "Question text 1", "score": <0-100>},
    {"id": 2, "question": "Question text 2", "score": <0-100>}
  ],
  "fillerWordStats": {
    "total": <number>,
    "mostCommon": "<most common filler word>"
  },
  "keywordStats": {
    "matched": <number>,
    "missed": <number>,
    "mostImpactful": ["keyword1", "keyword2", "keyword3"]
  }
}

Return ONLY the JSON without any markdown formatting or additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_completion_tokens: 2048,
    });

    const text = completion.choices[0].message.content || '';
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const summary = JSON.parse(cleanText);

    // Format the date
    summary.date = new Date().toLocaleDateString();

    // Calculate duration if needed
    if (summary.duration === 'CALCULATE_DURATION_MINUTES') {
      const minutes = Math.max(
        15,
        Math.min(60, answersArray.length * 4 + Math.floor(Math.random() * 10))
      );
      summary.duration = `${minutes} minutes`;
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Error generating interview summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
