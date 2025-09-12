#!/usr/bin/env node

/**
 * Master script to clean existing generated content and ingest new SimplifyJobs data
 * This script orchestrates the complete data refresh process
 */

const path = require('path');
const { main: cleanupMain } = require('./cleanup-generated-content');
const { main: ingestMain } = require('./ingest-simplify-jobs');

/**
 * Main execution function
 */
async function main() {
  console.log('🔄 Starting complete data refresh process...');
  console.log('This will delete all existing generated content and replace it with SimplifyJobs data.\n');
  
  try {
    // Step 1: Clean existing content
    console.log('========================================');
    console.log('STEP 1: Cleaning existing generated content');
    console.log('========================================');
    cleanupMain();
    
    console.log('\n');
    
    // Step 2: Ingest new data
    console.log('========================================');
    console.log('STEP 2: Ingesting SimplifyJobs data');
    console.log('========================================');
    await ingestMain();
    
    console.log('\n');
    console.log('🎉 Complete data refresh process finished successfully!');
    console.log('✅ All existing generated content has been replaced with fresh SimplifyJobs data.');
    
  } catch (error) {
    console.error('\n❌ Error during data refresh process:', error.message);
    console.error('💡 You may need to manually check the generated-content directory.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };