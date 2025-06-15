import { prisma } from '../src/lib/prisma';

async function quickCheck() {
  try {
    const progress = await prisma.userProgress.findFirst({
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (progress) {
      console.log(`User: ${progress.user.email}`);
      console.log(`Current Streak: ${progress.currentStreak}`);
      console.log(`Longest Streak: ${progress.longestStreak}`);
      console.log(`Last Activity: ${progress.lastActivityDate}`);
      console.log(`Total Active Days: ${progress.totalActiveDays}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck();
