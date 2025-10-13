#!/usr/bin/env node

/**
 * Script to delete all generated content while preserving directory structure
 * This will clean up all files in the generated-content directory
 */

const fs = require('fs');
const path = require('path');

const GENERATED_CONTENT_DIR = path.join(__dirname, '..', 'generated-content');

/**
 * Recursively delete all files in a directory but preserve the directory structure
 * @param {string} dirPath - Path to the directory
 */
function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory ${dirPath} does not exist.`);
    return;
  }

  const items = fs.readdirSync(dirPath);
  let deletedFiles = 0;
  let preservedDirs = 0;

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Recursively clean subdirectories
      const result = cleanDirectory(itemPath);
      deletedFiles += result.deletedFiles;
      preservedDirs += result.preservedDirs + 1;
    } else {
      // Delete files
      fs.unlinkSync(itemPath);
      deletedFiles++;
      console.log(`Deleted: ${itemPath}`);
    }
  }

  return { deletedFiles, preservedDirs };
}

/**
 * Main cleanup function
 */
function main() {
  console.log('🧹 Starting cleanup of generated content...');
  console.log(`Target directory: ${GENERATED_CONTENT_DIR}`);

  if (!fs.existsSync(GENERATED_CONTENT_DIR)) {
    console.error(`❌ Generated content directory does not exist: ${GENERATED_CONTENT_DIR}`);
    process.exit(1);
  }

  try {
    const result = cleanDirectory(GENERATED_CONTENT_DIR);
    
    console.log('\n✅ Cleanup completed successfully!');
    console.log(`📁 Directories preserved: ${result.preservedDirs}`);
    console.log(`🗑️  Files deleted: ${result.deletedFiles}`);
    
    // Verify directory structure is preserved
    const dirs = ['articles', 'data', 'indexes'];
    dirs.forEach(dir => {
      const dirPath = path.join(GENERATED_CONTENT_DIR, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`✓ Directory preserved: ${dir}/`);
      } else {
        console.log(`⚠️  Directory missing: ${dir}/`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { cleanDirectory, main };