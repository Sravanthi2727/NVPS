const fs = require('fs');
const path = require('path');

// Function to rename files with spaces to use underscores
function renameFilesInDirectory(dirPath) {
  console.log(`Processing directory: ${dirPath}`);
  
  try {
    const files = fs.readdirSync(dirPath);
    let renamedCount = 0;
    
    files.forEach(file => {
      if (file.includes(' ')) {
        const oldPath = path.join(dirPath, file);
        const newFileName = file.replace(/\s+/g, '_');
        const newPath = path.join(dirPath, newFileName);
        
        try {
          fs.renameSync(oldPath, newPath);
          console.log(`  Renamed: "${file}" -> "${newFileName}"`);
          renamedCount++;
        } catch (error) {
          console.error(`  ❌ Failed to rename "${file}":`, error.message);
        }
      }
    });
    
    console.log(`✅ Renamed ${renamedCount} files in ${dirPath}\n`);
    return renamedCount;
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    return 0;
  }
}

// Directories to process
const directories = [
  './public/assets',
  './public/assets/menu_images',
  './public/assets/workshops'
];

console.log('🔧 Renaming image files with spaces...\n');

let totalRenamed = 0;
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    totalRenamed += renameFilesInDirectory(dir);
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
});

console.log(`🎉 Completed! Renamed ${totalRenamed} files total.`);
console.log('\n📝 Next steps:');
console.log('1. Test the application to ensure images load correctly');
console.log('2. Check for any remaining 404 errors in browser console');
console.log('3. Remove this script file when done');