import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const CREDIT_COST_BEHAVIORAL = 2;

// Generate behavioral interview questions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deduct credits for generating behavioral questions
    try {
        const creditResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/user/credits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ featureType: 'behavioral' }),
        });

        if (!creditResponse.ok) {
            const errorData = await creditResponse.json();
            if (creditResponse.status === 402) {
                return NextResponse.json({ error: "Insufficient credits to generate behavioral interview questions." }, { status: 402 });
            }
            return NextResponse.json({ error: errorData.error || "Failed to deduct credits." }, { status: creditResponse.status });
        }
    } catch (creditError) {
        console.error("Credit deduction error (POST behavioral-interview):", creditError);
        return NextResponse.json({ error: "Failed to process credit deduction." }, { status: 500 });
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
    
    // Deduct credits for analyzing behavioral interview answers
    try {
        const creditResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/user/credits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ featureType: 'behavioral' }),
        });

        if (!creditResponse.ok) {
            const errorData = await creditResponse.json();
            if (creditResponse.status === 402) {
                return NextResponse.json({ error: "Insufficient credits to analyze behavioral interview answers." }, { status: 402 });
            }
            return NextResponse.json({ error: errorData.error || "Failed to deduct credits for analysis." }, { status: creditResponse.status });
        }
    } catch (creditError) {
        console.error("Credit deduction error (PUT behavioral-interview):", creditError);
        return NextResponse.json({ error: "Failed to process credit deduction for analysis." }, { status: 500 });
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
