import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressService } from "@/lib/progress";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Generate behavioral interview questions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company, role, numberOfQuestions = 5 } = await req.json();

    // Use Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prompt for generating behavioral questions
    const prompt = `Generate ${numberOfQuestions} behavioral interview questions for a ${role} position at ${company}.
The questions should be relevant to the role and company culture, focusing on past experiences and situations that demonstrate key competencies for the position.
Format the response as a JSON array of questions.
Each question should be challenging but fair, and should help the interviewer understand the candidate's soft skills, problem-solving abilities, teamwork, leadership, and adaptability.
Return ONLY the array of questions with no additional text.`;

    // Generate the questions
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questionsText = response.text();
    
    // Sometimes Gemini might wrap the JSON in markdown code blocks or add extra text
    // Try to extract just the JSON part
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/;
    const match = questionsText.match(jsonRegex);
    if (match) {
      questionsText = match[1] || match[2];
    }
    
    try {
      const questions = JSON.parse(questionsText);
      return NextResponse.json({ questions });
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse questions result' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating behavioral questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate behavioral interview questions' },
      { status: 500 }
    );
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

    // Use Gemini 2.0 Flash for faster analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    // Generate the analysis
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    let analysisText = response.text();
    
    // Try to extract just the JSON part
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
    const match = analysisText.match(jsonRegex);
    if (match) {
      analysisText = match[1] || match[2];
    }
    
    try {
      const analysis = JSON.parse(analysisText);
      
      // Ensure all expected fields are available
      const validatedAnalysis = {
        answerScores: Array.isArray(analysis.answerScores) ? analysis.answerScores : questions.map(() => 0),
        overallScore: analysis.overallScore || 0,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : ["Good effort"],
        improvementAreas: Array.isArray(analysis.improvementAreas) ? analysis.improvementAreas : ["Practice more structured responses"],
        detailedFeedback: Array.isArray(analysis.detailedFeedback) ? analysis.detailedFeedback : questions.map(() => "No specific feedback available."),
        generalAdvice: analysis.generalAdvice || "Practice using the STAR method (Situation, Task, Action, Result) to structure your responses."
      };
      
      // Track progress for behavioral interview completion
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true }
        });
        
        if (user) {
          // Check for recent duplicate sessions (within 30 seconds) to prevent duplicates
          const recentSession = await prisma.interviewSession.findFirst({
            where: {
              userId: user.id,
              type: 'behavioral',
              completedAt: {
                gte: new Date(Date.now() - 30000) // 30 seconds ago
              }
            },
            orderBy: { completedAt: 'desc' }
          });
          
          if (!recentSession) {
            await ProgressService.updateInterviewProgress(user.id, {
              type: 'behavioral',
              score: validatedAnalysis.overallScore,
              fillerWords: 0, // Not tracked in behavioral interviews
              duration: 0, // Could be tracked if needed
              metrics: {
                questionsAnswered: questions.length,
                averageAnswerScore: validatedAnalysis.answerScores.reduce((a: number, b: number) => a + b, 0) / validatedAnalysis.answerScores.length
              }
            });
            console.log('🎯 Progress tracked for behavioral interview');
          } else {
            console.log('⚠️ Duplicate behavioral interview session prevented');
          }
        }
      } catch (progressError) {
        console.error('Error tracking progress:', progressError);
        // Don't fail the main request if progress tracking fails
      }
      
      return NextResponse.json(validatedAnalysis);
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse analysis result' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error analyzing behavioral answers:', error);
    return NextResponse.json(
      { error: 'Failed to analyze behavioral interview answers' },
      { status: 500 }
    );
  }
}
