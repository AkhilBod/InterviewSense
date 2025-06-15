import { prisma } from '../src/lib/prisma';

async function checkStreaks() {
  try {
    const progress = await prisma.userProgress.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        lastActivityDate: 'desc'
      }
    });

    console.log('Current streak data:');
    progress.forEach(p => {
      console.log(`${p.user.email}: Current: ${p.currentStreak}, Longest: ${p.longestStreak}, Last Activity: ${p.lastActivityDate}, Total Days: ${p.totalActiveDays}`);
    });

    // Check daily activities
    const dailyActivities = await prisma.dailyActivity.findMany({
      orderBy: {
        date: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    console.log('\nRecent daily activities:');
    dailyActivities.forEach(da => {
      console.log(`${da.user.email}: Date: ${da.date}, Interviews: ${da.interviewCount}, Resume Checks: ${da.resumeChecks}, XP: ${da.xpEarned}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStreaks();
