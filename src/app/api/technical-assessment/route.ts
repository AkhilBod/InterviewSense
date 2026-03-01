import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressService } from "@/lib/progress";
import { hasEnoughCredits, deductCredits } from '@/lib/credits';
import { FeatureType } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// ── Local LeetCode problem lookup ────────────────────────────────────────────
interface LCProblem {
  frontendQuestionId: string;
  title: string;
  difficulty: string;
  description: string;
  hints?: string[];
  topics?: string[];
  paidOnly?: boolean;
}

let _problemsCache: LCProblem[] | null = null;
let _problemsMapCache: Map<number, LCProblem> | null = null;

function getProblemsMap(): Map<number, LCProblem> {
  if (_problemsMapCache) return _problemsMapCache;
  const filePath = path.join(process.cwd(), 'leetcode_problems.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  _problemsCache = JSON.parse(raw) as LCProblem[];
  _problemsMapCache = new Map(
    _problemsCache.map(p => [parseInt(p.frontendQuestionId), p])
  );
  return _problemsMapCache;
}

/** Max problem ID available in leetcode_problems.json */
export const MAX_LEETCODE_ID = 3549;

/** Strip HTML tags and decode common entities from description */
function stripHtml(html: string): string {
  return html
    .replace(/<pre>([\s\S]*?)<\/pre>/gi, (_, inner) =>
      '\n' + inner.replace(/<[^>]+>/g, '').trim() + '\n'
    )
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Format a problem entry into the markdown format the rest of the app expects */
function formatProblemFromJson(p: LCProblem): string {
  const desc = stripHtml(p.description || '');
  const hints = (p.hints || []).length > 0
    ? '\n\n**Hints:**\n' + p.hints!.map(h => `• ${stripHtml(h)}`).join('\n')
    : '';
  return `# ${p.frontendQuestionId}. ${p.title}\n\n**Difficulty:** ${p.difficulty}\n\n${desc}${hints}`;
}

/** Look up problem by ID. Returns formatted string or null if not found. */
function lookupProblem(id: number): string | null {
  const map = getProblemsMap();
  const p = map.get(id);
  if (!p) return null;
  return formatProblemFromJson(p);
}

// Language-specific function templates (used for solution generation only)
const languageTemplates: Record<string, string> = {
  javascript: "function solution(params) {\n  // Implementation\n}",
  python: "def solution(params):\n    # Implementation\n    pass",
  java: "public class Solution {\n    public Type solution(params) {\n        // Implementation\n    }\n}",
  cpp: "class Solution {\npublic:\n    Type solution(params) {\n        // Implementation\n    }\n};",
  typescript: "function solution(params): ReturnType {\n  // Implementation\n}",
  go: "func solution(params Type) ReturnType {\n    // Implementation\n}",
  rust: "impl Solution {\n    pub fn solution(params: Type) -> ReturnType {\n        // Implementation\n    }\n}",
  csharp: "public class Solution {\n    public Type Solution(params) {\n        // Implementation\n    }\n}"
};


// Generate a technical interview question
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check credits
    const creditCheck = await hasEnoughCredits(user.id, FeatureType.TECHNICAL_INTERVIEW);
    if (!creditCheck.hasCredits) {
      return NextResponse.json({
        error: 'Insufficient credits',
        message: `You need ${creditCheck.required} credits but only have ${creditCheck.available} remaining today.`,
        creditsAvailable: creditCheck.available,
        creditsRequired: creditCheck.required,
      }, { status: 402 });
    }

    const {
      company,
      role,
      difficulty,
      useCustomNumber,
      leetcodeNumber,
      generateSolutions,
      language = 'javascript',
      prompt: customPrompt,
    } = await req.json();

    // ── Solution generation (still uses AI) ───────────────────────────────
    if (generateSolutions) {
      const prompt = `You are an expert software engineer providing multiple solution approaches for this LeetCode problem:

${customPrompt}

Generate exactly 3 different solution approaches, from brute force to optimal. For each approach, provide:
1. A clear description of the approach and algorithm
2. Precise time and space complexity
3. Complete, runnable code implementation in ${language}
4. Key insights and trade-offs

Use this template for the ${language} solution:
${languageTemplates[language] || languageTemplates['javascript']}

Return ONLY a JSON array in this exact format (no other text):
[
  {
    "approach": "Detailed description",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "code": "Complete runnable code in ${language}",
    "insights": "Key insights and trade-offs"
  }
]`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_completion_tokens: 2048,
      });

      let responseText = (completion.choices[0].message.content || '').trim()
        .replace(/```json\s*|\s*```/g, '');

      const solutions = JSON.parse(responseText);
      if (!Array.isArray(solutions) || solutions.length < 2) {
        throw new Error('Failed to generate valid solutions.');
      }

      const deduction = await deductCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 1);
      return NextResponse.json({
        success: true,
        question: responseText,
        creditsRemaining: deduction.remainingCredits,
      });
    }

    // ── Specific problem: look up by ID from local JSON, no AI call ───────
    if (useCustomNumber && leetcodeNumber) {
      const id = parseInt(String(leetcodeNumber));
      if (isNaN(id) || id < 1 || id > MAX_LEETCODE_ID) {
        return NextResponse.json({
          success: false,
          error: `Problem #${leetcodeNumber} is out of range. Valid range: 1–${MAX_LEETCODE_ID}.`,
        }, { status: 400 });
      }
      const problem = lookupProblem(id);
      if (!problem) {
        return NextResponse.json({
          success: false,
          error: `Problem #${id} not found in the database.`,
        }, { status: 404 });
      }
      const deduction = await deductCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 1);
      const lcProblem = getProblemsMap().get(id)!;
      return NextResponse.json({
        success: true,
        question: problem,
        problemId: id,
        topics: lcProblem.topics || [],
        creditsRemaining: deduction.remainingCredits,
      });
    }

    // ── AI mode: ask AI for a problem number, then pull from JSON ─────────
    const aiPrompt = `You are a technical interview assistant. Choose ONE LeetCode problem number (integer between 1 and ${MAX_LEETCODE_ID}) that is:
- Appropriate difficulty: ${difficulty}
- Relevant to role: ${role || 'Software Engineer'}
- Relevant to company: ${company || 'a tech company'}
- Not trivially simple, not overly obscure

Respond with ONLY the integer problem number. No explanation. No text. Just the number.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: aiPrompt }],
      temperature: 0.5,
      max_completion_tokens: 10,
    });

    const raw = (completion.choices[0].message.content || '').trim();
    const chosenId = parseInt(raw.replace(/\D/g, ''));

    if (isNaN(chosenId) || chosenId < 1 || chosenId > MAX_LEETCODE_ID) {
      throw new Error(`AI returned an invalid problem number: "${raw}"`);
    }

    const problem = lookupProblem(chosenId);
    if (!problem) {
      throw new Error(`Problem #${chosenId} not found in local database.`);
    }

    const deduction = await deductCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 1);
    const chosenProblem = getProblemsMap().get(chosenId)!;
    return NextResponse.json({
      success: true,
      question: problem,
      problemId: chosenId,
      topics: chosenProblem.topics || [],
      creditsRemaining: deduction.remainingCredits,
    });

  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate question',
      },
      { status: 500 }
    );
  }
}

