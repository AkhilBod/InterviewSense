import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasEnoughCredits, deductCredits } from '@/lib/credits';
import { logActivity } from '@/lib/activity-logger';
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
  solution_code_python?: string | null;
  solution_code_java?: string | null;
  solution_code_cpp?: string | null;
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
  const desc = p.description
    ? stripHtml(p.description)
    : '*This is a premium LeetCode problem. The full description is not available, but you can attempt it based on the title and hints below.*';
  const hints = (p.hints || []).length > 0
    ? '\n\n**Hints:**\n' + p.hints!.map(h => `• ${stripHtml(h)}`).join('\n')
    : '';
  const topics = (p.topics || []).length > 0
    ? '\n\n**Topics:** ' + p.topics!.join(', ')
    : '';
  return `# ${p.frontendQuestionId}. ${p.title}\n\n**Difficulty:** ${p.difficulty}\n\n${desc}${topics}${hints}`;
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

/** Extract function signature from solution code and generate language-specific code templates */
function generateCodeTemplates(problem: LCProblem): Record<string, string> | null {
  // Try to parse function signatures from the Python solution (most reliable)
  const pyCode = problem.solution_code_python;
  if (!pyCode) return null;

  // Match Python class method: def methodName(self, param1: Type, ...) -> ReturnType:
  const pyMatch = pyCode.match(/def\s+(\w+)\s*\(\s*self\s*,?\s*([^)]*)\)\s*(?:->\s*(.+?))?\s*:/);
  if (!pyMatch) return null;

  const funcName = pyMatch[1];
  const pyParams = pyMatch[2].trim();
  const pyReturnType = pyMatch[3]?.trim() || 'None';

  // Parse parameters
  const params: { name: string; pyType: string }[] = [];
  if (pyParams) {
    for (const part of pyParams.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const [pName, pType] = trimmed.includes(':') ? trimmed.split(':').map(s => s.trim()) : [trimmed, 'any'];
      params.push({ name: pName, pyType: pType });
    }
  }

  // Type mapping helpers
  const pyToJs = (t: string): string => {
    if (/^List\[int\]$/.test(t)) return 'number[]';
    if (/^List\[str\]$/.test(t)) return 'string[]';
    if (/^List\[List\[int\]\]$/.test(t)) return 'number[][]';
    if (/^List\[List\[str\]\]$/.test(t)) return 'string[][]';
    if (/^List\[/.test(t)) return 'any[]';
    if (t === 'int' || t === 'float') return 'number';
    if (t === 'str') return 'string';
    if (t === 'bool') return 'boolean';
    if (t === 'Optional[TreeNode]' || t === 'TreeNode') return 'TreeNode | null';
    if (t === 'Optional[ListNode]' || t === 'ListNode') return 'ListNode | null';
    return 'any';
  };

  const pyToJava = (t: string): string => {
    if (/^List\[int\]$/.test(t)) return 'int[]';
    if (/^List\[str\]$/.test(t)) return 'String[]';
    if (/^List\[List\[int\]\]$/.test(t)) return 'List<List<Integer>>';
    if (/^List\[List\[str\]\]$/.test(t)) return 'List<List<String>>';
    if (/^List\[/.test(t)) return 'List<Object>';
    if (t === 'int') return 'int';
    if (t === 'float') return 'double';
    if (t === 'str') return 'String';
    if (t === 'bool') return 'boolean';
    if (t === 'None' || t === 'void') return 'void';
    if (t === 'TreeNode' || t === 'Optional[TreeNode]') return 'TreeNode';
    if (t === 'ListNode' || t === 'Optional[ListNode]') return 'ListNode';
    return 'Object';
  };

  const pyToCpp = (t: string): string => {
    if (/^List\[int\]$/.test(t)) return 'vector<int>';
    if (/^List\[str\]$/.test(t)) return 'vector<string>';
    if (/^List\[List\[int\]\]$/.test(t)) return 'vector<vector<int>>';
    if (/^List\[List\[str\]\]$/.test(t)) return 'vector<vector<string>>';
    if (/^List\[/.test(t)) return 'vector<int>';
    if (t === 'int') return 'int';
    if (t === 'float') return 'double';
    if (t === 'str') return 'string';
    if (t === 'bool') return 'bool';
    if (t === 'None' || t === 'void') return 'void';
    if (t === 'TreeNode' || t === 'Optional[TreeNode]') return 'TreeNode*';
    if (t === 'ListNode' || t === 'Optional[ListNode]') return 'ListNode*';
    return 'int';
  };

  const jsParams = params.map(p => p.name).join(', ');
  const tsParams = params.map(p => `${p.name}: ${pyToJs(p.pyType)}`).join(', ');
  const javaParams = params.map(p => `${pyToJava(p.pyType)} ${p.name}`).join(', ');
  const cppParams = params.map(p => `${pyToCpp(p.pyType)} ${p.name}`).join(', ');
  const javaReturn = pyToJava(pyReturnType);
  const cppReturn = pyToCpp(pyReturnType);
  const tsReturn = pyToJs(pyReturnType);

  return {
    javascript: `/**\n * @param {${params.map(p => pyToJs(p.pyType)).join(', ')}} ${params.map(p => p.name).join(', ')}\n * @return {${pyToJs(pyReturnType)}}\n */\nvar ${funcName} = function(${jsParams}) {\n    // Write your solution here\n    \n};`,
    python: `class Solution:\n    def ${funcName}(self${pyParams ? ', ' + pyParams : ''})${pyReturnType !== 'None' ? ' -> ' + pyReturnType : ''}:\n        # Write your solution here\n        pass`,
    java: `class Solution {\n    public ${javaReturn} ${funcName}(${javaParams}) {\n        // Write your solution here\n        \n    }\n}`,
    cpp: `class Solution {\npublic:\n    ${cppReturn} ${funcName}(${cppParams}) {\n        // Write your solution here\n        \n    }\n};`,
    typescript: `function ${funcName}(${tsParams}): ${tsReturn} {\n    // Write your solution here\n    \n}`,
    go: `func ${funcName}(${params.map(p => p.name + ' ' + pyToJs(p.pyType).replace('[]', '')).join(', ')}) ${pyToJs(pyReturnType)} {\n    // Write your solution here\n    \n}`,
    rust: `impl Solution {\n    pub fn ${funcName}(${params.map(p => p.name + ': ' + pyToJs(p.pyType)).join(', ')}) -> ${pyToJs(pyReturnType)} {\n        // Write your solution here\n        \n    }\n}`,
    csharp: `public class Solution {\n    public ${javaReturn} ${funcName.charAt(0).toUpperCase() + funcName.slice(1)}(${javaParams}) {\n        // Write your solution here\n        \n    }\n}`
  };
}


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

    // Check credits — only AI-mode costs credits (1.5); gate at that minimum
    const creditCheck = await hasEnoughCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 0.3);
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

    // ── Solution generation — disabled, solutions come from CSV/local data only ──
    if (generateSolutions) {
      return NextResponse.json({
        success: false,
        error: 'AI solution generation is disabled. Solutions are loaded from the local problem database.',
      }, { status: 400 });
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
      // No AI used — no credit charge for specific/preset lookups
      const lcProblem = getProblemsMap().get(id)!;
      return NextResponse.json({
        success: true,
        question: problem,
        problemId: id,
        topics: lcProblem.topics || [],
        codeTemplates: generateCodeTemplates(lcProblem),
        creditsRemaining: null,
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

    // AI was used to pick this problem — charge 1.5 credits (quantity = 0.3 × base cost 5)
    const deduction = await deductCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 0.3);
    const chosenProblem = getProblemsMap().get(chosenId)!;
    return NextResponse.json({
      success: true,
      question: problem,
      problemId: chosenId,
      topics: chosenProblem.topics || [],
      codeTemplates: generateCodeTemplates(chosenProblem),
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

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    const prompt = `You are a senior engineer at a FAANG company doing a real technical interview. You have high standards and give honest, fair scores. You are grading this ${language} solution to a LeetCode problem.

PROBLEM:
${question}

SUBMITTED CODE:
${code}

CANDIDATE'S EXPLANATION:
${explanation}

GRADING RULES — be strict and realistic:
- Most candidates score 50-70. Only exceptional solutions score 80+.
- A solution that is WRONG or has major bugs: codeScore 20-40, overallScore 30-50
- A correct brute-force solution (working but not optimal): codeScore 55-65, overallScore 50-65
- A correct optimal solution with minor issues: codeScore 70-80, overallScore 65-75
- A correct optimal solution well-explained with clean code: codeScore 80-90, overallScore 75-85
- A perfect solution with edge cases handled, optimal complexity, clean code: codeScore 90-100, overallScore 85-95
- If no code was submitted or code is trivially wrong: codeScore 10-25
- If explanation is missing or vague: explanationScore 20-40
- explanationScore should reflect how clearly they communicated their approach, trade-offs, and complexity

${language} best practices to evaluate:
${languageBestPractices[language as keyof typeof languageBestPractices]}

Return ONLY this JSON (no other text):
{
  "isCorrect": boolean,
  "overallScore": number (0-100, follow the grading rules above),
  "codeScore": number (0-100, based on correctness + quality + optimality),
  "explanationScore": number (0-100, based on clarity of explanation),
  "correctnessAnalysis": "Was the solution correct? Does it handle edge cases? What bugs exist?",
  "timeComplexity": "O(?) — explain why",
  "spaceComplexity": "O(?) — explain why",
  "codeQuality": "Critique of code style, naming, structure, and language-specific best practices",
  "suggestedImprovements": "Concrete, specific improvements the candidate should make"
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
        overallScore: analysis.overallScore ?? (analysis.isCorrect ? 70 : 40),
        strengths: analysis.codeQuality ? 
          (analysis.codeQuality as string).split('.').filter((s: string) => s.trim() && !s.toLowerCase().includes('improvement')).slice(0, 3) :
          ["Code submitted successfully"],
        improvementAreas: analysis.suggestedImprovements ? 
          (analysis.suggestedImprovements as string).split('.').filter((s: string) => s.trim()).slice(0, 3) :
          ["Consider reviewing the solution"],
        codeFeedback: analysis.correctnessAnalysis || "Solution analyzed",
        explanationFeedback: `Time Complexity: ${analysis.timeComplexity || "Not analyzed"}. Space Complexity: ${analysis.spaceComplexity || "Not analyzed"}`,
        codeScore: analysis.codeScore ?? (analysis.isCorrect ? 70 : 35),
        explanationScore: analysis.explanationScore ?? 50,
        analysis: analysis
      };

      // AI was used to analyze the submission — charge 1.5 credits
      const deduction = await deductCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 0.3);

      // Log activity (fire-and-forget)
      const titleMatch = (question || '').match(/^#\s*(\d+)\.\s*(.+)/m);
      logActivity(user.id, {
        activityType: 'technical',
        problemId: titleMatch ? parseInt(titleMatch[1]) : null,
        problemTitle: titleMatch ? titleMatch[2].trim() : null,
        difficulty: difficulty || null,
        language,
        isCorrect: analysis.isCorrect ?? false,
        score: transformedResponse.overallScore,
      });

      return NextResponse.json({ ...transformedResponse, creditsRemaining: deduction.remainingCredits });
    } catch (error) {
      console.error('Error parsing analysis:', error);
      
      // Return a fallback response instead of throwing an error
      return NextResponse.json({
        success: true,
        overallScore: 35,
        strengths: ["Code submitted successfully"],
        improvementAreas: ["Could not auto-analyze — please review your solution manually."],
        codeFeedback: "Unable to analyze code automatically. Please review manually.",
        explanationFeedback: "Unable to analyze explanation automatically.",
        codeScore: 35,
        explanationScore: 35
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
