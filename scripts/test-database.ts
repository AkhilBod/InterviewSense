import { prisma } from '../src/lib/prisma';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test if UserProgress table exists
    const userProgressCount = await prisma.userProgress.count();
    console.log(`✅ UserProgress table exists. Count: ${userProgressCount}`);
    
    // Test if Achievement table exists
    const achievementCount = await prisma.achievement.count();
    console.log(`✅ Achievement table exists. Count: ${achievementCount}`);
    
    // Test if UserAchievement table exists
    const userAchievementCount = await prisma.userAchievement.count();
    console.log(`✅ UserAchievement table exists. Count: ${userAchievementCount}`);
    
    console.log('🎉 All gamification tables are working correctly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
