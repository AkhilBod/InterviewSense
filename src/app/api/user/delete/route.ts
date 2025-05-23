import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // If user does not exist, return an error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user to remove username (partial data deletion)
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        name: null,
        // Add other fields you want to anonymize here
        // For example: profile: null, preferences: null, etc.
      },
    });

    return NextResponse.json({ success: true, message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
  }
}
