/**
 * Test Menu Route Directly
 * Simulate the exact same logic as the controller
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = require('./config/database');
const MenuItem = require('./models/MenuItem');

async function testMenuRoute() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('🍽️ Menu route called via test');
    
    console.log('📦 MenuItem model loaded');
    
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, subCategory: 1, displayOrder: 1 });
    
    console.log('📊 Found menu items:', menuItems.length);
    
    if (menuItems.length === 0) {
      console.log('⚠️ No menu items found in database');
      // Check if any items exist at all
      const allItems = await MenuItem.find({});
      console.log('📋 Total items in database:', allItems.length);
    }
    
    // Group items by category and subcategory
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
    console.log('🔍 Sample grouped menu structure:', JSON.stringify(groupedMenu, null, 2).substring(0, 500) + '...');
    console.log('🎯 About to render menu template with menuItems:', typeof groupedMenu, Object.keys(groupedMenu).length);
    
    // Test the authentication check
    console.log('🔐 Testing authentication check...');
    const mockReq = {
      isAuthenticated: function() { return false; },
      user: null
    };
    
    const isLoggedIn = mockReq.isAuthenticated && mockReq.isAuthenticated();
    const currentUser = mockReq.user || null;
    
    console.log('🔐 isLoggedIn:', isLoggedIn);
    console.log('🔐 currentUser:', currentUser);
    
    // Simulate the render data
    const renderData = {
      title: 'Our Menu - Rabuste Coffee',
      description: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
      currentPage: '/menu',
      keywords: 'coffee menu, robusta coffee, café menu, coffee drinks, food menu',
      ogTitle: 'Our Menu - Rabuste Coffee',
      ogDescription: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/menu',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/menu',
      menuItems: groupedMenu,
      recommendedItems: [],
      isLoggedIn: isLoggedIn,
      currentUser: currentUser
    };
    
    console.log('📋 Render data keys:', Object.keys(renderData));
    console.log('📋 menuItems type:', typeof renderData.menuItems);
    console.log('📋 menuItems keys:', Object.keys(renderData.menuItems));
    
    console.log('✅ Test completed successfully - no errors found');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error('📍 Error stack:', error.stack);
    process.exit(1);
  }
}

testMenuRoute();