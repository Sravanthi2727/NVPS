/**
 * Menu Routes
 * Routes for menu page and menu-related functionality
 */

const express = require('express');
const router = express.Router();

// Menu page route
router.get('/menu', async (req, res) => {
  try {
    console.log('🍽️ MENU ROUTE CALLED');
    const MenuItem = require('../../models/MenuItem');
    const BackgroundImage = require('../../models/BackgroundImage');
    
    // Fetch menu items
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, subCategory: 1, displayOrder: 1 });
    console.log('🍽️ Found', menuItems.length, 'menu items');
    
    // Fetch active background for menu page
    const backgroundImage = await BackgroundImage.findOne({ page: 'menu', isActive: true });
    console.log('🖼️ Menu background:', backgroundImage ? backgroundImage.imageUrl : 'none');
    
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
    
    console.log('🍽️ Grouped categories:', Object.keys(groupedMenu));
    
    res.render('menu', {
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
      backgroundImage: backgroundImage,
      isLoggedIn: req.isAuthenticated ? req.isAuthenticated() : false,
      currentUser: req.user || null
    });
  } catch (error) {
    console.error('🍽️ MENU ERROR:', error);
    res.render('menu', {
      title: 'Our Menu - Rabuste Coffee',
      description: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
      currentPage: '/menu',
      menuItems: {},
      recommendedItems: [],
      backgroundImage: null,
      isLoggedIn: false,
      currentUser: null
    });
  }
});

// Test menu route
router.get('/menu-test', async (req, res) => {
  try {
    console.log('🧪 TEST MENU ROUTE CALLED');
    const MenuItem = require('../../models/MenuItem');
    const menuItems = await MenuItem.find({ isAvailable: true });
    console.log('🧪 TEST: Found', menuItems.length, 'menu items');
    
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
    
    console.log('🧪 TEST: Grouped categories:', Object.keys(groupedMenu));
    
    res.render('menu', {
      title: 'Test Menu - Rabuste Coffee',
      description: 'Test menu page',
      currentPage: '/menu-test',
      menuItems: groupedMenu,
      recommendedItems: [],
      isLoggedIn: false,
      currentUser: null
    });
  } catch (error) {
    console.error('🧪 TEST MENU ERROR:', error);
    res.json({ error: error.message, stack: error.stack });
  }
});

// Recommendations endpoint
router.get('/recommendations', async (req, res) => {
  try {
    console.log('📊 Fetching recommendations...');
    const MenuItem = require('../../models/MenuItem');
    
    // Get 4 random menu items from database
    const randomItems = await MenuItem.aggregate([
      { $sample: { size: 4 } }
    ]);
    
    console.log('📊 Random items for recommendations:', randomItems);
    
    if (randomItems && randomItems.length > 0) {
      res.json({
        success: true,
        recommendations: randomItems
      });
    } else {
      res.json({
        success: false,
        recommendations: []
      });
    }
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;