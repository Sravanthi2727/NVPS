/**
 * Admin Routes
 * Routes for admin dashboard and management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware to ensure user is admin (you can implement proper admin check)
function ensureAdmin(req, res, next) {
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

// Cart requests management
router.get('/cart-requests', ensureAdmin, adminController.getCartRequests);
router.post('/cart-requests/:id/update', ensureAdmin, adminController.updateCartRequest);

// Art requests management
router.get('/art-requests', ensureAdmin, adminController.getArtRequests);
router.post('/art-requests/:id/update', ensureAdmin, adminController.updateArtRequest);

// Workshop requests management
router.get('/workshop-requests', ensureAdmin, adminController.getWorkshopRequests);
router.post('/workshop-requests/:id/update', ensureAdmin, adminController.updateWorkshopRequest);

// Workshop creation
router.post('/workshops/create', ensureAdmin, adminController.createWorkshop);
router.post('/workshops/draft', ensureAdmin, adminController.saveWorkshopDraft);

module.exports = router;