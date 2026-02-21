import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SavedQuestion {
  questionId: string;
  questionText: string;
  type: string;
  difficulty?: string;
  category?: string;
  company?: string;
  createdAt: Date;
}

export async function GET(request: Request) {
  try {
    // Get the most recently saved questions across all users
    const trendingSavedQuestions = await prisma.savedQuestion.findMany({
      select: {
        questionId: true,
        questionText: true,
        type: true,
        difficulty: true,
        category: true,
        company: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Get top 20 to ensure we have enough unique questions
    });

    // Group by questionId to avoid duplicates
    const uniqueQuestions = Array.from(
      new Map(
        trendingSavedQuestions.map((q: SavedQuestion) => [q.questionId, q])
      ).values()
    ).slice(0, 6);

    return NextResponse.json({
      success: true,
      questions: uniqueQuestions,
      total: uniqueQuestions.length,
    });
  } catch (error: any) {
    console.error('Error fetching trending questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending questions' },
      { status: 500 }
    );
  }
}

