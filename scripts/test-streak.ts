import { ProgressService } from '../src/lib/progress';

async function testStreak() {
  try {
    console.log('Testing daily streak functionality...');
    
    // Get the user ID (assuming the first user for testing)
    const userId = 'cm47mhqbx0001zc6zru7xidq7'; // Replace with actual user ID if needed
    
    // Simulate an interview completion to trigger streak update
    await ProgressService.updateInterviewProgress(userId, {
      type: 'behavioral',
      score: 85,
      duration: 300,
      fillerWords: 3
    });
    
    console.log('Simulated interview completion...');
    
    // Get updated progress
    const progress = await ProgressService.getProgress(userId);
    
    console.log('Updated progress:');
    console.log(`Current Streak: ${progress.currentStreak}`);
    console.log(`Longest Streak: ${progress.longestStreak}`);
    console.log(`Total Active Days: ${progress.totalActiveDays}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testStreak();
