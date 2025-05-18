import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Generate a technical interview question
export async function POST(req: Request) {
  try {
    const { company, role, difficulty, useCustomNumber, leetcodeNumber } = await req.json();

    // Use Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt;

    if (useCustomNumber && leetcodeNumber) {
      // If user specified a LeetCode question number
      prompt = `Retrieve LeetCode question number ${leetcodeNumber} and format it.
Do not invent or make up your own question. Provide the actual LeetCode question with this exact number.
Your output should include ONLY:
- The LeetCode problem number and title (e.g., "3. Longest Substring Without Repeating Characters")
- The full problem statement
- All table schemas (if relevant), formatted as ASCII tables
- At least 2-3 fully worked-out examples, each with both input and output clearly shown, and an explanation if needed
- Constraints

Format it exactly like a real LeetCode problem. Do NOT include solution templates, explanations, or any meta-comments. Do not use markdown formatting.`;
    } else {
      // Default prompt for generating a question based on company/role/difficulty
      prompt = `Generate a LeetCode-style coding question for a ${difficulty} difficulty ${role} interview at ${company}.
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
    }

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

// Analyze the submitted code solution and explanation
export async function PUT(req: Request) {
  try {
    const { 
      company, 
      role, 
      difficulty, 
      question, 
      code, 
      explanation 
    } = await req.json();

    // Use Gemini 2.0 Flash for faster analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prompt for code analysis
    const analysisPrompt = `
You are a technical interviewer for ${company} evaluating a candidate for a ${role} position.
The candidate has just solved the following ${difficulty} difficulty coding problem:

${question}

Their code solution is:
\`\`\`
${code}
\`\`\`

Their verbal explanation is:
"${explanation}"

Please analyze both the code and the explanation and provide:
1. A score for the code (0-100) based on correctness, efficiency, readability, and best practices
2. A score for the explanation (0-100) based on clarity, technical depth, and understanding
3. Overall score (0-100)
4. 2-3 specific strengths 
5. 2-3 specific areas for improvement
6. Detailed feedback on the code
7. Detailed feedback on the explanation

Format your response as valid JSON with the following structure:
{
  "codeScore": number,
  "explanationScore": number,
  "overallScore": number,
  "strengths": string[],
  "improvementAreas": string[],
  "codeFeedback": string,
  "explanationFeedback": string
}
`;

    // Generate the analysis
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    let analysisText = response.text();
    
    // Sometimes Gemini might wrap the JSON in markdown code blocks or add extra text
    // Try to extract just the JSON part
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
    const match = analysisText.match(jsonRegex);
    if (match) {
      analysisText = match[1] || match[2];
    }          // Parse the JSON response
    try {
      const analysis = JSON.parse(analysisText);
      
      // Ensure all expected fields are available
      const validatedAnalysis = {
        codeScore: analysis.codeScore || 0,
        explanationScore: analysis.explanationScore || 0,
        overallScore: analysis.overallScore || 0,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : ["Good effort"],
        improvementAreas: Array.isArray(analysis.improvementAreas) ? analysis.improvementAreas : ["Practice more"],
        codeFeedback: analysis.codeFeedback || "No specific code feedback available.",
        explanationFeedback: analysis.explanationFeedback || "No specific explanation feedback available."
      };
      
      console.log("Analysis response validated:", validatedAnalysis);
      return NextResponse.json(validatedAnalysis);
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse analysis result' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error analyzing solution:', error);
    return NextResponse.json(
      { error: 'Failed to analyze solution' },
      { status: 500 }
    );
  }
}