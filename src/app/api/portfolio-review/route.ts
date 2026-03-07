import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
  updated_at: string;
}

interface PortfolioReviewData {
  portfolioUrl: string;
  githubUrl?: string;
  targetRole: string;
  experience: string;
  specificFeedback?: string;
}



async function fetchGitHubRepos(githubUrl: string): Promise<GitHubRepo[]> {
  try {
    // Extract username from GitHub URL
    const username = githubUrl.split('/').pop()?.split('?')[0];
    if (!username) {
      throw new Error('Invalid GitHub URL');
    }

    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'InterviewSense-Portfolio-Review'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();
    return repos.filter((repo: any) => !repo.fork && repo.size > 0); // Filter out forks and empty repos
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

async function analyzePortfolioWithAI(data: PortfolioReviewData, repos: GitHubRepo[]) {

  const repoDetails = repos.map(repo => ({
    name: repo.name,
    description: repo.description || 'No description',
    language: repo.language || 'Unknown',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics,
    lastUpdated: repo.updated_at
  }));

  const prompt = `
You are a **senior engineering manager** who has reviewed hundreds of portfolios and GitHub profiles when evaluating candidates. Provide an expert-level portfolio and GitHub review.

## Subject
- **Target Role:** ${data.targetRole}
- **Experience Level:** ${data.experience || 'Not specified'}
- **GitHub Profile:** ${data.githubUrl}
${data.portfolioUrl ? `- **Portfolio Website:** ${data.portfolioUrl}` : '- **Portfolio Website:** Not provided'}
${data.specificFeedback ? `- **Specific Feedback Requested:** ${data.specificFeedback}` : ''}

## GitHub Repositories (${repoDetails.length} found):
${repoDetails.length > 0 ? JSON.stringify(repoDetails, null, 2) : 'No public repositories found — address this!'}

## Analysis Instructions

### GitHub Deep-Dive (this is the primary signal):
- **Code quality patterns:** Based on repo names, descriptions, topics, and languages — what does the tech stack tell us about this candidate? Are they using modern, production-grade tools or outdated ones?
- **Project ambition:** Do the repos show real-world, non-trivial projects or just tutorial follow-alongs? Look for signs of originality.
- **Consistency:** How recently were repos updated? Is there a pattern of regular commits or long gaps?
- **Documentation quality:** Do repos have meaningful descriptions and topics? This signals professionalism.
- **Breadth vs depth:** Are they a specialist in one area or spread thin across too many technologies?

${data.portfolioUrl ? `### Portfolio Website Analysis:
- **Visual design:** Is it modern, clean, and professional? Does it reflect current design trends?
- **UX/Interaction:** How is the navigation, typography hierarchy, whitespace usage, and responsiveness?
- **Content strategy:** Are projects presented with context (problem → solution → impact)? Are there case studies?
- **Technical presentation:** Does the portfolio itself demonstrate technical skill (animations, performance, accessibility)?
- **Personal branding:** Is there a clear narrative about who this person is and what they bring?
` : ''}

### Role Alignment:
- For a **${data.targetRole}** role, what specific skills or project types are missing?
- What would make a hiring manager at a top company excited about this candidate?

## Required JSON Output:

{
  "overallScore": <0-100>,
  "overallFeedback": "<2-3 sentences: the elevator pitch of this candidate's portfolio>",
  "strengths": ["<specific strength with evidence>", ...],
  "weaknesses": ["<specific weakness with evidence>", ...],
  "recommendations": ["<actionable, specific recommendation>", ...],
  "portfolioAnalysis": {
    "designScore": <0-100>,
    "designFeedback": "<3+ sentences on visual design, UX, typography, color, layout>",
    "contentScore": <0-100>,
    "contentFeedback": "<3+ sentences on content strategy, project presentation, storytelling>"
  },
  "projectAnalysis": [
    {
      "name": "<repo or project name>",
      "score": <0-100>,
      "feedback": "<2+ sentences of specific, constructive feedback>",
      "techStack": ["<tech>", ...],
      "highlights": ["<what's good>"],
      "improvements": ["<what could be better>"]
    }
  ],
  "technicalSkills": {
    "score": <0-100>,
    "feedback": "<assessment based on actual code patterns, not just claimed skills>",
    "strengths": ["<demonstrated skill>", ...],
    "gaps": ["<missing skill for target role>", ...]
  },
  "roleAlignment": {
    "score": <0-100>,
    "feedback": "<how well does this portfolio position them for ${data.targetRole}>",
    "missingSkills": ["<skill they need>", ...],
    "relevantProjects": ["<project that helps>", ...]
  }
}

**Rules:**
- Analyze ALL repos/projects found, not just a subset.
- Be honest but constructive — point out real gaps, not just give praise.
- Every piece of feedback must reference something specific (a repo name, a design choice, etc).
- Scores should be realistic: 50 = mediocre, 70 = solid, 85+ = excellent.
- Return ONLY valid JSON.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_completion_tokens: 4096,
    });

    const text = completion.choices[0].message.content || '';

    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze portfolio with AI');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: PortfolioReviewData = await request.json();

    // Validate required fields — GitHub is now required, portfolio URL is optional
    if (!data.githubUrl || !data.targetRole) {
      return NextResponse.json(
        { error: 'GitHub profile URL and target role are required' },
        { status: 400 }
      );
    }

    // Fetch GitHub repositories (always — it's now required)
    const repos = await fetchGitHubRepos(data.githubUrl);

    // Analyze portfolio with AI
    const analysis = await analyzePortfolioWithAI(data, repos);

    // Log activity (fire-and-forget)
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (user) {
          logActivity(user.id, {
            activityType: 'portfolio',
            score: analysis.overallScore ?? null,
            metadata: { targetRole: data.targetRole, githubUrl: data.githubUrl },
          });
        }
      }
    } catch (logErr) {
      console.error('Activity log error (portfolio):', logErr);
    }

    return NextResponse.json({
      success: true,
      analysis,
      repos: repos.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        topics: repo.topics
      }))
    });

  } catch (error) {
    console.error('Portfolio review error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze portfolio' },
      { status: 500 }
    );
  }
} 