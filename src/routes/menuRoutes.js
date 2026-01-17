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
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, subCategory: 1, displayOrder: 1 });
    console.log('🍽️ Found', menuItems.length, 'menu items');
    
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

module.exports = router;