import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface SystemDesignRequest {
  experienceLevel: string;
  testDifficulty: string;
  targetCompany?: string;
}

async function generateSystemDesignTest(data: SystemDesignRequest) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate a comprehensive system design interview problem based on:
- Experience Level: ${data.experienceLevel}
- Difficulty: ${data.testDifficulty}
- Target Company: ${data.targetCompany || 'General'}

Return a JSON object with this exact structure:
{
  "problem": {
    "title": "Design [System Name]",
    "description": "Clear problem description with context",
    "requirements": ["requirement1", "requirement2", "requirement3"],
    "constraints": ["constraint1", "constraint2", "constraint3"],
    "estimatedTime": "45 minutes"
  },
  "guidance": {
    "approach": ["step1", "step2", "step3", "step4", "step5"],
    "keyComponents": ["component1", "component2", "component3"],
    "scaleConsiderations": ["scale1", "scale2", "scale3"],
    "commonPitfalls": ["pitfall1", "pitfall2", "pitfall3"]
  },
  "evaluation": {
    "criteria": [
      {"category": "Requirements Clarity", "description": "How well requirements are understood", "weight": 20},
      {"category": "System Architecture", "description": "Quality of high-level design", "weight": 25},
      {"category": "Scalability", "description": "Understanding of scale challenges", "weight": 20},
      {"category": "Technology Choices", "description": "Appropriate tech stack selection", "weight": 20},
      {"category": "Communication", "description": "Clarity of explanation", "weight": 15}
    ]
  },
  "tips": {
    "timeManagement": ["tip1", "tip2", "tip3"],
    "communicationTips": ["tip1", "tip2", "tip3"],
    "drawingTips": ["tip1", "tip2", "tip3"]
  }
}

Make the problem realistic, relevant to ${data.targetCompany || 'general'} companies, and appropriate for ${data.experienceLevel} level with ${data.testDifficulty} difficulty.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    // Fallback test data
    return {
      problem: {
        title: "Design a URL Shortener Service",
        description: "Design a URL shortening service like bit.ly that can handle millions of requests per day. Users should be able to create short URLs and redirect to original URLs.",
        requirements: [
          "Shorten long URLs to a 7-character string",
          "Redirect users from short URL to original URL",
          "Handle 100M URLs shortened per month",
          "Support custom aliases (optional)",
          "Analytics on URL usage"
        ],
        constraints: [
          "99.9% availability required",
          "URL redirection should be fast (<100ms)",
          "System should handle peak loads",
          "Data should be persistent",
          "Consider global distribution"
        ],
        estimatedTime: "45 minutes"
      },
      guidance: {
        approach: [
          "Clarify requirements and constraints",
          "Estimate scale and capacity",
          "Design high-level architecture",
          "Design detailed components",
          "Address scalability and performance"
        ],
        keyComponents: [
          "URL encoding service",
          "Database for mappings",
          "Cache layer",
          "Load balancer",
          "Analytics service"
        ],
        scaleConsiderations: [
          "Database sharding strategies",
          "Caching at multiple levels",
          "CDN for global distribution",
          "Rate limiting",
          "Database replication"
        ],
        commonPitfalls: [
          "Not considering collision handling",
          "Ignoring cache invalidation",
          "Underestimating storage requirements",
          "Not planning for hot URLs",
          "Missing error handling strategies"
        ]
      },
      evaluation: {
        criteria: [
          {"category": "Requirements Clarity", "description": "How well requirements are understood", "weight": 20},
          {"category": "System Architecture", "description": "Quality of high-level design", "weight": 25},
          {"category": "Scalability", "description": "Understanding of scale challenges", "weight": 20},
          {"category": "Technology Choices", "description": "Appropriate tech stack selection", "weight": 20},
          {"category": "Communication", "description": "Clarity of explanation", "weight": 15}
        ]
      },
      tips: {
        timeManagement: [
          "Spend 5 minutes on requirements clarification",
          "Allocate 15 minutes for high-level design",
          "Deep dive into 2-3 key components",
          "Leave time for scalability discussion"
        ],
        communicationTips: [
          "Think out loud while designing",
          "Ask clarifying questions",
          "Explain trade-offs clearly",
          "Be open to feedback and iteration"
        ],
        drawingTips: [
          "Start with simple boxes and arrows",
          "Label all components clearly",
          "Show data flow direction",
          "Use consistent symbols"
        ]
      }
    };
  }
}

