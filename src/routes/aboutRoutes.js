/**
 * About Routes
 * Routes for about page and related functionality
 */

const express = require('express');
const router = express.Router();

// About page route
router.get('/about', (req, res) => {
  console.log('ℹ️ ABOUT ROUTE CALLED');
  res.render('about', {
    title: 'About Us - Rabuste Coffee',
    description: 'Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.',
    currentPage: '/about',
    keywords: 'about Rabuste Coffee, our story, coffee passion, Robusta coffee, café team',
    ogTitle: 'About Us - Rabuste Coffee',
    ogDescription: 'Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.',
    ogType: 'website',
    ogUrl: 'https://rabustecoffee.com/about',
    ogImage: '/assets/coffee-bg.jpeg',
    canonicalUrl: 'https://rabustecoffee.com/about',
    additionalCSS: '<link rel="stylesheet" href="/css/about.css">',
    additionalJS: '<script src="/js/about-animations.js"></script>'
  });
});

module.exports = router;