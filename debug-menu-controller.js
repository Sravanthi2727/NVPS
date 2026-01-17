/**
 * Debug Menu Controller
 * Test what the menu controller is actually returning
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = require('./config/database');
const MenuItem = require('./models/MenuItem');

async function debugMenuController() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('📊 Fetching menu items...');
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, subCategory: 1, displayOrder: 1 });
    
    console.log('📊 Found menu items:', menuItems.length);
    
    if (menuItems.length > 0) {
      console.log('📋 Sample items:');
      menuItems.slice(0, 3).forEach(item => {
        console.log(`- ${item.name} (${item.category}/${item.subCategory}) - ₹${item.price}`);
      });
    }
    
    // Group items by category and subcategory (same logic as controller)
    const groupedMenu = {};
    menuItems.forEach(item => {
      if (!groupedMenu[item.category]) {
        groupedMenu[item.category] = {};
      }
      if (!groupedMenu[item.category][item.subCategory]) {
        groupedMenu[item.category][item.subCategory] = [];
      }
      groupedMenu[item.category][item.subCategory].push(item);
    });

    console.log('🗂️ Grouped menu categories:', Object.keys(groupedMenu));
    console.log('📊 Object.keys(groupedMenu).length:', Object.keys(groupedMenu).length);
    
    // Check each category
    Object.keys(groupedMenu).forEach(category => {
      console.log(`📂 Category "${category}":`, Object.keys(groupedMenu[category]).length, 'subcategories');
      Object.keys(groupedMenu[category]).forEach(subCategory => {
        console.log(`  📁 SubCategory "${subCategory}":`, groupedMenu[category][subCategory].length, 'items');
      });
    });
    
    // Test the template condition
    const templateCondition = typeof groupedMenu !== 'undefined' && Object.keys(groupedMenu).length > 0;
    console.log('🧪 Template condition result:', templateCondition);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugMenuController();