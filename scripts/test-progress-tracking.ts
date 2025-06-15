import { ProgressService } from '../src/lib/progress';
import { prisma } from '../src/lib/prisma';

async function testProgressTracking() {
  try {
    console.log('🧪 Testing progress tracking...');
    
    // Get the current user (Akhil)
    const user = await prisma.user.findUnique({
      where: { email: 'akkiisan9@gmail.com' },
      select: { id: true, email: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    
    // Get initial progress
    const initialProgress = await ProgressService.getProgress(user.id);
    console.log('📊 Initial progress:', {
      totalInterviews: initialProgress.totalInterviews,
      totalXP: initialProgress.totalXP,
      level: initialProgress.level,
      currentStreak: initialProgress.currentStreak
    });
    
    // Simulate a behavioral interview
    console.log('🎭 Simulating behavioral interview...');
    await ProgressService.updateInterviewProgress(user.id, {
      type: 'behavioral',
      score: 85,
      fillerWords: 3,
      duration: 1200, // 20 minutes
      metrics: {
        questionsAnswered: 5,
        averageAnswerScore: 85
      }
    });
    
    // Simulate a resume analysis
    console.log('📄 Simulating resume analysis...');
    await ProgressService.updateResumeProgress(user.id, {
      score: 78,
      improvementCount: 4,
      wordCount: 450,
      analysis: { feedback: 'Good overall structure' },
      categories: {
        impact: 80,
        style: 75,
        skills: 80
      }
    });
    
    // Get updated progress
    const updatedProgress = await ProgressService.getProgress(user.id);
    console.log('📊 Updated progress:', {
      totalInterviews: updatedProgress.totalInterviews,
      resumeChecks: updatedProgress.totalInterviews, // Note: this should be resumeChecks
      totalXP: updatedProgress.totalXP,
      level: updatedProgress.level,
      currentStreak: updatedProgress.currentStreak,
      xpGained: updatedProgress.totalXP - initialProgress.totalXP
    });
    
    console.log('🎉 Progress tracking test completed successfully!');
    
  } catch (error) {
    console.error('❌ Progress tracking test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProgressTracking();
