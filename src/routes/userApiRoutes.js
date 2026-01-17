/**
 * User API Routes
 * All user-specific API endpoints
 */

const express = require('express');
const router = express.Router();

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Authentication required' });
}

// Get user's orders
router.get('/orders', async (req, res) => {
  try {
    console.log('=== USER ORDERS API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const Order = require('../../models/Order');
    
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userId = req.user._id || req.user.id;
      console.log('Fetching orders for authenticated user:', userId);
      
      // Find orders by userId (ObjectId) or by customer email as fallback
      const userOrders = await Order.find({
        $or: [
          { userId: userId },
          { customerEmail: req.user.email }
        ]
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${userOrders.length} orders for user ${userId} (${req.user.email})`);
      res.json(userOrders);
    } else {
      console.log('User not authenticated');
      // For debugging, return recent orders
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);
      console.log('Returning recent orders for debugging:', recentOrders.length);
      res.json(recentOrders);
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// Get user's purchased art item IDs (completed orders only)
router.get('/purchased-arts', async (req, res) => {
  try {
    const Order = require('../../models/Order');
    
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userId = req.user._id || req.user.id;
      
      // Find completed orders with art items
      const completedArtOrders = await Order.find({
        userId: userId,
        orderType: 'art',
        status: 'completed'
      });
      
      // Extract art item IDs from completed orders
      const purchasedArtIds = [];
      completedArtOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.type === 'art' && item.itemId) {
            purchasedArtIds.push(String(item.itemId));
          }
        });
      });
      
      // Remove duplicates
      const uniquePurchasedArtIds = [...new Set(purchasedArtIds)];
      
      console.log(`Found ${uniquePurchasedArtIds.length} purchased art items for user ${userId}`);
      res.json({ purchasedArtIds: uniquePurchasedArtIds });
    } else {
      res.json({ purchasedArtIds: [] });
    }
  } catch (error) {
    console.error('Error fetching purchased arts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchased arts', purchasedArtIds: [] });
  }
});

// Get user's franchise applications
router.get('/franchise', async (req, res) => {
  try {
    console.log('=== USER FRANCHISE API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const Franchise = require('../../models/Franchise');
    
    if (req.isAuthenticated && req.isAuthenticated()) {
      const userId = req.user._id || req.user.id;
      const userEmail = req.user.email;
      
      console.log('Fetching franchise applications for user:', userId, userEmail);
      
      // Find applications by userId or email (for backward compatibility)
      const userApplications = await Franchise.find({
        $or: [
          { userId: userId },
          { email: userEmail }
        ]
      }).sort({ submittedAt: -1 });
      
      console.log(`Found ${userApplications.length} franchise applications for user`);
      
      res.json({ success: true, applications: userApplications });
    } else {
      res.status(401).json({ success: false, message: 'Authentication required' });
    }
  } catch (error) {
    console.error('Error fetching user franchise applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch franchise applications', error: error.message });
  }
});

// Get user's workshop registrations
router.get('/workshops', ensureAuthenticated, async (req, res) => {
  try {
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const registrations = await WorkshopRegistration.find({ userId: req.user.id }).populate('workshopId');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workshop registrations' });
  }
});

// Get user's requests
router.get('/requests', ensureAuthenticated, async (req, res) => {
  try {
    const Request = require('../../models/Request');
    const requests = await Request.find({ userId: req.user.id });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching requests' });
  }
});

// Create new request
router.post('/requests', ensureAuthenticated, async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const Request = require('../../models/Request');
    const newRequest = new Request({
      userId: req.user.id,
      type,
      title,
      description,
      status: 'pending'
    });
    await newRequest.save();
    res.json({ success: true, item: newRequest });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting request' });
  }
});

// Get all users (for admin purposes)
router.get('/all', async (req, res) => {
  try {
    const User = require('../../models/User');
    const users = await User.find({}).select('googleId displayName email createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;