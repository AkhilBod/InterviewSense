import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// Generate behavioral interview questions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company, role, numberOfQuestions = 5, interviewType = 'behavioral' } = await req.json();

    // Prompt for generating behavioral questions based on interview type
    const prompt = `Generate ${numberOfQuestions} interview questions for a ${role} position at ${company}.

INTERVIEW TYPE: ${interviewType}

QUESTION STYLE BY TYPE:

If interviewType is "recruiter_screen":
- Focus on: motivation for applying, career goals, salary expectations, availability, high-level experience overview, culture fit, "tell me about yourself", why this company, why this role
- Tone: conversational, screening-level, not deeply technical
- Examples: "Walk me through your resume.", "What interests you about this role at ${company}?", "Where do you see yourself in 3 years?"

If interviewType is "behavioral":
- Focus on: STAR-method questions about past experiences — leadership, conflict resolution, teamwork, failure, ambiguity, prioritization, delivering under pressure
- Every question must start with "Tell me about a time..." or "Describe a situation where..." or "Give me an example of..."
- Examples: "Tell me about a time you disagreed with your manager. How did you handle it?", "Describe a situation where you had to deliver results with incomplete information."

If interviewType is "technical":
- Focus on: fundamental technical concepts relevant to ${role}, system design reasoning, debugging scenarios, technical decision-making, architecture trade-offs
- These are NOT coding questions — they are verbal technical questions asked in interviews
- Examples: "Explain the difference between SQL and NoSQL databases and when you'd use each.", "How would you debug a production service that's returning 500 errors intermittently?", "What happens when you type a URL into a browser?"

If interviewType is "mix":
- Generate a balanced mix: ~25% recruiter screen, ~40% behavioral, ~35% technical
- Order them as they would appear in a real interview: start with screen questions, then behavioral, then technical

Return ONLY a JSON array of question strings. No other text.`;

    // Generate the questions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    let questionsText = completion.choices[0].message.content || '';

    // Try to extract just the JSON part
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/;
    const match = questionsText.match(jsonRegex);
    if (match) {
      questionsText = match[1] || match[2];
    }

    try {
      const questions = JSON.parse(questionsText);
      return NextResponse.json({ questions });
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse questions result' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating behavioral questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate behavioral interview questions' },
      { status: 500 }
    );
  }
}

