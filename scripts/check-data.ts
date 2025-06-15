import { prisma } from '../src/lib/prisma';

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database data...\n');
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    console.log('👥 Users in database:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    console.log('');
    
    // Check user progress
    const userProgress = await prisma.userProgress.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    console.log('📈 User Progress records:', userProgress.length);
    userProgress.forEach(progress => {
      console.log(`  - User: ${progress.user.name}`);
      console.log(`    Total Interviews: ${progress.totalInterviews}`);
      console.log(`    Current Streak: ${progress.currentStreak}`);
      console.log(`    Total XP: ${progress.totalXP}`);
      console.log(`    Level: ${progress.level}`);
      console.log(`    Best Score: ${progress.bestScore}`);
    });
    
    console.log('');
    
    // Check achievements
    const achievements = await prisma.achievement.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        rarity: true,
        xpReward: true
      },
      take: 5
    });
    console.log('🏆 Sample Achievements:', achievements.length > 0 ? achievements.length : 'None');
    achievements.forEach(achievement => {
      console.log(`  - ${achievement.name} (${achievement.category}, ${achievement.rarity}) - ${achievement.xpReward} XP`);
    });
    
    console.log('');
    
    // Check user achievements
    const userAchievements = await prisma.userAchievement.findMany({
      include: {
        user: { select: { name: true } },
        achievement: { select: { name: true } }
      }
    });
    console.log('🎖️ Unlocked User Achievements:', userAchievements.length);
    userAchievements.forEach(ua => {
      console.log(`  - ${ua.user.name}: ${ua.achievement.name} (${ua.unlockedAt.toISOString()})`);
    });
    
    console.log('\n✅ Database verification complete!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
