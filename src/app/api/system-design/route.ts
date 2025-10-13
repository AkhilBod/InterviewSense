import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface SystemDesignRequest {
  experienceLevel: string;
  testDifficulty: string;
  targetCompany?: string;
}

async function generateSystemDesignTest(data: SystemDesignRequest) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.9,  // Higher temperature for more variety
      topP: 0.95,
      topK: 50
    }
  });

  // Add timestamp and random element to ensure different questions each time
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000);
  
  // List of varied system design problems to ensure diversity
  const systemTypes = [
    'Chat/Messaging System', 'Social Media Feed', 'Video Streaming Platform', 'E-commerce Platform',
    'Search Engine', 'Ride Sharing Service', 'Food Delivery App', 'Music Streaming Service',
    'News Feed Aggregator', 'Photo Sharing Platform', 'Real-time Collaboration Tool',
    'Gaming Leaderboard', 'Notification System', 'API Rate Limiter', 'Distributed Cache',
    'Log Aggregation System', 'Payment Processing System', 'Content Delivery Network',
    'Recommendation Engine', 'URL Shortener', 'File Storage System', 'Auction Platform',
    'Parking Lot System', 'Online Banking System', 'Inventory Management System'
  ];

  const prompt = `Generate a UNIQUE and VARIED system design interview problem. Use timestamp ${timestamp} and seed ${randomSeed} to ensure uniqueness.

Based on:
- Experience Level: ${data.experienceLevel}
- Difficulty: ${data.testDifficulty}
- Target Company: ${data.targetCompany || 'General Tech Company'}

Create a problem that is DIFFERENT from common examples like URL shorteners. Choose from diverse system types like: ${systemTypes.join(', ')}.

Requirements:
- Make it realistic and interview-appropriate for ${data.experienceLevel} level
- Ensure the problem matches ${data.testDifficulty} difficulty
- Include specific business context and use cases
- Avoid overused examples - be creative and unique

Return ONLY a valid JSON object with this exact structure:
{
  "problem": {
    "title": "Design [Unique System Name]",
    "description": "Clear, detailed problem description with business context and realistic constraints",
    "requirements": ["functional requirement 1", "functional requirement 2", "functional requirement 3", "functional requirement 4", "functional requirement 5"],
    "constraints": ["technical constraint 1", "performance constraint 2", "business constraint 3", "scale constraint 4"],
    "estimatedTime": "45 minutes"
  },
  "guidance": {
    "approach": ["Clarify requirements and scope", "Estimate scale and capacity planning", "Design high-level architecture", "Deep dive into core components", "Address scalability and reliability"],
    "keyComponents": ["component1 with description", "component2 with description", "component3 with description", "component4 with description"],
    "scaleConsiderations": ["scaling strategy 1", "scaling strategy 2", "scaling strategy 3", "performance optimization"],
    "commonPitfalls": ["common mistake 1", "common mistake 2", "common mistake 3"]
  },
  "evaluation": {
    "criteria": [
      {"category": "Requirements Clarity", "description": "How well requirements are understood and clarified", "weight": 20},
      {"category": "System Architecture", "description": "Quality and clarity of high-level design", "weight": 25},
      {"category": "Scalability", "description": "Understanding of scale challenges and solutions", "weight": 20},
      {"category": "Technology Choices", "description": "Appropriate tech stack and database selection", "weight": 20},
      {"category": "Communication", "description": "Clarity of explanation and presentation", "weight": 15}
    ]
  },
  "tips": {
    "timeManagement": ["time management tip 1", "time management tip 2", "time management tip 3"],
    "communicationTips": ["communication tip 1", "communication tip 2", "communication tip 3"],
    "drawingTips": ["drawing tip 1", "drawing tip 2", "drawing tip 3"]
  }
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    // Clean the response text
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object in the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', text);
      throw new Error('No JSON found in response');
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate that we have the required structure
    if (!parsedData.problem || !parsedData.problem.title || !parsedData.guidance) {
      console.error('Invalid JSON structure from Gemini:', parsedData);
      throw new Error('Invalid response structure');
    }
    
    console.log('Successfully generated system design problem:', parsedData.problem.title);
    return parsedData;
  } catch (parseError) {
    console.error('Error parsing Gemini response:', parseError, 'Raw text:', text);
    
    // Multiple fallback problems to ensure variety even when Gemini fails
    const fallbackProblems = [
      {
        title: "Design a Real-time Chat System",
        description: "Design a real-time messaging platform like WhatsApp that supports individual and group chats, file sharing, and can handle millions of concurrent users globally.",
        requirements: [
          "Support real-time messaging between users",
          "Handle individual and group conversations",
          "Support file and media sharing",
          "Show online/offline status",
          "Message delivery and read receipts"
        ]
      },
      {
        title: "Design a Video Streaming Platform",
        description: "Design a video streaming service like Netflix that can serve millions of users worldwide with high-quality video content and personalized recommendations.",
        requirements: [
          "Stream videos in multiple qualities",
          "Support millions of concurrent viewers",
          "Provide personalized recommendations",
          "Handle content upload and processing",
          "Support multiple devices and platforms"
        ]
      },
      {
        title: "Design a Social Media Feed",
        description: "Design a social media feed system like Instagram that can generate personalized feeds for millions of users based on their interests and social connections.",
        requirements: [
          "Generate personalized feeds for users",
          "Handle posts, likes, comments, and shares",
          "Support image and video content",
          "Real-time notifications",
          "Content recommendation algorithm"
        ]
      },
      {
        title: "Design a Ride Sharing Service",
        description: "Design a ride-sharing platform like Uber that connects riders with drivers, handles real-time location tracking, and processes payments.",
        requirements: [
          "Match riders with nearby drivers",
          "Real-time location tracking",
          "Dynamic pricing based on demand",
          "Payment processing and split fares",
          "Rating and review system"
        ]
      },
      {
        title: "Design a Food Delivery Platform",
        description: "Design a food delivery system like DoorDash that connects restaurants, delivery drivers, and customers while managing orders and logistics.",
        requirements: [
          "Restaurant and menu management",
          "Order placement and tracking",
          "Driver assignment and routing",
          "Real-time delivery tracking",
          "Payment processing and commissions"
        ]
      }
    ];
    
    // Select a random fallback problem
    const randomIndex = Math.floor(Math.random() * fallbackProblems.length);
    const selectedProblem = fallbackProblems[randomIndex];
    
          return {
        problem: {
          title: selectedProblem.title,
          description: selectedProblem.description,
          requirements: selectedProblem.requirements,
          constraints: [
            "99.9% availability required",
            "Response time under 200ms",
            "System should handle peak loads",
            "Data should be persistent and consistent",
            "Consider global distribution and scaling"
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
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,  // Lower temperature for more consistent analysis
      topP: 0.8,
      topK: 40
    }
  });

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