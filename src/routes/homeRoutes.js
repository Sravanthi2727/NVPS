/**
 * Home Routes
 * Routes for home page only
 */

const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  console.log('🏠 HOME ROUTE CALLED');
  
  // Production debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('🏠 Production Home Route Debug:', {
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      hasUser: !!req.user,
      currentUser: res.locals.currentUser ? res.locals.currentUser.email : 'None',
      isLoggedIn: res.locals.isLoggedIn
    });
  }
  
  res.render('home', { 
    title: 'Rabuste Coffee - Premium Robusta Coffee & Art',
    description: 'Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.',
    currentPage: '/',
    keywords: 'premium robusta coffee, art café, coffee shop, coffee and art, Rabuste Coffee',
    ogTitle: 'Rabuste Coffee - Premium Robusta Coffee & Art',
    ogDescription: 'Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.',
    ogType: 'website',
    ogUrl: 'https://rabustecoffee.com',
    ogImage: '/assets/coffee-bg.jpeg',
    canonicalUrl: 'https://rabustecoffee.com'
  });
});

// Virtual Tour page
router.get('/virtual-tour', (req, res) => {
  console.log('🏛️ VIRTUAL TOUR ROUTE CALLED');
  res.render('virtual-tour', { 
    title: 'Virtual Tour - Rabuste Coffee',
    description: 'Take a virtual tour of our Rabuste Coffee café and explore our space from the comfort of your home.',
    currentPage: '/virtual-tour',
    keywords: 'virtual tour, rabuste coffee, café tour, 360 tour, coffee shop tour',
    ogTitle: 'Virtual Tour - Rabuste Coffee',
    ogDescription: 'Take a virtual tour of our Rabuste Coffee café and explore our space from the comfort of your home.',
    ogType: 'website',
    ogUrl: 'https://rabustecoffee.com/virtual-tour',
    ogImage: '/assets/coffee-bg.jpeg',
    canonicalUrl: 'https://rabustecoffee.com/virtual-tour',
    layout: false // Disable layout for full-screen experience
  });
});

module.exports = router;