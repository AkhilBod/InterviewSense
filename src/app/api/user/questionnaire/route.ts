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
    const { role, targets, weakest, urgency, goals } = body;

    if (!role || !targets || !weakest || !urgency || !goals) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create questionnaire record (use any to bypass type system lag)
    const questionnaire = await (prisma as any).questionnaire.create({
      data: {
        userId: session.user.id,
        role,
        targets: targets as string[],
        weakest,
        urgency,
        goals: goals as string[],
        completedAt: new Date()
      }
    });

    // Update user to mark questionnaire as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: { questionnaireCompleted: true } as any
    });

    return NextResponse.json({
      success: true,
      questionnaire
    });
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
