import { prisma } from './src/lib/prisma';

async function checkDuplicates() {
  try {
    console.log('🔍 Checking for duplicate resume analyses...\n');
    
    // Check resume analyses
    const resumeAnalyses = await prisma.resumeAnalysis.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    console.log('📄 Resume Analyses found:', resumeAnalyses.length);
    
    if (resumeAnalyses.length > 0) {
      console.log('\nRecent analyses:');
      resumeAnalyses.slice(0, 10).forEach((analysis, index) => {
        console.log(`${index + 1}. User: ${analysis.user.name}`);
        console.log(`   Score: ${analysis.score}`);
        console.log(`   Created: ${analysis.createdAt.toISOString()}`);
        console.log(`   ID: ${analysis.id}`);
        console.log('');
      });
      
      // Check for potential duplicates (same user, same score, within 1 minute)
      const duplicateGroups = new Map();
      
      resumeAnalyses.forEach(analysis => {
        const key = `${analysis.userId}-${analysis.score}`;
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key).push(analysis);
      });
      
      console.log('🔍 Checking for potential duplicates...');
      let foundDuplicates = false;
      
      duplicateGroups.forEach((group, key) => {
        if (group.length > 1) {
          foundDuplicates = true;
          console.log(`\n⚠️  Potential duplicates found for user-score: ${key}`);
          group.forEach(analysis => {
            console.log(`   - ID: ${analysis.id}, Created: ${analysis.createdAt.toISOString()}`);
          });
        }
      });
      
      if (!foundDuplicates) {
        console.log('✅ No obvious duplicates found based on user+score');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
