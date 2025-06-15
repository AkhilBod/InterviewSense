import { ProgressService } from '../src/lib/progress';
import { prisma } from '../src/lib/prisma';

async function testInterviewSession() {
  try {
    console.log('🎯 Testing interview session creation...');
    
    // Get the user
    const user = await prisma.user.findFirst({
      where: { email: 'akkiisan9@gmail.com' }
    });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', user.id);
    
    // Simulate a behavioral interview completion
    console.log('🎤 Creating mock behavioral interview...');
    await ProgressService.updateInterviewProgress(user.id, {
      type: 'behavioral',
      score: 85.5,
      duration: 1200, // 20 minutes
      fillerWords: 8,
      metrics: {
        questionsAnswered: 5,
        averageAnswerScore: 85.5,
        confidence: 8.2,
        clarity: 9.1
      }
    });
    
    console.log('✅ Behavioral interview session created!');
    
    // Check if the session was created
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 5
    });
    
    console.log('📊 Interview sessions:', sessions);
    
    // Also create a technical interview
    console.log('💻 Creating mock technical interview...');
    await ProgressService.updateInterviewProgress(user.id, {
      type: 'technical',
      score: 78.3,
      duration: 1800, // 30 minutes
      fillerWords: 12,
      metrics: {
        questionsAnswered: 3,
        averageAnswerScore: 78.3,
        technicalAccuracy: 8.5,
        problemSolving: 7.8
      }
    });
    
    console.log('✅ Technical interview session created!');
    
    // Check all sessions now
    const allSessions = await prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' }
    });
    
    console.log('📈 All interview sessions:', allSessions);
    
    // Check updated progress
    const progress = await prisma.userProgress.findUnique({
      where: { userId: user.id }
    });
    
    console.log('🎯 Updated progress:', {
      totalInterviews: progress?.totalInterviews,
      behavioralInterviews: progress?.behavioralInterviews,
      technicalInterviews: progress?.technicalInterviews,
      totalXP: progress?.totalXP,
      level: progress?.level,
      currentStreak: progress?.currentStreak
    });
    
  } catch (error) {
    console.error('❌ Error testing interview session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInterviewSession();
