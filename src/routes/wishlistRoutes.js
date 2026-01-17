/**
 * Wishlist API Routes
 * All wishlist-related API endpoints
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

// Get user's wishlist
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== WISHLIST API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user ? { id: req.user._id || req.user.id, email: req.user.email } : 'No user');
    
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User wishlist:', user.wishlist ? user.wishlist.length : 0, 'items');
    res.json(user.wishlist || []);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json([]);
  }
});

// Check wishlist status for specific items
router.get('/check', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.json({ success: false, items: [] });
    }

    const wishlistItems = user.wishlist || [];
    res.json({ 
      success: true, 
      items: wishlistItems,
      exists: wishlistItems.length > 0 
    });
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    res.json({ success: false, items: [] });
  }
});

// Get wishlist count
router.get('/count', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.json({ count: 0 });
    }

    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    const count = user ? user.wishlist.length : 0;
    
    res.json({ count });
  } catch (error) {
    console.error('Wishlist count error:', error);
    res.status(500).json({ count: 0 });
  }
});

// Add item to wishlist
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== WISHLIST API CALLED ===');
    console.log('Request body:', req.body);
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const { itemId, name, price, image, type } = req.body;
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find(item => item.itemId === itemId);
    if (existingItem) {
      console.log('Item already exists in wishlist');
      return res.json({ success: false, message: 'Item already in wishlist' });
    }

    console.log('User before wishlist update:', {
      name: user.name,
      email: user.email,
      wishlistLength: user.wishlist.length
    });

    // Create wishlist item and add to wishlist array
    const wishlistItem = { 
      itemId, 
      name, 
      price, 
      image,
      type: type || 'menu' // Default to menu if not specified
    };
    user.wishlist.push(wishlistItem);
    
    console.log('Wishlist item to add:', wishlistItem);

    // Mark only wishlist as modified, preserve other fields
    user.markModified('wishlist');
    await user.save();

    console.log('Wishlist item added successfully');
    res.json({ success: true, message: 'Item added to wishlist successfully' });

  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Add item to wishlist (alternative endpoint)
router.post('/add', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { itemId, name, price, image } = req.body;
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find(item => item.itemId === itemId);
    if (existingItem) {
      return res.json({ success: false, message: 'Item already in wishlist' });
    }

    console.log('User before wishlist update:', {
      name: user.name,
      email: user.email,
      wishlistLength: user.wishlist.length
    });

    // Create wishlist item and add to wishlist array
    const wishlistItem = { itemId, name, price, image };
    user.wishlist.push(wishlistItem);
    
    console.log('Wishlist item to add:', wishlistItem);
    console.log('User wishlist after push:', user.wishlist);

    // Mark only wishlist as modified, preserve other fields
    user.markModified('wishlist');
    await user.save();

    console.log('User after save:', {
      name: user.name,
      email: user.email,
      wishlistLength: user.wishlist.length
    });

    res.json({ success: true, message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/:itemId', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.wishlist.pull({ itemId: req.params.itemId });
    await user.save();
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove item from wishlist (alternative endpoint)
router.delete('/remove/:itemId', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove item from wishlist
    user.wishlist.pull({ _id: req.params.itemId });
    await user.save();

    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;