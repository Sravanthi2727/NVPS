/**
 * Cart API Routes
 * All cart-related API endpoints
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

// Get user's cart
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== CART API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user ? { id: req.user._id || req.user.id, email: req.user.email } : 'No user');
    
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User cart:', user.cart ? user.cart.length : 0, 'items');
    res.json(user.cart || []);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json([]);
  }
});

// Get cart count
router.get('/count', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.json({ count: 0 });
    }

    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    const count = user ? user.cart.length : 0;
    
    res.json({ count });
  } catch (error) {
    console.error('Cart count error:', error);
    res.status(500).json({ count: 0 });
  }
});

// Add item to cart (legacy endpoint)
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== CART API CALLED ===');
    console.log('Request body:', req.body);
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const { itemId, name, price, image, quantity, type } = req.body;
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if item already exists in cart
    const existingItem = user.cart.find(item => item.itemId === itemId);
    if (existingItem) {
      // For art items, don't allow duplicates (unique pieces)
      if (type === 'art') {
        console.log('Art item already in cart, preventing duplicate');
        return res.json({ success: false, message: 'This artwork is already in your cart. Art pieces are unique and cannot be duplicated.' });
      }
      // For menu items, update quantity
      existingItem.quantity += (quantity || 1);
      user.markModified('cart');
      await user.save();
      console.log('Menu item quantity updated');
      return res.json({ success: true, message: 'Item quantity updated' });
    }

    console.log('User before cart update:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    // Create cart item and add to cart array
    const cartItem = { 
      itemId, 
      name, 
      price, 
      image, 
      quantity: type === 'art' ? 1 : (quantity || 1), // Art items always quantity 1
      type: type || 'menu', // Default to menu if not specified
      paymentMethod: req.body.paymentMethod || 'online' // Add payment method
    };
    user.cart.push(cartItem);
    
    console.log('Cart item to add:', cartItem);

    // Mark only cart as modified, preserve other fields
    user.markModified('cart');
    await user.save();

    console.log('Cart item added successfully');
    res.json({ success: true, message: 'Item added to cart successfully' });

  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Add item to cart (new endpoint with AI recommendations)
router.post('/add', async (req, res) => {
  console.log('=== CART ADD API CALLED ===');
  console.log('Request body:', req.body);
  
  try {
    if (!req.isAuthenticated()) {
      console.log('User not authenticated');
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { itemId, name, price, image, quantity = 1 } = req.body;
    console.log('Adding item to cart:', { itemId, name, price });
    
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User before cart update:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    // Clean up duplicates first (merge items with same itemId)
    const cleanedCart = [];
    const itemMap = new Map();
    
    user.cart.forEach(item => {
      const key = String(item.itemId);
      if (itemMap.has(key)) {
        itemMap.get(key).quantity += item.quantity;
      } else {
        itemMap.set(key, { ...item.toObject() });
      }
    });
    
    itemMap.forEach(item => cleanedCart.push(item));
    user.cart = cleanedCart;
    
    console.log('Cart after cleanup:', user.cart.length, 'items');

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(item => String(item.itemId) === String(itemId));
    
    // Determine item type based on itemId and name
    let itemType = 'menu'; // default to menu
    if (name) {
      // Check if it's an art item based on name
      if (name.includes('Golden Horizon') || name.includes('City Lights') || 
          name.includes('Eternal Flow') || name.includes('Digital Dreams') ||
          name.includes('Mountain Serenity') || name.includes('Wilderness') ||
          name.includes('by ')) {
        itemType = 'art';
      }
    }
    
    // Check if itemId corresponds to art items
    const artItemIds = ['golden_horizon', 'city_lights', 'eternal_flow', 'digital_dreams', 'mountain_serinity', 'wilderness'];
    if (artItemIds.some(id => itemId.includes(id))) {
      itemType = 'art';
    }
    
    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      user.cart[existingItemIndex].quantity += quantity;
      console.log('Updated existing item quantity:', user.cart[existingItemIndex]);
    } else {
      // New item, add to cart
      const cartItem = { itemId, name, price, image, quantity, type: itemType };
      user.cart.push(cartItem);
      console.log('Added new item to cart:', cartItem);
    }
    
    console.log('User cart after update:', user.cart);

    // Mark only cart as modified, preserve other fields
    user.markModified('cart');
    await user.save();

    console.log('User after save:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    // Get AI recommendations
    let recommendations = [];
    try {
      console.log('🤖 Fetching AI recommendations for item:', itemId);
      
      const aiResponse = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: req.user._id || req.user.id,
          item_id: itemId
        }),
        timeout: 5000
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        console.log('🤖 AI response received:', aiData);
        
        if (aiData.recommendations && aiData.recommendations.length > 0) {
          const MenuItem = require('../../models/MenuItem');
          recommendations = await MenuItem.find({
            name: { $in: aiData.recommendations },
            isAvailable: true
          });
          
          console.log('✅ Found', recommendations.length, 'recommendations from AI');
        } else {
          console.log('⚠️ AI returned no recommendations');
        }
      } else {
        console.log('❌ AI API returned error status:', aiResponse.status);
        const errorText = await aiResponse.text();
        console.log('Error response:', errorText);
      }
    } catch (aiError) {
      console.log('❌ AI recommendation error (non-critical):', aiError.message);
      
      // Fallback: Get similar items from same category
      try {
        console.log('🔄 Using fallback recommendations...');
        const MenuItem = require('../../models/MenuItem');
        const addedItem = await MenuItem.findById(itemId);
        
        if (addedItem) {
          recommendations = await MenuItem.find({
            category: addedItem.category,
            _id: { $ne: itemId },
            isAvailable: true
          }).limit(6);
          
          console.log('✅ Using', recommendations.length, 'fallback recommendations');
        }
      } catch (fallbackError) {
        console.log('❌ Fallback recommendations error:', fallbackError.message);
      }
    }

    console.log('📤 Sending response with', recommendations.length, 'recommendations');
    
    res.json({ 
      success: true, 
      message: 'Item added to cart',
      recommendations: recommendations.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image ? (item.image.startsWith('/') ? item.image : '/assets/menu_images/' + item.image) : '',
        category: item.category,
        description: item.description
      }))
    });
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update cart item quantity
router.patch('/:itemId', ensureAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Handle both string and ObjectId itemId
    const paramItemId = req.params.itemId;
    const item = user.cart.find(item => 
      item.itemId.toString() === paramItemId || 
      item.itemId === paramItemId
    );
    
    if (!item) {
      console.log('Item not found in cart. Looking for:', paramItemId);
      console.log('Available items:', user.cart.map(i => ({ itemId: i.itemId, itemIdStr: i.itemId.toString() })));
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      user.cart.pull({ itemId: item.itemId });
    } else {
      // Update quantity
      item.quantity = quantity;
    }

    user.markModified('cart');
    await user.save();
    res.json({ success: true, message: 'Cart quantity updated' });
  } catch (error) {
    console.error('Cart quantity update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/:itemId', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.cart.pull({ itemId: req.params.itemId });
    await user.save();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove item from cart (alternative endpoint)
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

    // Remove item from cart
    user.cart.pull({ _id: req.params.itemId });
    await user.save();

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Debug: Fix cart item types
router.post('/debug/fix-cart-types', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Please login first' });
    }
    
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updatedCount = 0;
    
    // Update cart items with correct type
    user.cart = user.cart.map(item => {
      if (!item.type || item.type === 'NOT_SET') {
        // Detect if this is an art item
        const isArt = item.artist || 
                     ['painting','photography','sculpture','digital'].includes(item.category) ||
                     (item.image && (item.image.includes('/assets/gallery/') || 
                      item.image.includes('golden_origin') || item.image.includes('city_lights') ||
                      item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
                      item.image.includes('mountain_serinity') || item.image.includes('wilderness'))) ||
                     (item.name && (item.name.includes('by ') || 
                      item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
                      item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
                      item.name.includes('Mountain Serenity') || item.name.includes('Wilderness')));
        
        item.type = isArt ? 'art' : 'menu';
        updatedCount++;
      }
      return item;
    });
    
    user.markModified('cart');
    await user.save();
    
    res.json({
      success: true,
      message: `Updated ${updatedCount} cart items with correct type`,
      totalItems: user.cart.length,
      artItems: user.cart.filter(item => item.type === 'art').length,
      menuItems: user.cart.filter(item => item.type === 'menu').length
    });
  } catch (error) {
    console.error('Fix cart types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug: Check cart items with type info
router.get('/debug/cart-items', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Please login first' });
    }
    
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Analyze cart items
    const cartAnalysis = user.cart.map(item => {
      const isArt = item.type === 'art' || 
                   item.artist || 
                   ['painting','photography','sculpture','digital'].includes(item.category) ||
                   (item.image && (item.image.includes('/assets/gallery/') || 
                    item.image.includes('golden_origin') || item.image.includes('city_lights') ||
                    item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
                    item.image.includes('mountain_serinity') || item.image.includes('wilderness'))) ||
                   (item.name && (item.name.includes('by ') || 
                    item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
                    item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
                    item.name.includes('Mountain Serenity') || item.name.includes('Wilderness')));
      
      return {
        itemId: item.itemId,
        name: item.name,
        type: item.type || 'NOT_SET',
        detectedAs: isArt ? 'art' : 'menu',
        hasArtist: !!item.artist,
        category: item.category,
        image: item.image,
        hasImagePaths: item.image && (item.image.includes('/assets/gallery/') || 
                    item.image.includes('golden_origin') || item.image.includes('city_lights') ||
                    item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
                    item.image.includes('mountain_serinity') || item.image.includes('wilderness')),
        hasArtName: item.name && (item.name.includes('by ') || 
                    item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
                    item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
                    item.name.includes('Mountain Serenity') || item.name.includes('Wilderness'))
      };
    });
    
    res.json({
      totalItems: user.cart.length,
      artItems: cartAnalysis.filter(item => item.detectedAs === 'art').length,
      menuItems: cartAnalysis.filter(item => item.detectedAs === 'menu').length,
      items: cartAnalysis
    });
  } catch (error) {
    console.error('Debug cart items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;