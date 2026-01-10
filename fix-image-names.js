const fs = require('fs');
const path = require('path');

// Function to replace spaces with underscores in image paths
function fixImagePaths(filePath) {
  console.log(`Processing ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let modified = false;
    
    // Process each item in the array
    data.forEach(item => {
      if (item.image && item.image.includes(' ')) {
        const oldPath = item.image;
        item.image = item.image.replace(/\s+/g, '_');
        console.log(`  Fixed: "${oldPath}" -> "${item.image}"`);
        modified = true;
      }
      
      // Also check galleryImages if they exist
      if (item.galleryImages && Array.isArray(item.galleryImages)) {
        item.galleryImages.forEach((imgPath, index) => {
          if (imgPath.includes(' ')) {
            const oldPath = imgPath;
            item.galleryImages[index] = imgPath.replace(/\s+/g, '_');
            console.log(`  Fixed gallery: "${oldPath}" -> "${item.galleryImages[index]}"`);
            modified = true;
          }
        });
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`✅ No changes needed for ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process all JSON files in init directory
const initDir = './init';
const jsonFiles = [
  'artworks.json',
  'menu-items.json', 
  'workshops.json'
];

console.log('🔧 Fixing image paths with spaces...\n');

let totalFixed = 0;
jsonFiles.forEach(file => {
  const filePath = path.join(initDir, file);
  if (fs.existsSync(filePath)) {
    const wasModified = fixImagePaths(filePath);
    if (wasModified) totalFixed++;
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log(`\n🎉 Completed! Fixed ${totalFixed} files.`);
console.log('\n📝 Next steps:');
console.log('1. Update actual image files to match new naming convention');
console.log('2. Test the application to ensure images load correctly');
console.log('3. Remove this script file when done');