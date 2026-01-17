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
}

// Admin dashboard
router.get('/', ensureAdmin, adminController.getDashboard);

router.get('/manage-artworks', ensureAdmin, adminController.getManageArtworks);
router.post('/api/add-artwork', ensureAdmin, adminController.getUpload().single('image'), adminController.addArtwork);
router.get('/api/artwork/:id', ensureAdmin, adminController.getArtworkById);
router.put('/api/update-artwork/:id', ensureAdmin, adminController.getUpload().single('image'), adminController.updateArtwork);
router.delete('/api/delete-artwork/:id', ensureAdmin, adminController.deleteArtwork);

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

// Franchise applications management
router.get('/franchise', ensureAdmin, adminController.getFranchise);
router.get('/franchise-requests', ensureAdmin, adminController.getFranchise);

// User management
router.get('/users', ensureAdmin, adminController.getUsers);
router.post('/users/:id/update', ensureAdmin, adminController.updateUser);

module.exports = router;