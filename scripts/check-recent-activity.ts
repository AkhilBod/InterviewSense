import { prisma } from '../src/lib/prisma';

async function checkRecentActivity() {
  try {
    console.log('🔍 Checking recent activity in database...');
    
    // Get all users to see who we have
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log('👥 Users:', users);
    
    if (users.length > 0) {
      const userId = users[0].id;
      console.log(`📊 Checking activity for user: ${userId}`);
      
      // Check interview sessions
      const sessions = await prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          type: true,
          score: true,
          completedAt: true,
        }
      });
      console.log('🎤 Interview Sessions:', sessions);
      
      // Check resume analyses
      const analyses = await prisma.resumeAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          overallScore: true,
          createdAt: true,
        }
      });
      console.log('📄 Resume Analyses:', analyses);
    }
    
  } catch (error) {
    console.error('❌ Error checking recent activity:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentActivity();
