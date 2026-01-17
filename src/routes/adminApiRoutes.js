/**
 * Admin API Routes
 * All admin-specific API endpoints
 */

const express = require('express');
const router = express.Router();

// Admin middleware
function ensureAdmin(req, res, next) {
  // For now, just allow all requests to admin routes for testing
  return next();
}

// Get all requests
router.get('/requests', async (req, res) => {
  try {
    console.log('=== ADMIN REQUESTS API CALLED ===');
    
    const Request = require('../../models/Request');
    const requests = await Request.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${requests.length} requests for admin`);
    
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
});

// Update request status
router.post('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    console.log('Updating request status:', { requestId, status });

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const Request = require('../../models/Request');
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: status },
      { new: true }
    ).populate('userId', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    console.log('✅ Request status updated successfully:', {
      requestId: request._id,
      newStatus: status,
      title: request.title
    });

    res.json({ success: true, request });
  } catch (error) {
    console.error('❌ Error updating request status:', error);
    res.status(500).json({ success: false, message: 'Failed to update request status' });
  }
});

// Get all orders
router.get('/orders', ensureAdmin, async (req, res) => {
  try {
    const Order = require('../../models/Order');
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Update order status (temporarily no auth for testing)
router.post('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    console.log('Updating order status:', { orderId, status });

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const Order = require('../../models/Order');
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('✅ Order status updated successfully:', {
      orderId: order._id,
      newStatus: status,
      customer: order.customerName
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Get all franchise applications
router.get('/franchise', ensureAdmin, async (req, res) => {
  try {
    console.log('=== ADMIN FRANCHISE API CALLED ===');
    const Franchise = require('../../models/Franchise');
    const applications = await Franchise.find()
      .sort({ submittedAt: -1 });

    console.log('Found franchise applications:', applications.length);
    applications.forEach(app => {
      console.log(`- ${app.fullName} (${app.email}) - ${app.status} - ${app.submittedAt}`);
    });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching franchise applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch franchise applications' });
  }
});

// Update franchise application status
router.post('/franchise/:id/status', ensureAdmin, async (req, res) => {
  try {
    const { status, adminNotes, reviewedBy } = req.body;
    const applicationId = req.params.id;

    if (!['pending', 'approved', 'rejected', 'under-review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const Franchise = require('../../models/Franchise');
    const application = await Franchise.findByIdAndUpdate(
      applicationId,
      { 
        status: status,
        adminNotes: adminNotes || '',
        reviewedBy: reviewedBy || 'Admin',
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    console.log('Franchise application status updated:', {
      applicationId: application._id,
      newStatus: status,
      applicant: application.fullName,
      reviewedBy: reviewedBy
    });

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error updating franchise application status:', error);
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
});

// Real-time analytics update endpoint
router.get('/analytics-update', async (req, res) => {
  try {
    const User = require('../../models/User');
    const Order = require('../../models/Order');
    const WorkshopRegistration = require('../../models/WorkshopRegistration');

    const quickStats = {
      totalUsers: await User.countDocuments(),
      totalOrders: await Order.countDocuments(),
      totalRevenue: await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      totalWorkshopRegistrations: await WorkshopRegistration.countDocuments()
    };

    res.json(quickStats);
  } catch (error) {
    console.error('Analytics update error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics update' });
  }
});

// Test analytics data endpoint
router.get('/analytics-test', async (req, res) => {
  try {
    const User = require('../../models/User');
    const Order = require('../../models/Order');
    
    const testData = {
      usersCount: await User.countDocuments(),
      ordersCount: await Order.countDocuments(),
      sampleUsers: await User.find().limit(3).select('name email createdAt'),
      sampleOrders: await Order.find().limit(3).select('customerName totalAmount orderDate status'),
      timestamp: new Date().toISOString()
    };

    console.log('📊 Analytics test data:', testData);
    res.json(testData);
  } catch (error) {
    console.error('Analytics test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Menu Management API Routes
// Get all menu items
router.get('/menu-items', async (req, res) => {
  try {
    const MenuItem = require('../../models/MenuItem');
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json({ success: true, items: menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new menu item
router.post('/menu-items', ensureAdmin, async (req, res) => {
  try {
    const { category, name, description, price, image, available } = req.body;
    
    const MenuItem = require('../../models/MenuItem');
    const newItem = new MenuItem({
      category,
      name,
      description,
      price,
      image,
      available: available !== false
    });
    
    await newItem.save();
    res.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update menu item
router.put('/menu-items/:id', ensureAdmin, async (req, res) => {
  try {
    const { category, name, description, price, image, available } = req.body;
    
    const MenuItem = require('../../models/MenuItem');
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { category, name, description, price, image, available },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete menu item
router.delete('/menu-items/:id', ensureAdmin, async (req, res) => {
  try {
    const MenuItem = require('../../models/MenuItem');
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug: Create test franchise application
router.post('/debug/create-franchise', async (req, res) => {
  try {
    const Franchise = require('../../models/Franchise');
    const testApplication = new Franchise({
      fullName: 'Test Applicant',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      city: 'Mumbai',
      investmentRange: '₹75K - ₹100K',
      expectedTimeline: '6-12 months',
      businessExperience: 'I have 5 years of retail experience',
      status: 'pending'
    });

    await testApplication.save();
    console.log('Test franchise application created:', testApplication._id);
    
    res.json({ 
      success: true, 
      message: 'Test application created',
      application: testApplication
    });
  } catch (error) {
    console.error('Error creating test application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;