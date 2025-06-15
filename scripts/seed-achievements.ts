import { AchievementService } from '../src/lib/achievements';

async function seedAchievements() {
  try {
    console.log('🎯 Seeding achievements for user retention...');
    await AchievementService.initializeAchievements();
    console.log('✅ Successfully seeded all achievements!');
    console.log('🚀 Your retention system is ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  }
}

seedAchievements();
