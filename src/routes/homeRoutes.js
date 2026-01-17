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

module.exports = router;