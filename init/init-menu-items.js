const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const MenuItem = require('../models/MenuItem');
const connectDB = require('../config/database');

// Connect to database
connectDB();

// Read menu items JSON file
const menuItemsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'menu-items.json'), 'utf8')
);

// Function to initialize menu items in database
async function initMenuItems() {
  try {
    console.log('Starting menu items initialization...');
    
    // Clear existing menu items (optional - comment out if you want to keep existing data)
    // await MenuItem.deleteMany({});
    // console.log('Cleared existing menu items');
    
    let created = 0;
    let skipped = 0;
    
    // Insert each menu item
    for (const itemData of menuItemsData) {
      // Check if menu item already exists
      const existingItem = await MenuItem.findOne({ 
        name: itemData.name,
        category: itemData.category,
        subCategory: itemData.subCategory
      });
      
      if (existingItem) {
        console.log(`Skipping "${itemData.name}" - already exists`);
        skipped++;
        continue;
      }
      
      // Create new menu item
      const menuItem = new MenuItem({
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category: itemData.category,
        subCategory: itemData.subCategory,
        image: itemData.image,
        isAvailable: true,
        displayOrder: itemData.displayOrder || 0
      });
      
      await menuItem.save();
      console.log(`✓ Created: "${itemData.name}" - ₹${itemData.price}`);
      created++;
    }
    
    console.log('\n=== Initialization Complete ===');
    console.log(`Created: ${created} menu items`);
    console.log(`Skipped: ${skipped} menu items (already exist)`);
    console.log(`Total: ${menuItemsData.length} menu items in JSON file`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing menu items:', error);
    process.exit(1);
  }
}

// Wait for database connection, then initialize
mongoose.connection.once('open', () => {
  console.log('Database connected. Starting initialization...\n');
  initMenuItems();
});

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(1);
});