// Analyze the submitted behavioral interview answers
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const {
      company,
      role,
      questions,
      answers,
      interviewType = 'behavioral'
    } = await req.json();

    // Prepare the Q&A pairs for analysis
    const qaPairs = questions.map((q: string, i: number) => `Question: ${q}\nAnswer: ${answers[i]}`).join('\n\n');

    // Prompt for answers analysis
    const analysisPrompt = `
You are an interview coach evaluating a candidate for a ${role} position at ${company}.
Interview type: ${interviewType}

The candidate answered the following questions:

${qaPairs}

EVALUATION CRITERIA BY TYPE:

For recruiter_screen questions:
- Did they clearly articulate their background and motivation?
- Was their answer concise and engaging (not rambling)?
- Did they show genuine interest in the company/role?
- Were salary/timeline expectations handled professionally?

For behavioral questions:
- Did they use the STAR method (Situation, Task, Action, Result)?
- Were examples specific with measurable outcomes?
- Did they demonstrate the competency the question was targeting?
- Was the story relevant to the role?

For technical questions:
- Was the technical explanation accurate?
- Did they demonstrate depth of understanding (not just surface-level)?
- Did they discuss trade-offs?
- Could they explain complex concepts clearly?

Score each answer 0-100 based on these criteria. A decent answer covering the basics gets 60-70. A strong, specific answer with good structure gets 75-85. Exceptional gets 85+.

Format your response as valid JSON with the following structure:
{
  "answerScores": number[],
  "overallScore": number,
  "strengths": string[],
  "improvementAreas": string[],
  "detailedFeedback": string[],
  "generalAdvice": string
}
`;

    // Generate the analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
      max_completion_tokens: 2048,
    });

    let analysisText = completion.choices[0].message.content || '';

    // Try to extract just the JSON part
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
    const match = analysisText.match(jsonRegex);
    if (match) {
      analysisText = match[1] || match[2];
    }

    try {
      const analysis = JSON.parse(analysisText);
      
      // Ensure all expected fields are available
      const validatedAnalysis = {
        answerScores: Array.isArray(analysis.answerScores) ? analysis.answerScores : questions.map(() => 0),
        overallScore: analysis.overallScore || 0,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : ["Good effort"],
        improvementAreas: Array.isArray(analysis.improvementAreas) ? analysis.improvementAreas : ["Practice more structured responses"],
        detailedFeedback: Array.isArray(analysis.detailedFeedback) ? analysis.detailedFeedback : questions.map(() => "No specific feedback available."),
        generalAdvice: analysis.generalAdvice || "Practice using the STAR method (Situation, Task, Action, Result) to structure your responses."
      };
      
      // Track progress for behavioral interview completion using new stats system
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true }
        });
        
        if (user) {
          // Update stats using the new system directly
          // Get or create user stats
          let userStats = await prisma.userStats.findUnique({
            where: { userId: user.id }
          });

          if (!userStats) {
            userStats = await prisma.userStats.create({
              data: {
                userId: user.id,
                dailyStreak: 0,
                longestStreak: 0,
                weeklyGoal: 3,
                weeklyProgress: 0,
                weeklyGoalsMet: 0,
                bestInterviewScore: 0,
                bestResumeScore: 0,
                bestTechnicalScore: 0,
                bestBehavioralScore: 0,
                totalSessions: 0,
                totalInterviews: 0,
                totalResumeChecks: 0,
                totalTimeMinutes: 0,
                lastScore: 0,
                averageScore: 0,
                recentSessions: [],
                scoreImprovement: 0,
                streakImprovement: 0,
              }
            });
          }

          // Update stats for this behavioral interview
          const now = new Date();
          const sessionDuration = Math.floor(Math.random() * 20) + 10; // Estimate 10-30 minutes
          const score = validatedAnalysis.overallScore;

          // Calculate streak logic
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const lastActivityDate = userStats.lastActivityDate;
          let newDailyStreak = userStats.dailyStreak;

          if (lastActivityDate) {
            const lastActivityDay = new Date(lastActivityDate.getFullYear(), lastActivityDate.getMonth(), lastActivityDate.getDate());
            const daysDiff = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 0) {
              // Same day, no streak change
            } else if (daysDiff === 1) {
              // Consecutive day, increment streak
              newDailyStreak += 1;
            } else {
              // Streak broken, reset to 1
              newDailyStreak = 1;
            }
          } else {
            // First activity
            newDailyStreak = 1;
          }

          // Update recent sessions
          const recentSessions = Array.isArray(userStats.recentSessions) 
            ? userStats.recentSessions as any[] 
            : [];
          
          const newSession = {
            type: 'behavioral',
            score: score,
            duration: sessionDuration,
            date: now.toISOString(),
            improvements: validatedAnalysis.improvementAreas.slice(0, 3)
          };
          
          const updatedRecentSessions = [newSession, ...recentSessions].slice(0, 10);

          // Update stats
          await prisma.userStats.update({
            where: { userId: user.id },
            data: {
              dailyStreak: newDailyStreak,
              longestStreak: Math.max(userStats.longestStreak, newDailyStreak),
              lastActivityDate: now,
              bestBehavioralScore: Math.max(userStats.bestBehavioralScore, score),
              bestInterviewScore: Math.max(userStats.bestInterviewScore, score),
              totalSessions: userStats.totalSessions + 1,
              totalInterviews: userStats.totalInterviews + 1,
              totalTimeMinutes: userStats.totalTimeMinutes + sessionDuration,
              lastScore: score,
              scoreImprovement: score - userStats.lastScore,
              recentSessions: updatedRecentSessions,
              averageScore: updatedRecentSessions.filter(s => s.score !== null).length > 0
                ? updatedRecentSessions.filter(s => s.score !== null).reduce((sum, s) => sum + s.score, 0) / updatedRecentSessions.filter(s => s.score !== null).length
                : 0,
              weeklyProgress: userStats.weeklyProgress + 1,
            }
          });

          // Create practice session record
          await prisma.practiceSession.create({
            data: {
              userId: user.id,
              type: 'behavioral',
              score: score,
              duration: sessionDuration,
              completed: true,
              improvements: validatedAnalysis.improvementAreas.slice(0, 3),
            }
          });
          console.log('🎯 New stats system updated for behavioral interview');

          // Also create ActivityLog entry for dashboard heatmap/feed
          logActivity(user.id, {
            activityType: 'behavioral',
            score,
          });
        }
      } catch (progressError) {
        console.error('Error tracking progress with new stats system:', progressError);
        // Don't fail the main request if progress tracking fails
      }
      
      return NextResponse.json(validatedAnalysis);
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse analysis result' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error analyzing behavioral answers:', error);
    return NextResponse.json(
      { error: 'Failed to analyze behavioral interview answers' },
      { status: 500 }
    );
  }
}
