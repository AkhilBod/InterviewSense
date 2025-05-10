import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { company, role, difficulty } = await req.json();

    // Use Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prompt: Use real LeetCode questions, include problem number, and format exactly like LeetCode
    const prompt = `Generate a LeetCode-style coding question for a ${difficulty} difficulty ${role} interview at ${company}.
The problem should be highly relevant to the role and company—use realistic scenarios, data, or technologies that are common for this role at this company.
Do not invent or make up your own questions. Select a real, existing LeetCode question that matches the criteria above, and use its actual title, LeetCode problem number, statement, examples, and constraints. If the problem is a database/SQL question, include the table schemas and sample data in ASCII table format, just like on LeetCode.
Do not reference LeetCode or the source in your output—just present the problem as if it were original.
Your output should include ONLY:
- The LeetCode problem number and title (e.g., "3. Longest Substring Without Repeating Characters")
- The full problem statement
- All table schemas (if relevant), formatted as ASCII tables
- At least 2-3 fully worked-out examples, each with both input and output clearly shown, and an explanation if needed
- Constraints

Format it exactly like a real LeetCode problem. Do NOT include solution templates, explanations, or any meta-comments. Do not use markdown formatting.`;

    // Generate the question
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const question = response.text();

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
} 