async function analyzeSystemDesign(problem: any, responses: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert system design interviewer. Analyze the following system design interview performance:

PROBLEM:
Title: ${problem.problem.title}
Description: ${problem.problem.description}
Requirements: ${problem.problem.requirements.join(', ')}
Constraints: ${problem.problem.constraints.join(', ')}

USER RESPONSES:
Requirements Clarification: ${responses.requirements || 'No response provided'}
Scale Estimation: ${responses.estimation || 'No response provided'}
High-Level Design: ${responses.highlevel || 'No response provided'}
Detailed Design: ${responses.detailed || 'No response provided'}
Scalability Considerations: ${responses.scale || 'No response provided'}

Please provide a comprehensive analysis in the following JSON format:

{
  "problemTitle": "${problem.problem.title}",
  "difficulty": "Easy|Medium|Hard",
  "overallScore": number (0-100),
  "categoryScores": {
    "requirements": number (0-100),
    "estimation": number (0-100),
    "design": number (0-100),
    "scalability": number (0-100),
    "communication": number (0-100)
  },
  "feedback": {
    "strengths": ["strength1", "strength2", ...],
    "improvements": ["improvement1", "improvement2", ...],
    "recommendations": ["recommendation1", "recommendation2", ...]
  },
  "analysis": "Detailed written analysis in 2-3 paragraphs",
  "testDuration": number (estimated minutes spent),
  "completedSteps": number (1-5, how many steps had meaningful responses)
}

Rate based on:
- Requirements: How well they clarified requirements and scope
- Estimation: Quality of scale/capacity calculations and assumptions
- Design: Architecture clarity, component identification, data flow
- Scalability: Understanding of bottlenecks, scaling strategies, performance
- Communication: Clarity and structure of explanations

Provide constructive feedback focused on interview performance improvement.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysisData = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!analysisData.overallScore || !analysisData.categoryScores || !analysisData.feedback) {
      throw new Error('Invalid response structure');
    }

    return analysisData;
  } catch (parseError) {
    console.error('Error parsing Gemini response:', parseError);
    
    // Fallback response
    return {
      problemTitle: problem.problem.title,
      difficulty: 'Medium',
      overallScore: 75,
      categoryScores: {
        requirements: 80,
        estimation: 70,
        design: 85,
        scalability: 65,
        communication: 75
      },
      feedback: {
        strengths: [
          "Clear problem understanding",
          "Good architectural thinking",
          "Systematic approach to design"
        ],
        improvements: [
          "More detailed capacity planning",
          "Consider additional failure scenarios",
          "Expand on technology choices"
        ],
        recommendations: [
          "Practice scale estimation with real examples",
          "Study distributed systems patterns",
          "Review database design principles"
        ]
      },
      analysis: "Your system design approach shows good foundational understanding. You demonstrated clear thinking about the problem requirements and proposed a reasonable architecture. To improve, focus on providing more detailed justifications for technology choices and consider edge cases more thoroughly. Practice with time constraints to improve your explanation efficiency.",
      testDuration: 40,
      completedSteps: Object.values(responses).filter(r => r && typeof r === 'string' && r.trim().length > 20).length
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Check if this is a test generation request or analysis request
    if (requestData.experienceLevel && requestData.testDifficulty) {
      // This is a test generation request
      console.log('Generating system design test for:', requestData);
      
      const systemDesignTest = await generateSystemDesignTest(requestData);
      
      return NextResponse.json({
        success: true, 
        data: systemDesignTest 
      });
    } else if (requestData.problem && requestData.responses) {
      // This is an analysis request
      const { problem, responses } = requestData;
      
      const analysisResult = await analyzeSystemDesign(problem, responses);
      
      return NextResponse.json(analysisResult);
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Provide either test generation data (experienceLevel, testDifficulty) or analysis data (problem, responses)' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('System design API error:', error);
    return NextResponse.json(
      { error: 'Failed to process system design request' },
      { status: 500 }
    );
  }
} 