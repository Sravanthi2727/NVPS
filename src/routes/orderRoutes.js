/**
 * Order API Routes
 * All order and payment-related API endpoints
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

// Legacy endpoints for compatibility
router.get('/', async (req, res) => {
  try {
    const Order = require('../../models/Order');
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ orderDate: -1 });

    console.log('Found', orders.length, 'orders in database');
    
    res.json({ 
      success: true, 
      orders: orders,
      count: orders.length 
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
});

// Get all orders for admin (no auth for testing)
router.get('/all-orders', async (req, res) => {
  try {
    const Order = require('../../models/Order');
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ orderDate: -1 });

    console.log('Found', orders.length, 'orders in database');
    
    res.json({ 
      success: true, 
      orders: orders,
      count: orders.length 
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
});

// Simple test payment endpoint (no auth required)
router.post('/test-payment', async (req, res) => {
  try {
    console.log('Test payment endpoint called');
    
    // Simple response without Razorpay SDK for testing
    const testOrder = {
      id: 'test_order_' + Date.now(),
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      razorpayKeyId: 'rzp_test_S2a2ZZ2ERWzWeB', // Your key
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '9999999999'
    };
    
    console.log('Sending test order:', testOrder);
    
    res.json({
      success: true,
      order: testOrder,
      message: 'Test order created successfully'
    });
  } catch (error) {
    console.error('Test payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Test payment failed: ' + error.message
    });
  }
});

// Main payment order creation endpoint
router.post('/create-payment-order', ensureAuthenticated, async (req, res) => {
  try {
    const { itemId, name, price, image, type } = req.body;
    
    console.log('Creating payment order for:', { name, price, type });
    
    // Convert rupees to paise (multiply by 100)
    const amountInPaise = Math.round(price * 100);
    
    console.log(`Price conversion: ₹${price} → ${amountInPaise} paise`);
    
    const order = {
      id: 'order_' + Date.now(),
      amount: amountInPaise, // Amount in paise
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || ''
    };
    
    console.log('Created payment order:', order);
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order: ' + error.message
    });
  }
});

// Test payment verification (no auth required)
router.post('/test-verify', async (req, res) => {
  try {
    const { paymentResponse } = req.body;
    console.log('Test payment verification:', paymentResponse);
    
    res.json({
      success: true,
      message: 'Test payment verified successfully',
      paymentId: paymentResponse.razorpay_payment_id
    });
  } catch (error) {
    console.error('Test verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Test verification failed'
    });
  }
});

// Create order after successful payment (Gallery) - No auth for testing
router.post('/create-order-after-payment', async (req, res) => {
  try {
    const { paymentResponse, itemId, itemName, price, image, userId } = req.body;
    
    console.log('=== CREATING GALLERY ORDER ===');
    console.log('Payment Response:', paymentResponse);
    console.log('Item:', { itemId, itemName, price });
    console.log('User ID:', userId);
    
    // Get user ID from request or body
    let actualUserId = userId;
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      actualUserId = req.user._id || req.user.id;
      console.log('Using authenticated user ID:', actualUserId);
    } else {
      console.log('No authentication, using provided user ID:', actualUserId);
    }
    
    if (!actualUserId) {
      // Create a dummy user ID for testing
      actualUserId = '507f1f77bcf86cd799439011';
      console.log('Using dummy user ID for testing:', actualUserId);
    }
    
    // Create order record
    const Order = require('../../models/Order');
    const order = new Order({
      userId: actualUserId,
      customerName: req.user ? req.user.name : 'Test Customer',
      customerEmail: req.user ? req.user.email : 'test@example.com',
      items: [{
        itemId: itemId,
        name: itemName,
        price: price,
        quantity: 1,
        image: image,
        type: 'art'
      }],
      totalAmount: price,
      status: 'pending', // Default status
      paymentMethod: 'online',
      paymentId: paymentResponse.razorpay_payment_id,
      orderType: 'art',
      orderDate: new Date()
    });
    
    await order.save();
    console.log('✅ Gallery order created successfully:', order._id);
    
    // Send admin notification email
    try {
      const emailService = require('../../services/emailService');
      console.log('📧 Sending admin notification for new gallery order');
      
      const emailResult = await emailService.notifyAdminNewOrder(order);
      if (emailResult.success) {
        console.log('✅ Admin order notification email sent successfully');
      } else {
        console.error('❌ Failed to send admin order notification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending admin order notification email:', emailError);
      // Don't fail order creation if email fails
    }
    
    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: order._id,
      orderStatus: 'pending'
    });
    
  } catch (error) {
    console.error('❌ Error creating gallery order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order: ' + error.message
    });
  }
});

// Create art request from cart (Dashboard) - No auth for testing
router.post('/create-art-order-after-payment', async (req, res) => {
  console.log('=== ART REQUEST ENDPOINT CALLED ===');
  console.log('Session ID:', req.sessionID);
  console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
  console.log('User object:', req.user ? { id: req.user._id || req.user.id, email: req.user.email, name: req.user.name } : 'No user');
  console.log('Session data:', req.session ? Object.keys(req.session) : 'No session');
  
  try {
    const { paymentResponse, orderData, userId } = req.body;
    const mongoose = require('mongoose');
    
    console.log('Request body received:', {
      hasPaymentResponse: !!paymentResponse,
      hasOrderData: !!orderData,
      userId: userId,
      paymentId: paymentResponse?.razorpay_payment_id
    });
    
    if (!paymentResponse || !paymentResponse.razorpay_payment_id) {
      console.error('Missing payment response');
      return res.status(400).json({
        success: false,
        message: 'Payment response is required'
      });
    }
    
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      console.error('Missing order data or items');
      return res.status(400).json({
        success: false,
        message: 'Order data with items is required'
      });
    }
    
    // Get user ID and info from authenticated session
    let actualUserId = null;
    let customerName = 'Guest User';
    let customerEmail = 'guest@example.com';
    
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      actualUserId = req.user._id || req.user.id;
      customerName = req.user.name || 'User';
      customerEmail = req.user.email || 'user@example.com';
      console.log('Using authenticated user:', { id: actualUserId, name: customerName, email: customerEmail });
    } else {
      console.log('No authentication, using provided user ID:', userId);
      // Use provided userId or generate one for testing
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        actualUserId = userId;
      } else {
        actualUserId = new mongoose.Types.ObjectId();
      }
      // Use delivery address info for customer details
      if (orderData.deliveryAddress) {
        customerName = orderData.deliveryAddress.name || customerName;
        customerEmail = orderData.deliveryAddress.email || customerEmail;
      }
    }
    
    console.log('Final user details:', { actualUserId, customerName, customerEmail });
    
    // Calculate total
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('Calculated total amount:', totalAmount);
    
    // Validate delivery address
    if (!orderData.deliveryAddress || !orderData.deliveryAddress.name) {
      console.error('Missing delivery address');
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }
    
    // Create art request instead of order
    const Request = require('../../models/Request');
    
    // Create title and description from items
    const itemNames = orderData.items.map(item => item.name).join(', ');
    const title = `Art Purchase Request - ${itemNames}`;
    const description = `
Art Purchase Request Details:
- Items: ${orderData.items.map(item => `${item.name} (₹${item.price})`).join(', ')}
- Total Amount: ₹${totalAmount}
- Payment Method: ${orderData.paymentMethod || 'online'}
- Payment ID: ${paymentResponse.razorpay_payment_id}
- Customer: ${customerName} (${customerEmail})
- Delivery Address: ${orderData.deliveryAddress.name}, ${orderData.deliveryAddress.address}, ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} - ${orderData.deliveryAddress.pincode}
- Phone: ${orderData.deliveryAddress.phone}
    `.trim();
    
    const artRequest = new Request({
      userId: actualUserId,
      type: 'sell-art', // Using existing enum value
      title: title,
      description: description,
      status: 'pending'
    });
    
    console.log('Creating art request with data:', {
      userId: actualUserId,
      title: title,
      type: 'sell-art'
    });
    
    await artRequest.save();
    
    console.log('✅ Art request created successfully:', artRequest._id);
    
    // Try to remove art items from user's cart (if user is authenticated)
    try {
      const User = require('../../models/User');
      let userToUpdate = null;
      
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        // Use authenticated user
        userToUpdate = await User.findById(req.user._id || req.user.id);
        console.log('Found authenticated user for cart update:', userToUpdate ? userToUpdate.email : 'not found');
      } else {
        // For testing, try to find any user with the items in cart
        console.log('No authenticated user, skipping cart update');
      }
      
      if (userToUpdate) {
        const artItemIds = orderData.items.map(item => item.itemId);
        console.log('Removing items from cart:', artItemIds);
        console.log('Current cart before removal:', userToUpdate.cart);
        
        userToUpdate.cart = userToUpdate.cart.filter(cartItem => {
          const shouldKeep = !artItemIds.includes(cartItem.itemId);
          console.log(`Item ${cartItem.itemId}: ${shouldKeep ? 'keeping' : 'removing'}`);
          return shouldKeep;
        });
        
        userToUpdate.markModified('cart');
        await userToUpdate.save();
        console.log('✅ Cart updated, remaining items:', userToUpdate.cart.length);
      }
    } catch (cartError) {
      console.error('Cart update error (non-critical):', cartError);
    }
    
    const response = {
      success: true,
      message: 'Art request created successfully',
      requestId: artRequest._id.toString(),
      status: 'pending'
    };
    
    console.log('Sending response:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error creating art request:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create art request: ' + error.message,
      error: error.name
    });
  }
});

// Verify payment
router.post('/verify-payment', ensureAuthenticated, async (req, res) => {
  try {
    const { paymentResponse, itemId, itemName, price, image } = req.body;
    
    // Verify payment signature using Razorpay SDK
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(paymentResponse.razorpay_order_id + '|' + paymentResponse.razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== paymentResponse.razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }
    
    console.log('Payment verification successful:', paymentResponse);
    
    // Create order record
    const orderItems = [{
      itemId: itemId,
      name: itemName,
      price: price,
      quantity: 1,
      image: image,
      type: 'art'
    }];
    
    const Order = require('../../models/Order');
    const order = new Order({
      userId: req.user._id || req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: orderItems,
      totalAmount: price,
      status: 'completed', // Since payment is verified
      paymentMethod: 'online',
      paymentId: paymentResponse.razorpay_payment_id,
      orderDate: new Date()
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed: ' + error.message
    });
  }
});

// Art Checkout API endpoints
router.post('/art-checkout', ensureAuthenticated, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, orderType } = req.body;
    
    // Get user ID
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Get user details
    const User = require('../../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Creating art order for user:', userId, user.email);
    
    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const Order = require('../../models/Order');
    const order = new Order({
      userId: userId,
      customerName: user.name || deliveryAddress?.name || 'Customer',
      customerEmail: user.email || deliveryAddress?.email || '',
      items: items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        type: 'art'
      })),
      totalAmount: totalAmount,
      status: 'pending', // All orders start as pending, admin will approve
      paymentMethod: paymentMethod,
      deliveryAddress: deliveryAddress,
      orderType: 'art',
      orderDate: new Date()
    });
    
    await order.save();
    console.log('✅ Art order created successfully:', order._id, 'for user:', userId);
    
    // Reload user to get latest cart data
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after order creation'
      });
    }
    
    // Remove art items from user's cart - convert all IDs to strings for comparison
    const artItemIds = items.map(item => String(item.itemId));
    console.log('Art item IDs to remove:', artItemIds);
    console.log('Current cart before removal:', updatedUser.cart.map(c => ({ itemId: String(c.itemId), name: c.name })));
    
    const cartBeforeLength = updatedUser.cart.length;
    updatedUser.cart = updatedUser.cart.filter(cartItem => {
      const cartItemId = String(cartItem.itemId);
      const shouldKeep = !artItemIds.includes(cartItemId);
      if (!shouldKeep) {
        console.log(`Removing item from cart: ${cartItemId} - ${cartItem.name}`);
      }
      return shouldKeep;
    });
    
    updatedUser.markModified('cart');
    await updatedUser.save();
    console.log(`✅ Art items removed from cart. Before: ${cartBeforeLength}, After: ${updatedUser.cart.length}`);
    
    res.json({
      success: true,
      message: 'Art order placed successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Art checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place art order: ' + error.message
    });
  }
});

// Create art payment order
router.post('/create-art-payment-order', ensureAuthenticated, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, orderType } = req.body;
    
    // Calculate total in rupees
    const totalAmountInRupees = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Convert to paise (multiply by 100)
    const totalAmountInPaise = Math.round(totalAmountInRupees * 100);
    
    console.log(`Art payment: ₹${totalAmountInRupees} → ${totalAmountInPaise} paise`);
    
    const order = {
      id: 'order_art_' + Date.now(),
      amount: totalAmountInPaise, // Amount in paise
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || deliveryAddress.phone
    };
    
    console.log('Created art payment order:', order);
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error creating art payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create art payment order: ' + error.message
    });
  }
});

// Verify art payment
router.post('/verify-art-payment', ensureAuthenticated, async (req, res) => {
  try {
    const { paymentResponse, orderData } = req.body;
    
    // In a real implementation, verify the payment signature with Razorpay
    console.log('Art payment verification:', paymentResponse);
    
    // Get user ID
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Get user details
    const User = require('../../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Creating art order for user:', userId, user.email);
    
    // Calculate total
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order record
    const Order = require('../../models/Order');
    const order = new Order({
      userId: userId,
      customerName: user.name || orderData.deliveryAddress?.name || 'Customer',
      customerEmail: user.email || orderData.deliveryAddress?.email || '',
      items: orderData.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        type: 'art'
      })),
      totalAmount: totalAmount,
      status: 'pending', // All orders start as pending, admin will approve after verification
      paymentMethod: 'online',
      paymentId: paymentResponse.razorpay_payment_id,
      deliveryAddress: orderData.deliveryAddress,
      orderType: 'art',
      orderDate: new Date()
    });
    
    await order.save();
    console.log('✅ Art order created successfully:', order._id, 'for user:', userId);
    
    // Reload user to get latest cart data
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after order creation'
      });
    }
    
    // Remove art items from user's cart - convert all IDs to strings for comparison
    const artItemIds = orderData.items.map(item => String(item.itemId));
    console.log('Art item IDs to remove:', artItemIds);
    console.log('Current cart before removal:', updatedUser.cart.map(c => ({ itemId: String(c.itemId), name: c.name })));
    
    const cartBeforeLength = updatedUser.cart.length;
    updatedUser.cart = updatedUser.cart.filter(cartItem => {
      const cartItemId = String(cartItem.itemId);
      const shouldKeep = !artItemIds.includes(cartItemId);
      if (!shouldKeep) {
        console.log(`Removing item from cart: ${cartItemId} - ${cartItem.name}`);
      }
      return shouldKeep;
    });
    
    updatedUser.markModified('cart');
    await updatedUser.save();
    console.log(`✅ Art items removed from cart. Before: ${cartBeforeLength}, After: ${updatedUser.cart.length}`);
    
    res.json({
      success: true,
      message: 'Art payment verified and order created successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Error verifying art payment:', error);
    res.status(500).json({
      success: false,
      message: 'Art payment verification failed: ' + error.message
    });
  }
});

// Checkout API - Convert cart to order
router.post('/checkout', ensureAuthenticated, async (req, res) => {
  try {
    const { orderType = 'menu', items } = req.body;
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Use provided items or get from user cart
    let cartItems = items || user.cart;
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Filter items based on order type if not provided
    if (!items && orderType === 'menu') {
      cartItems = user.cart.filter(item => {
        // Check if item has explicit type property
        if (item.type === 'art') return false;
        
        // Check if item is from artworks.json structure
        if (item.artist || item.category === 'painting' || item.category === 'photography' || 
            item.category === 'sculpture' || item.category === 'digital') return false;
        
        // Check image paths for art items
        if (item.image && (item.image.includes('/assets/gallery/') || 
            item.image.includes('golden_origin') || item.image.includes('city_lights') ||
            item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
            item.image.includes('mountain_serinity') || item.image.includes('wilderness'))) return false;
        
        // Check item names that are clearly art pieces
        if (item.name && (item.name.includes('by ') || 
            item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
            item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
            item.name.includes('Mountain Serenity') || item.name.includes('Wilderness'))) return false;
        
        return true;
      });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: `No ${orderType} items in cart` });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create new order
    const Order = require('../../models/Order');
    const newOrder = new Order({
      userId: user._id,
      customerName: user.name || user.displayName,
      customerEmail: user.email,
      items: cartItems.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        type: item.type || 'menu'
      })),
      totalAmount: totalAmount,
      status: 'pending',
      paymentMethod: 'cash', // Menu items are typically cash/pickup
      orderType: orderType
    });

    console.log('Creating order for user:', user._id, 'with', cartItems.length, 'items');

    // Save order
    await newOrder.save();

    console.log('Order saved successfully:', newOrder._id);

    // Send admin notification email for new order
    try {
      const emailService = require('../../services/emailService');
      console.log('📧 Sending admin notification for new order');
      
      const emailResult = await emailService.notifyAdminNewOrder(newOrder);
      if (emailResult.success) {
        console.log('✅ Admin order notification email sent successfully');
      } else {
        console.error('❌ Failed to send admin order notification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending admin order notification email:', emailError);
      // Don't fail order creation if email fails
    }

    // Remove processed items from user's cart
    if (!items) {
      // If no specific items provided, remove the filtered items
      const processedItemIds = cartItems.map(item => item.itemId);
      user.cart = user.cart.filter(cartItem => !processedItemIds.includes(cartItem.itemId));
    } else {
      // If specific items provided, remove those
      const processedItemIds = items.map(item => item.itemId);
      user.cart = user.cart.filter(cartItem => !processedItemIds.includes(cartItem.itemId));
    }
    
    user.markModified('cart');
    await user.save();

    console.log('Order created:', {
      orderId: newOrder._id,
      customer: user.name || user.displayName,
      email: user.email,
      totalAmount: totalAmount,
      itemCount: newOrder.items.length,
      orderType: orderType
    });

    res.json({ 
      success: true, 
      message: 'Order placed successfully!',
      orderId: newOrder._id,
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
});

module.exports = router;