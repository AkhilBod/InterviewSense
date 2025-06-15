import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressService } from "@/lib/progress";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Generate a technical interview question
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company, role, difficulty, useCustomNumber, leetcodeNumber } = await req.json();

    // Use Gemini 2.0 Flash with low temperature to reduce hallucination
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      }
    });

    let prompt;

    if (useCustomNumber && leetcodeNumber) {
      // Enhanced prompt for specific LeetCode question retrieval
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
      // Enhanced prompt for generating better targeted questions from the full LeetCode database
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
      explanation 
    } = await req.json();

    // Use Gemini 2.0 Flash with very low temperature for consistent analysis
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.7,
        topK: 30,
      }
    });

    // Enhanced prompt for comprehensive code analysis
    const analysisPrompt = `
You are a senior technical interviewer for ${company} conducting a ${role} interview. 
The candidate solved this ${difficulty} difficulty problem that was specifically selected for this role and company:

**Problem:**
${question}

**Candidate's Code Solution:**
\`\`\`
${code}
\`\`\`

**Candidate's Explanation:**
"${explanation}"

**Evaluation Criteria:**

1. **Code Quality (40% weight):**
   - Correctness and edge case handling
   - Time and space complexity optimality
   - Code readability and structure
   - Best practices for the language used
   - Handling of constraints and requirements

2. **Problem-Solving Approach (30% weight):**
   - Choice of algorithm/data structure
   - Understanding of the problem requirements
   - Consideration of trade-offs
   - Optimization opportunities identified

3. **Communication & Explanation (30% weight):**
   - Clarity of thought process
   - Technical depth of explanation
   - Ability to explain complexity
   - Confidence and understanding demonstrated

**Company-Specific Standards for ${company}:**
- Code should meet production-quality standards
- Solutions should be scalable and maintainable
- Explanation should demonstrate deep technical understanding
- Consider real-world implications and edge cases

**Role-Specific Expectations for ${role}:**
- Solutions should reflect the technical level expected for this position
- Code style should align with industry standards for this role
- Explanation should demonstrate appropriate depth of knowledge

**Required Analysis:**
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
    }
    
    // Parse the JSON response
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
      
      // Track progress for technical interview completion
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
              type: 'technical',
              completedAt: {
                gte: new Date(Date.now() - 30000) // 30 seconds ago
              }
            },
            orderBy: { completedAt: 'desc' }
          });
          
          if (!recentSession) {
            await ProgressService.updateInterviewProgress(user.id, {
              type: 'technical',
              score: validatedAnalysis.overallScore,
              duration: 0, // Could be tracked if needed
              metrics: {
                codeScore: validatedAnalysis.codeScore,
                explanationScore: validatedAnalysis.explanationScore,
                difficulty: difficulty,
                company: company,
                role: role
              }
            });
            console.log('🎯 Progress tracked for technical interview');
          } else {
            console.log('⚠️ Duplicate technical interview session prevented');
          }
        }
      } catch (progressError) {
        console.error('Error tracking progress:', progressError);
        // Don't fail the main request if progress tracking fails
      }
      
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