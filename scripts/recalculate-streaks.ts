import { prisma } from '../src/lib/prisma';

// Manually recalculate all user streaks
async function recalculateStreaks() {
  try {
    const users = await prisma.user.findMany({
      include: {
        progress: true
      }
    });

    for (const user of users) {
      if (user.progress) {
        console.log(`Recalculating streak for ${user.email}...`);
        
        // Calculate current streak based on daily activities
        const currentStreak = await calculateCurrentStreak(user.id);
        
        console.log(`Current streak for ${user.email}: ${currentStreak}`);
        
        // Update the user progress
        await prisma.userProgress.update({
          where: { userId: user.id },
          data: {
            currentStreak,
            longestStreak: Math.max(currentStreak, user.progress.longestStreak),
          },
        });
        
        console.log(`Updated streak for ${user.email} to ${currentStreak}`);
      }
    }

    console.log('Streak recalculation complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Calculate current streak by counting consecutive days backwards from today
async function calculateCurrentStreak(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all daily activities for this user, ordered by date descending
  const activities = await prisma.dailyActivity.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true }
  });
  
  if (activities.length === 0) {
    return 0;
  }
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Count consecutive days backwards from today
  for (const activity of activities) {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);
    
    // Check if this activity is on the current date we're checking
    if (activityDate.getTime() === currentDate.getTime()) {
      streak++;
      console.log(`Found activity on ${activityDate.toDateString()}, streak now: ${streak}`);
      // Move to the previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Check if there's a gap of exactly 1 day
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      
      if (activityDate.getTime() === expectedDate.getTime()) {
        // Continue with the previous day
        streak++;
        console.log(`Found activity on ${activityDate.toDateString()}, streak now: ${streak}`);
        currentDate.setDate(currentDate.getDate() - 2); // Skip the gap day
      } else {
        // Gap found, streak is broken
        console.log(`Gap found at ${activityDate.toDateString()}, breaking streak`);
        break;
      }
    }
  }
  
  return streak;
}

recalculateStreaks();
