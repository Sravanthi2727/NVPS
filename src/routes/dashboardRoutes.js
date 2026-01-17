/**
 * Dashboard Routes
 * Routes for user dashboard and related functionality
 */

const express = require('express');
const router = express.Router();

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}

// Dashboard route
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  console.log('📊 DASHBOARD ROUTE CALLED');
  res.render('dashboard', {
    title: 'My Dashboard - Rabuste Coffee',
    description: 'Manage your wishlist, cart, workshop registrations, and requests at Rabuste Coffee.',
    currentPage: '/dashboard',
    user: req.user
  });
});

// User dashboard route
router.get('/user-dashboard', ensureAuthenticated, (req, res) => {
  console.log('👤 USER DASHBOARD ROUTE CALLED');
  res.render('user-dashboard', {
    title: 'User Dashboard - Rabuste Coffee',
    description: 'Manage your wishlist, cart, workshop registrations, and requests.',
    currentPage: '/user-dashboard',
    user: req.user,
    currentUser: req.user,
    GOOGLE_MAPS_API: process.env.GOOGLE_MAPS_API
  });
});

module.exports = router;