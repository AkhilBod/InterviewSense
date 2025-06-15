import { prisma } from './src/lib/prisma';

async function cleanDuplicates() {
  try {
    console.log('🧹 Cleaning duplicate resume analyses...\n');
    
    // Find all resume analyses
    const resumeAnalyses = await prisma.resumeAnalysis.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    console.log('📄 Total resume analyses found:', resumeAnalyses.length);
    
    // Group by user and identify duplicates
    const userGroups = new Map();
    
    resumeAnalyses.forEach(analysis => {
      const userId = analysis.userId;
      if (!userGroups.has(userId)) {
        userGroups.set(userId, []);
      }
      userGroups.get(userId).push(analysis);
    });
    
    let totalDeleted = 0;
    
    // For each user, keep only the latest analysis and delete the rest
    for (const [userId, analyses] of userGroups) {
      if (analyses.length > 1) {
        console.log(`\n👤 User: ${analyses[0].user.name} has ${analyses.length} analyses`);
        
        // Sort by creation date (newest first)
        analyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Keep the first (newest) and delete the rest
        const toDelete = analyses.slice(1);
        
        for (const analysis of toDelete) {
          console.log(`   🗑️  Deleting analysis: ${analysis.id} (Created: ${analysis.createdAt.toISOString()})`);
          await prisma.resumeAnalysis.delete({
            where: { id: analysis.id }
          });
          totalDeleted++;
        }
        
        console.log(`   ✅ Kept latest analysis: ${analyses[0].id} (Created: ${analyses[0].createdAt.toISOString()})`);
      }
    }
    
    console.log(`\n🎯 Cleanup complete! Deleted ${totalDeleted} duplicate analyses.`);
    
  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicates();
