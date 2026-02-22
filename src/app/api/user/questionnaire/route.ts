import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { goal, interviewType, experience, timeline, weakestArea } = body;

    if (!goal || !interviewType || !experience || !timeline || !weakestArea) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mark questionnaire as completed on the user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { questionnaireCompleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
