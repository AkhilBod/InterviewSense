import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressService } from "@/lib/progress";
import { hasEnoughCredits, deductCredits } from '@/lib/credits';
import { FeatureType } from '@prisma/client';

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// Language-specific function templates
const languageTemplates = {
  javascript: "function solution(params) {\n  // Implementation\n}",
  python: "def solution(params):\n    # Implementation\n    pass",
  java: "public class Solution {\n    public Type solution(params) {\n        // Implementation\n    }\n}",
  cpp: "class Solution {\npublic:\n    Type solution(params) {\n        // Implementation\n    }\n};",
  typescript: "function solution(params): ReturnType {\n  // Implementation\n}",
  go: "func solution(params Type) ReturnType {\n    // Implementation\n}",
  rust: "impl Solution {\n    pub fn solution(params: Type) -> ReturnType {\n        // Implementation\n    }\n}",
  csharp: "public class Solution {\n    public Type Solution(params) {\n        // Implementation\n    }\n}"
};

// Clean up problem text formatting
const cleanProblemText = (text: string) => {
  // Split into sections
  const sections = text.split('\n').map(line => line.trim());
  
  // Find the core problem description
  let description = '';
  let foundStart = false;
  
  for (const line of sections) {
    // Skip metadata lines
    if (line.startsWith('#') || 
        line.startsWith('**Difficulty:') || 
        line.startsWith('Difficulty:') ||
        line.startsWith('Problem') ||
        line === '') {
      continue;
    }
    
    // Skip until we find the actual problem description
    if (!foundStart) {
      if (line.includes('Given') || line.includes('You are given')) {
        foundStart = true;
        description = line;
        continue;
      } else if (line.length > 0) {
        // Accept any non-empty line that's not metadata
        foundStart = true;
        description = line;
        continue;
      }
    }
    
    // Stop when we hit examples, constraints, or follow-up
    if (line.startsWith('Example') ||
        line.startsWith('Input:') ||
        line.startsWith('Output:') ||
        line.startsWith('Constraints:') ||
        line.startsWith('Follow-up:') ||
        line.startsWith('Note:')) {
      break;
    }
    
    // Add non-empty lines to our description
    if (line.length > 0) {
      description += ' ' + line;
    }
  }

  // Clean up any remaining markdown and normalize whitespace
  return description
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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
      preset,
      category,
      prompt: customPrompt,
      generateSolutions,
      language = 'javascript' // Default to JavaScript if not specified
    } = await req.json();

    // Configuration removed - will be set per request

    let prompt;

    if (generateSolutions) {
      // If we're generating solutions, use a different prompt
      prompt = `You are an expert software engineer providing multiple solution approaches for this LeetCode problem:

${customPrompt}

Generate exactly 3 different solution approaches, from brute force to optimal. For each approach, provide:
1. A clear description of the approach and algorithm
2. Precise time and space complexity with explanation
3. Complete, runnable code implementation in ${language}
4. Key insights and trade-offs of this approach

Use this template for the ${language} solution:
${languageTemplates[language as keyof typeof languageTemplates]}

Return ONLY a JSON array in this exact format (no other text):
[
  {
    "approach": "Detailed description of approach and algorithm",
    "timeComplexity": "e.g. O(n) no explanation",
    "spaceComplexity": "e.g. O(1) no explanation",
    "code": "Complete, runnable code in ${language}",
    "insights": "Key insights and trade-offs"
  }
]

Requirements:
- Each solution must be complete and runnable
- Code must be in ${language} and follow its best practices
- Include detailed complexity analysis
- Solutions should progress from simplest to most optimal
- No markdown, no extra text, just the JSON array
- Follow the language template structure provided above`;
    } else if (customPrompt) {
      // If a custom prompt is provided (for preset/category selection), use it with enhancements
      prompt = `You are an expert technical interviewer with deep knowledge of LeetCode problems.

${customPrompt}

**Output Format Requirements:**
Format the problem EXACTLY like this:

# Problem Number. Problem Title

**Difficulty:** Easy/Medium/Hard

Complete problem description in clear paragraph form

**Example 1:**
Input: example input
Output: example output
Explanation: detailed explanation

**Example 2:**
Input: example input
Output: example output

**Constraints:**
• First constraint
• Second constraint
• Third constraint

**Follow-up:** optimization question if applicable

**Critical Instructions:**
- Ensure the problem matches the specified category and collection style
- Include clear examples with explanations
- Provide relevant constraints
- Add appropriate follow-up questions
- Maintain consistent formatting`;
    } else if (useCustomNumber && leetcodeNumber) {
      // Existing specific problem number prompt
      prompt = `Retrieve the exact LeetCode problem #${leetcodeNumber} from the complete database of 3000+ LeetCode problems.

**Critical Requirements:**
- This MUST be the actual problem #${leetcodeNumber} from LeetCode
- DO NOT substitute with a different problem or create a synthetic one
- If problem #${leetcodeNumber} doesn't exist in the 1-3000 range, respond with "Problem number ${leetcodeNumber} not found in LeetCode database"

**Output Format** (for valid problems only):
Format the problem EXACTLY like this LeetCode structure:

# Problem Number. Problem Title

**Difficulty:** Easy/Medium/Hard

Complete problem description in clear paragraph form

**Example 1:**
Input: example input
Output: example output  
Explanation: detailed explanation

**Example 2:**
Input: example input
Output: example output

**Constraints:**
• First constraint
• Second constraint
• Third constraint
• Only one valid answer exists.

**Follow-up:** optimization question if applicable

**Quality Assurance:**
- Verify the problem number matches exactly
- Ensure all examples and constraints are from the original problem
- Maintain the exact difficulty level of the original problem
- Include all edge cases mentioned in the original problem

Retrieve LeetCode problem #${leetcodeNumber}:`;
    } else {
      // Existing general problem generation prompt
      prompt = `You are an expert technical interview conductor with access to the complete LeetCode database of 3000+ problems. Your task is to select the MOST APPROPRIATE problem for this specific interview scenario.

**Interview Context:**
- Company: ${company}
- Role: ${role}  
- Difficulty Level: ${difficulty}

**Selection Criteria - Apply ALL of these filters:**

1. **Company-Specific Patterns**: 
   - For FAANG (Google, Meta, Amazon, Apple, Microsoft): Focus on system design, optimization, and scalable algorithms
   - For startups: Emphasize practical problem-solving and versatile solutions
   - For finance companies: Include problems involving precision, edge cases, and data processing
   - For e-commerce: Prioritize search, recommendation, and data structure problems

2. **Role-Specific Focus**:
   - Software Engineer: Core algorithms, data structures, complexity analysis
   - Senior/Staff Engineer: System design aspects, optimization, architectural thinking
   - Frontend Engineer: String manipulation, DOM-like structures, UI-related algorithms
   - Backend Engineer: Database-style problems, API design, data processing
   - Data Engineer: Array processing, stream processing, data transformation
   - DevOps Engineer: Graph problems (network topology), optimization, monitoring scenarios

3. **Difficulty Calibration**:
   - Easy: Single concept, straightforward implementation, common patterns
   - Medium: Multi-step thinking, moderate optimization, 2-3 concepts combined
   - Hard: Complex algorithms, advanced data structures, multiple optimization layers

4. **Problem Pattern Selection** (choose from these categories based on role/company):
   - **Array/String Processing**: Two pointers, sliding window, prefix sums
   - **Tree/Graph Algorithms**: DFS, BFS, shortest path, tree traversals
   - **Dynamic Programming**: Memoization, tabulation, optimization problems
   - **Hash Tables/Maps**: Fast lookups, counting, grouping
   - **Stack/Queue**: Expression parsing, monotonic stack, level-order processing
   - **Sorting/Searching**: Binary search, custom sorting, merge algorithms
   - **Math/Bit Manipulation**: Number theory, bitwise operations, mathematical insights
   - **Design Problems**: Data structure design, system component design

**Output Requirements:**
From the 3000+ LeetCode problems, select ONE that best matches ALL criteria above. Present it EXACTLY in this format:

# Problem Number. Problem Title

**Difficulty:** Easy/Medium/Hard

Complete problem description exactly as it appears on LeetCode

**Example 1:**
Input: example input
Output: example output
Explanation: detailed explanation

**Example 2:**
Input: example input
Output: example output

**Constraints:**
• First constraint
• Second constraint
• Third constraint
• Only one valid answer exists.

**Follow-up:** optimization question if applicable

**Critical Instructions:**
- DO NOT create synthetic problems - use actual LeetCode problems only
- Ensure the problem difficulty matches the requested level precisely  
- The problem should be highly relevant to both the company's technical stack and the role's responsibilities
- Select from the full range of 3000+ problems, not just the most common ones
- Consider the company's known interview patterns and technical preferences

Now select the optimal problem for a ${difficulty} ${role} interview at ${company}:`;
    }

    // Generate the response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });

    let responseText = completion.choices[0].message.content || '';

    if (generateSolutions) {
      // For solutions, try to extract and validate the JSON
      try {
        // Clean up the response text
        responseText = responseText.trim();
        // Remove any markdown code blocks
        responseText = responseText.replace(/```json\s*|\s*```/g, '');
        // Ensure it starts with [ and ends with ]
        if (!responseText.startsWith('[') || !responseText.endsWith(']')) {
          throw new Error('Invalid solution format');
        }
        // Parse the JSON to validate it
        const solutions = JSON.parse(responseText);
        if (!Array.isArray(solutions) || solutions.length !== 3) {
          throw new Error('Expected exactly 3 solutions');
        }
        // Validate each solution has required fields
        solutions.forEach((solution, index) => {
          if (!solution.approach || !solution.timeComplexity || !solution.spaceComplexity || !solution.code || !solution.insights) {
            throw new Error(`Solution ${index + 1} is missing required fields`);
          }
        });

        // Deduct credits
        const deduction = await deductCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 1);
        if (!deduction.success) {
          console.error('Failed to deduct credits:', deduction.error);
        }

        // Return the validated solutions
        return NextResponse.json({
          success: true,
          question: responseText,
          creditsRemaining: deduction.remainingCredits
        });
      } catch (error) {
        console.error('Error parsing solutions:', error);
        throw new Error('Failed to generate valid solutions. Please try again.');
      }
    } else {
      // For problem generation, use existing validation
      let question = responseText;

      // Check for no matching problem response
      if (question.includes("NO_MATCHING_PROBLEM_FOUND")) {
        throw new Error("Could not find a matching problem in the selected category. Please try a different category.");
      }

      // Validate that the response looks like a real LeetCode problem
      const validationChecks = [
        question.includes("# ") || question.includes("Problem "), // Has problem number/title
        question.includes("**Difficulty:**"), // Has difficulty
        question.includes("**Example"), // Has examples
        question.includes("**Constraints:**"), // Has constraints
        question.length > 200 // Reasonable length for a real problem
      ];

      if (!validationChecks.every(check => check)) {
        throw new Error("Generated response does not match LeetCode problem format. Please try again.");
      }

      // Extract just the main problem description
      const lines = question.split('\n').map(line => line.trim());
      const mainDescription = [];
      let foundStart = false;

      for (const line of lines) {
        // Skip metadata and empty lines until we find the main description
        if (!foundStart) {
          if (line.length > 0 && 
              !line.includes('Difficulty:') &&
              !line.includes('Problem:') &&
              !line.match(/^\d+\./)) {
            foundStart = true;
          } else {
            continue;
          }
        }
        // Stop when we hit examples or constraints
        if (line.startsWith('Example') ||
            line.startsWith('Constraints:') ||
            line.startsWith('Follow')) {
          break;
        }
        // Add non-empty lines to our description
        if (line.length > 0) {
          mainDescription.push(line);
        }
      }

      const cleanedQuestion = mainDescription
        .join('\n\n')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .trim();

      // Deduct credits
      const deduction = await deductCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 1);
      if (!deduction.success) {
        console.error('Failed to deduct credits:', deduction.error);
      }

      return NextResponse.json({
        success: true,
        question: cleanedQuestion,
        creditsRemaining: deduction.remainingCredits
      });
    }
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate question'
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
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2048,
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
