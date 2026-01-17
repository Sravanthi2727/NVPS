/**
 * Main API Routes
 * General API endpoints and debug routes
 */

const express = require('express');
const router = express.Router();

// Import sub-routers
const cartRoutes = require('./cartRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const orderRoutes = require('./orderRoutes');
const adminApiRoutes = require('./adminApiRoutes');
const userApiRoutes = require('./userApiRoutes');
const workshopApiRoutes = require('./workshopApiRoutes');

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Authentication required' });
}

// Mount sub-routers
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminApiRoutes);
router.use('/user', userApiRoutes);
router.use('/workshops', workshopApiRoutes);

// Debug endpoints
router.get('/debug/user', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('../../models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.json({ error: 'User not found', userId: req.user._id || req.user.id });
    }
    
    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      cartCount: user.cart ? user.cart.length : 0,
      wishlistCount: user.wishlist ? user.wishlist.length : 0,
      cart: user.cart || [],
      wishlist: user.wishlist || []
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/menu-items', async (req, res) => {
  try {
    const MenuItem = require('../../models/MenuItem');
    const menuItems = await MenuItem.find();
    console.log('Total menu items in database:', menuItems.length);
    res.json({
      total: menuItems.length,
      items: menuItems.map(item => ({
        id: item._id,
        name: item.name,
        category: item.category,
        subCategory: item.subCategory,
        price: item.price,
        isAvailable: item.isAvailable,
        image: item.image
      }))
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/artworks', async (req, res) => {
  try {
    const Artwork = require('../../models/Artwork');
    const artworks = await Artwork.find();
    console.log('Total artworks in database:', artworks.length);
    res.json({
      total: artworks.length,
      items: artworks.map(item => ({
        id: item._id,
        title: item.title,
        artist: item.artist,
        category: item.category,
        price: item.price,
        isAvailable: item.isAvailable,
        image: item.image
      }))
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/orders', async (req, res) => {
  try {
    const Order = require('../../models/Order');
    const allOrders = await Order.find().populate('userId', 'name email');
    console.log('All orders in database:', allOrders.length);
    res.json({ 
      total: allOrders.length, 
      orders: allOrders.map(o => ({
        id: o._id,
        userId: o.userId,
        customerName: o.customerName,
        status: o.status,
        total: o.totalAmount,
        date: o.orderDate
      }))
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/franchise', async (req, res) => {
  try {
    const Franchise = require('../../models/Franchise');
    const allApplications = await Franchise.find().sort({ submittedAt: -1 });
    console.log('All franchise applications in database:', allApplications.length);
    res.json({ 
      total: allApplications.length, 
      applications: allApplications.map(app => ({
        id: app._id,
        name: app.fullName,
        email: app.email,
        city: app.city,
        status: app.status,
        submittedAt: app.submittedAt,
        userId: app.userId
      }))
    });
  } catch (error) {
    console.error('Error fetching all franchise applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoints
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date() });
});

router.post('/test-endpoint', (req, res) => {
  console.log('Test endpoint called');
  res.json({ success: true, message: 'Test endpoint working' });
});

// Legacy endpoints that need to be moved to sub-routers but kept for compatibility
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

// Workshop proposal submission (legacy endpoint)
router.post('/submit-workshop-proposal', async (req, res) => {
  try {
    const proposalData = req.body;
    
    // Create a new request with the workshop proposal data
    const Request = require('../../models/Request');
    const request = new Request({
      userId: req.isAuthenticated() ? req.user.id : null,
      type: 'conduct-workshop',
      title: proposalData.title,
      description: proposalData.description,
      details: {
        category: proposalData.category,
        organizerName: proposalData.organizerName,
        organizerEmail: proposalData.organizerEmail,
        organizerPhone: proposalData.organizerPhone,
        organizerExperience: proposalData.organizerExperience,
        duration: proposalData.duration,
        capacity: proposalData.capacity,
        skillLevel: proposalData.skillLevel,
        price: proposalData.price,
        preferredDate: proposalData.preferredDate,
        materialsNeeded: proposalData.materialsNeeded,
        collaborationType: proposalData.collaborationType,
        additionalNotes: proposalData.additionalNotes
      },
      status: 'pending',
      submittedDate: new Date()
    });
    
    await request.save();
    
    res.json({ 
      success: true, 
      message: 'Workshop proposal submitted successfully! We will review it and get back to you soon.' 
    });
  } catch (error) {
    console.error('Error submitting workshop proposal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit workshop proposal. Please try again.' 
    });
  }
});

// Image upload endpoint
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/menu/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

router.post('/upload-image', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      
      const imageUrl = '/uploads/menu/' + req.file.filename;
      console.log('Image uploaded successfully:', imageUrl);
      res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

module.exports = router;