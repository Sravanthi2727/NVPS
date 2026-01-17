/**
 * Admin Routes
 * Routes for admin dashboard and management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin } = require('../../middleware/adminAuth');

// All admin routes require admin role
router.use(ensureAdmin);

// Admin dashboard
router.get('/', adminController.getDashboard);

// Test route (for debugging)
router.get('/test', (req, res) => {
  console.log('🧪 Admin test route called');
  res.json({ 
    message: 'Admin routes working!', 
    timestamp: new Date(),
    user: req.user ? { email: req.user.email, role: req.user.role } : 'No user'
  });
});

// Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/api/analytics', adminController.getAnalyticsAPI);

// Menu Management
router.get('/menu-management', ensureAdmin, adminController.getMenuManagement);
router.get('/api/menu-items', ensureAdmin, adminController.getMenuItems);
router.get('/api/menu-items/:id', ensureAdmin, adminController.getMenuItemById);
router.post('/api/menu-items', ensureAdmin, adminController.addMenuItem);
router.put('/api/menu-items/:id', ensureAdmin, adminController.updateMenuItem);
router.delete('/api/menu-items/:id', ensureAdmin, adminController.deleteMenuItem);

// Artwork Management
router.get('/manage-artworks', adminController.getManageArtworks);
router.post('/api/add-artwork', adminController.getUpload().single('image'), adminController.addArtwork);
router.get('/api/artwork/:id', adminController.getArtworkById);
router.put('/api/update-artwork/:id', adminController.getUpload().single('image'), adminController.updateArtwork);
router.delete('/api/delete-artwork/:id', adminController.deleteArtwork);

// Cart requests management
router.get('/cart-requests', adminController.getCartRequests);
router.post('/cart-requests/:id/update', adminController.updateCartRequest);

// Art requests management
router.get('/art-requests', adminController.getArtRequests);
router.post('/art-requests/:id/update', adminController.updateArtRequest);

// Workshop requests management
router.get('/workshop-requests', adminController.getWorkshopRequests);
router.post('/workshop-requests/:id/update', adminController.updateWorkshopRequest);

// Workshop creation
router.post('/workshops/create', adminController.createWorkshop);
router.post('/workshops/draft', adminController.saveWorkshopDraft);

// Franchise applications management
router.get('/franchise', adminController.getFranchise);
router.get('/franchise-requests', adminController.getFranchise);

// User management
router.get('/users', adminController.getUsers);
router.post('/users/:id/update', adminController.updateUser);

module.exports = router;