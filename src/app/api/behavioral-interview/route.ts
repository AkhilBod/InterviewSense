import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressService } from "@/lib/progress";
import { generateContentWithRetry, getFallbackResponse } from '@/lib/gemini-utils';

// Generate behavioral interview questions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company, role, numberOfQuestions = 5 } = await req.json();

    // Prompt for generating behavioral questions
    const prompt = `Generate ${numberOfQuestions} behavioral interview questions for a ${role} position at ${company}.
The questions should be relevant to the role and company culture, focusing on past experiences and situations that demonstrate key competencies for the position.
Format the response as a JSON array of questions.
Each question should be challenging but fair, and should help the interviewer understand the candidate's soft skills, problem-solving abilities, teamwork, leadership, and adaptability.
Return ONLY the array of questions with no additional text.`;

    // Use the robust Gemini manager
    const questionsText = await generateContentWithRetry(
      prompt,
      { model: "gemini-2.0-flash" }
    );
    // Sometimes Gemini might wrap the JSON in markdown code blocks or add extra text
    // Try to extract just the JSON part
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/;
    const match = questionsText.match(jsonRegex);
    const cleanQuestions = match ? (match[1] || match[2]) : questionsText;
    return NextResponse.json({ questions: cleanQuestions });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Analyze the submitted behavioral interview answers
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { 
      company, 
      role, 
      questions,
      answers 
    } = await req.json();

    // Prepare the Q&A pairs for analysis
    const qaPairs = questions.map((q: string, i: number) => `Question: ${q}\nAnswer: ${answers[i]}`).join('\n\n');

    // Prompt for answers analysis
    const analysisPrompt = `
You are a behavioral interview expert for ${company} evaluating a candidate for a ${role} position.
The candidate has provided answers to the following behavioral interview questions:

${qaPairs}

Please analyze the answers and provide:
1. A score for each answer (0-100) based on clarity, relevance, structure (STAR method), and specificity
2. Overall score (0-100)
3. 2-3 specific strengths demonstrated across all answers
4. 2-3 specific areas for improvement
5. Detailed feedback on each answer
6. General advice to improve behavioral interviewing skills

Format your response as valid JSON with the following structure:
{
  "answerScores": number[],
  "overallScore": number,
  "strengths": string[],
  "improvementAreas": string[],
  "detailedFeedback": string[],
  "generalAdvice": string
}
`;

    // Use the robust Gemini manager
    const analysisText = await generateContentWithRetry(
      analysisPrompt,
      { model: "gemini-2.0-flash" }
    );
    // Try to extract just the JSON part
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
    const match = analysisText.match(jsonRegex);
    const cleanAnalysis = match ? (match[1] || match[2]) : analysisText;
    return NextResponse.json({ analysis: cleanAnalysis });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
