import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
As a senior software engineer and technical reviewer, analyze this portfolio and provide detailed feedback.

**IMPORTANT: Please visit and analyze the portfolio website at ${data.portfolioUrl} to understand the projects, skills, experience, and overall presentation. Examine the content, design, projects showcased, and technical skills displayed.**

**Portfolio Information:**
- Portfolio URL: ${data.portfolioUrl}
- Target Role: ${data.targetRole}
- Experience Level: ${data.experience}
- GitHub Profile: ${data.githubUrl || 'Not provided'}
- Specific Feedback Areas: ${data.specificFeedback || 'General review'}

**GitHub Repositories:**
${repoDetails.length > 0 ? JSON.stringify(repoDetails, null, 2) : 'No repositories found'}

Based on your analysis of the portfolio website content and GitHub repositories, please provide a comprehensive portfolio review in the following JSON format:

{
  "overallScore": 85,
  "overallFeedback": "Brief overall assessment...",
  "strengths": [
    "Strong point 1",
    "Strong point 2",
    "Strong point 3"
  ],
  "weaknesses": [
    "Area for improvement 1",
    "Area for improvement 2"
  ],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "portfolioAnalysis": {
    "designScore": 80,
    "designFeedback": "Detailed feedback on portfolio design and UX...",
    "contentScore": 75,
    "contentFeedback": "Feedback on portfolio content and presentation..."
  },
  "projectAnalysis": [
    {
      "name": "Project Name",
      "score": 85,
      "feedback": "Detailed project feedback...",
      "techStack": ["React", "Node.js"],
      "highlights": ["Good use of modern frameworks"],
      "improvements": ["Add more documentation"]
    }
  ],
  "technicalSkills": {
    "score": 88,
    "feedback": "Assessment of technical skills based on projects...",
    "strengths": ["Clean code", "Good architecture"],
    "gaps": ["Testing coverage", "Documentation"]
  },
  "roleAlignment": {
    "score": 82,
    "feedback": "How well the portfolio aligns with the target role...",
    "missingSkills": ["Skill 1", "Skill 2"],
    "relevantProjects": ["Project 1", "Project 2"]
  }
}

**ANALYSIS REQUIREMENTS:**
1. Visit the portfolio website and extract information about all projects shown
2. For projectAnalysis, include ALL projects found on the website with their details
3. Analyze the website design, user experience, and content presentation
4. Consider both the website content and GitHub repositories in your assessment
5. Rate each section on a scale of 0-100
6. Be constructive and specific in your feedback
7. Focus on actionable advice that will help improve their portfolio for their target role

Make sure to analyze projects like InterviewSense, Orbit, Price2Produce, SafeWalker and any other projects displayed on the portfolio website.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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

    // Validate required fields
    if (!data.portfolioUrl || !data.targetRole) {
      return NextResponse.json(
        { error: 'Portfolio URL and target role are required' },
        { status: 400 }
      );
    }

    // Fetch GitHub repositories if GitHub URL is provided
    let repos: GitHubRepo[] = [];
    if (data.githubUrl) {
      repos = await fetchGitHubRepos(data.githubUrl);
    }

    // Analyze portfolio with AI
    const analysis = await analyzePortfolioWithAI(data, repos);

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