/**
 * Admin Routes
 * Routes for admin dashboard and management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware to ensure user is admin (you can implement proper admin check)
function ensureAdmin(req, res, next) {
  // Temporarily allow all requests for testing - remove this in production
  console.log('Admin route accessed:', req.path);
  console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth method');
  console.log('User object:', req.user);
  
  // For now, just allow all requests to admin routes for testing
  return next();
  
  // Original code (commented out for testing):
  // if (req.isAuthenticated()) {
  //   return next();
  // }
  // res.redirect('/signin');
}

// Admin dashboard
router.get('/', ensureAdmin, adminController.getDashboard);

// Test route
router.get('/test', (req, res) => {
  console.log('TEST ROUTE HIT - Admin routes are working!');
  res.send('Admin routes are working! Test successful.');
});

// Cart requests management
router.get('/cart-requests', ensureAdmin, adminController.getCartRequests);
router.post('/cart-requests/:id/update', ensureAdmin, adminController.updateCartRequest);

// Art requests management
router.get('/art-requests', ensureAdmin, adminController.getArtRequests);
router.post('/art-requests/:id/update', ensureAdmin, adminController.updateArtRequest);

// Workshop requests management
router.get('/workshop-requests', ensureAdmin, adminController.getWorkshopRequests);
router.post('/workshop-requests/:id/update', ensureAdmin, adminController.updateWorkshopRequest);

module.exports = router;