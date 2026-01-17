const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rabuste-coffee', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkMenuImages() {
  try {
    console.log('🔍 Checking menu items and their images...');
    
    const menuItems = await MenuItem.find().limit(10);
    console.log(`📊 Found ${menuItems.length} menu items (showing first 10):`);
    
    menuItems.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   SubCategory: ${item.subCategory}`);
      console.log(`   Image: ${item.image || 'NO IMAGE'}`);
      console.log(`   Available: ${item.isAvailable}`);
    });
    
    // Check for items with missing images
    const itemsWithoutImages = await MenuItem.find({ 
      $or: [
        { image: { $exists: false } },
        { image: '' },
        { image: null }
      ]
    });
    
    console.log(`\n⚠️  Items without images: ${itemsWithoutImages.length}`);
    
    if (itemsWithoutImages.length > 0) {
      console.log('Items missing images:');
      itemsWithoutImages.forEach(item => {
        console.log(`- ${item.name} (${item.category})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMenuImages();