import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { resolveUser } from '@/lib/resolve-user';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await resolveUser(session.user);

    if (!user) {
      // Return default instead of 404 so the UI doesn't break
      return NextResponse.json({
        questionnaireCompleted: false
      });
    }

    const questionnaireCompleted = user.questionnaireCompleted || false;

    return NextResponse.json({
      questionnaireCompleted
    });
  } catch (error) {
    console.error('Error checking questionnaire status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
