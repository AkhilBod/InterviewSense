import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface RoadmapRequest {
  currentRole: string;
  careerGoal: string;
  timeline: string;
  challenges: string;
  experienceLevel: string;
}

interface RoadmapAnalysis {
  overallScore: number;
  summary: string;
  currentRoleAnalysis: {
    strengths: string[];
    skillGaps: string[];
    marketDemand: number;
  };
  careerPath: {
    phases: Array<{
      title: string;
      timeframe: string;
      description: string;
      keyMilestones: string[];
      skillsToAcquire: string[];
      estimatedSalaryRange: string;
    }>;
  };
  skillsAnalysis: {
    technicalSkills: Array<{
      skill: string;
      importance: number;
      currentLevel: string;
      targetLevel: string;
      learningPriority: string;
    }>;
    softSkills: Array<{
      skill: string;
      importance: number;
      description: string;
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  certifications: Array<{
    name: string;
    provider: string;
    priority: string;
    estimatedTime: string;
    description: string;
  }>;
  networking: {
    communities: string[];
    events: string[];
    platforms: string[];
  };
  resources: {
    courses: Array<{
      title: string;
      provider: string;
      type: string;
      duration: string;
    }>;
    books: string[];
    podcasts: string[];
    blogs: string[];
  };
}

async function generateCareerRoadmap(data: RoadmapRequest): Promise<RoadmapAnalysis> {
  try {

    const prompt = `
You are a senior career advisor and tech industry expert. Analyze this career roadmap request and provide comprehensive guidance.

Current Role: ${data.currentRole}
Career Goal: ${data.careerGoal}
Experience Level: ${data.experienceLevel}
Timeline: ${data.timeline}
Current Challenges: ${data.challenges || 'None specified'}

Please provide a detailed career roadmap analysis in the following JSON format:

{
  "overallScore": number (1-100, how achievable this goal is given current position),
  "summary": "2-3 sentence overview of the career transition path",
  "currentRoleAnalysis": {
    "strengths": ["strength1", "strength2", "strength3"],
    "skillGaps": ["gap1", "gap2", "gap3"],
    "marketDemand": number (1-100, market demand for current role)
  },
  "careerPath": {
    "phases": [
      {
        "title": "Phase 1 Title",
        "timeframe": "0-6 months",
        "description": "What to focus on in this phase",
        "keyMilestones": ["milestone1", "milestone2"],
        "skillsToAcquire": ["skill1", "skill2"],
        "estimatedSalaryRange": "$X - $Y"
      }
      // Include 3-5 phases based on timeline
    ]
  },
  "skillsAnalysis": {
    "technicalSkills": [
      {
        "skill": "Skill name",
        "importance": number (1-100),
        "currentLevel": "Beginner/Intermediate/Advanced",
        "targetLevel": "Target level needed",
        "learningPriority": "High/Medium/Low"
      }
    ],
    "softSkills": [
      {
        "skill": "Soft skill name",
        "importance": number (1-100),
        "description": "Why this skill matters for the goal"
      }
    ]
  },
  "recommendations": {
    "immediate": ["action1", "action2", "action3"],
    "shortTerm": ["action1", "action2", "action3"],
    "longTerm": ["action1", "action2", "action3"]
  },
  "certifications": [
    {
      "name": "Certification name",
      "provider": "Provider",
      "priority": "High/Medium/Low",
      "estimatedTime": "X months",
      "description": "Brief description of value"
    }
  ],
  "networking": {
    "communities": ["community1", "community2"],
    "events": ["event type 1", "event type 2"],
    "platforms": ["LinkedIn", "Twitter", "etc"]
  },
  "resources": {
    "courses": [
      {
        "title": "Course title",
        "provider": "Platform",
        "type": "Online/Bootcamp/University",
        "duration": "X weeks/months"
      }
    ],
    "books": ["Book 1", "Book 2"],
    "podcasts": ["Podcast 1", "Podcast 2"],
    "blogs": ["Blog 1", "Blog 2"]
  }
}

Make sure all recommendations are:
- Specific and actionable
- Realistic for the given timeline
- Tailored to the current role and target goal
- Industry-relevant and up-to-date
- Include salary progression estimates
- Consider current market trends

Provide only the JSON response without any additional text or formatting.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 4096,
    });

    const text = completion.choices[0].message.content || '';

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to generate career roadmap with AI');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: RoadmapRequest = await request.json();
    
    // Validate required fields
    if (!data.currentRole || !data.careerGoal) {
      return NextResponse.json(
        { error: 'Current role and career goal are required' },
        { status: 400 }
      );
    }

    const analysis = await generateCareerRoadmap(data);
    
    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Career roadmap generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate career roadmap analysis' },
      { status: 500 }
    );
  }
} 