// Analyze the submitted code solution and explanation
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      company, 
      role, 
      difficulty, 
      question, 
      code,
      language = 'javascript', // Default to JavaScript if not specified
      explanation 
    } = await req.json();

    // Language-specific best practices
    const languageBestPractices = {
      javascript: `
- Use of modern ES6+ features when appropriate
- Proper variable declarations (const/let)
- Clear function and variable naming
- Efficient use of built-in methods
- Proper error handling`,
      python: `
- Use of Pythonic idioms (list comprehensions, generators)
- PEP 8 style guide compliance
- Clear function and variable naming
- Efficient use of built-in methods
- Proper error handling`,
      java: `
- Object-oriented principles
- Clear class and method organization
- Proper exception handling
- Efficient collection usage
- Clean code practices`,
      cpp: `
- Memory management best practices
- STL usage when appropriate
- Clear class and function design
- Exception safety
- Efficient algorithm implementation`,
      typescript: `
- Strong type definitions
- Interface and type usage
- Modern ES6+ features
- Proper error handling
- Clean code practices`,
      go: `
- Idiomatic Go patterns
- Error handling patterns
- Proper package organization
- Efficient concurrency
- Clean code practices`,
      rust: `
- Memory safety practices
- Proper error handling
- Trait implementation
- Efficient algorithms
- Clean code practices`,
      csharp: `
- C# conventions and patterns
- LINQ usage when appropriate
- Exception handling
- Clean code practices
- Efficient implementation`
    };

    const prompt = `You are an expert code reviewer analyzing a ${language} solution to this LeetCode problem:

${question}

The submitted solution is:

${code}

The candidate's explanation is:

${explanation}

Analyze the solution for:
1. Correctness - Does it solve the problem and handle edge cases?
2. Time & Space Complexity - Is it optimal?
3. Code Quality - Following these ${language} best practices:
${languageBestPractices[language as keyof typeof languageBestPractices]}

Provide your analysis in this JSON format (no other text):
{
  "isCorrect": boolean,
  "correctnessAnalysis": "Detailed analysis of solution correctness",
  "timeComplexity": "Big O notation with explanation",
  "spaceComplexity": "Big O notation with explanation",
  "codeQuality": "Analysis of code quality and best practices",
  "suggestedImprovements": "Specific suggestions for improvement"
}`;

    // Generate the response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_completion_tokens: 2048,
    });

    let responseText = completion.choices[0].message.content || '';

    try {
      // Clean up the response text
      responseText = responseText.trim();
      // Remove any markdown code blocks
      responseText = responseText.replace(/```json\s*|\s*```/g, '');
      // Parse the JSON to validate it
      const analysis = JSON.parse(responseText);
      
      // Validate required fields
      if (!analysis.isCorrect && analysis.isCorrect !== false) {
        throw new Error('Analysis response missing isCorrect field');
      }

      // Transform the API response to match frontend expectations
      const transformedResponse = {
        success: true,
        overallScore: analysis.isCorrect ? 85 : 45, // Base score on correctness
        strengths: analysis.codeQuality ? 
          analysis.codeQuality.split('.').filter(s => s.trim() && !s.toLowerCase().includes('improvement')).slice(0, 3) :
          ["Code submitted successfully"],
        improvementAreas: analysis.suggestedImprovements ? 
          analysis.suggestedImprovements.split('.').filter(s => s.trim()).slice(0, 3) :
          ["Consider reviewing the solution"],
        codeFeedback: analysis.correctnessAnalysis || "Solution analyzed",
        explanationFeedback: `Time Complexity: ${analysis.timeComplexity || "Not analyzed"}. Space Complexity: ${analysis.spaceComplexity || "Not analyzed"}`,
        codeScore: analysis.isCorrect ? 80 : 40,
        explanationScore: 75, // Default score
        analysis: analysis // Keep original analysis for detailed view
      };

      return NextResponse.json(transformedResponse);
    } catch (error) {
      console.error('Error parsing analysis:', error);
      
      // Return a fallback response instead of throwing an error
      return NextResponse.json({
        success: true,
        overallScore: 50,
        strengths: ["Code submitted successfully"],
        improvementAreas: ["Consider reviewing and optimizing the solution"],
        codeFeedback: "Unable to analyze code automatically. Please review manually.",
        explanationFeedback: "Unable to analyze explanation automatically.",
        codeScore: 50,
        explanationScore: 50
      });
    }
  } catch (error) {
    console.error('Error analyzing solution:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze solution',
        overallScore: 50,
        strengths: ["Code submitted successfully"],
        improvementAreas: ["Unable to analyze automatically. Please review your solution."],
        codeFeedback: "Analysis failed - please try again later",
        explanationFeedback: "Analysis failed - please try again later",
        codeScore: 50,
        explanationScore: 50
      },
      { status: 500 }
    );
  }
}
