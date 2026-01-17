/**
 * Admin API Routes
 * All admin-specific API endpoints
 */

const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../../middleware/adminAuth');

// All admin API routes require admin role
router.use(ensureAdmin);

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
router.get('/orders', async (req, res) => {
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
    const { status, adminNotes } = req.body;
    const orderId = req.params.id;

    console.log('Updating order status:', { orderId, status, adminNotes });

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const Order = require('../../models/Order');
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: status,
        adminNotes: adminNotes || '',
        updatedAt: new Date()
      },
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

    // Send email notification to customer
    try {
      const emailService = require('../../services/emailService');
      const customerEmail = order.customerEmail || (order.userId && order.userId.email);
      
      if (customerEmail) {
        console.log('📧 Sending order status email to:', customerEmail);
        const emailResult = await emailService.sendOrderStatusEmail(
          customerEmail,
          order,
          status,
          adminNotes
        );
        
        if (emailResult.success) {
          console.log('✅ Order status email sent successfully');
        } else {
          console.error('❌ Failed to send order status email:', emailResult.error);
        }
      } else {
        console.log('⚠️ No customer email found for order:', orderId);
      }
    } catch (emailError) {
      console.error('❌ Error sending order status email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Get all franchise applications
router.get('/franchise', async (req, res) => {
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
router.post('/franchise/:id/status', async (req, res) => {
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

    // Send email notification to applicant
    try {
      const emailService = require('../../services/emailService');
      
      if (application.email) {
        console.log('📧 Sending franchise status email to:', application.email);
        const emailResult = await emailService.sendFranchiseStatusEmail(
          application.email,
          application,
          status,
          adminNotes
        );
        
        if (emailResult.success) {
          console.log('✅ Franchise status email sent successfully');
        } else {
          console.error('❌ Failed to send franchise status email:', emailResult.error);
        }
      } else {
        console.log('⚠️ No email found for franchise application:', applicationId);
      }
    } catch (emailError) {
      console.error('❌ Error sending franchise status email:', emailError);
      // Don't fail the status update if email fails
    }

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
router.post('/menu-items', async (req, res) => {
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
router.put('/menu-items/:id', async (req, res) => {
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
router.delete('/menu-items/:id', async (req, res) => {
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

// Debug: Test email service
router.post('/debug/test-email', async (req, res) => {
  try {
    const { type, email } = req.body;
    const emailService = require('../../services/emailService');
    
    let result;
    
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(email || 'test@example.com', 'Test User');
        break;
        
      case 'order':
        const testOrder = {
          _id: '507f1f77bcf86cd799439011',
          orderDate: new Date(),
          totalAmount: 250,
          customerName: 'Test Customer',
          customerEmail: email || 'test@example.com',
          items: [
            { name: 'Cappuccino', quantity: 2, price: 80 },
            { name: 'Croissant', quantity: 1, price: 90 }
          ]
        };
        result = await emailService.sendOrderStatusEmail(email || 'test@example.com', testOrder, 'confirmed', 'Your order is being prepared with love!');
        break;
        
      case 'workshop':
        const testWorkshop = {
          workshopName: 'Coffee Art Workshop',
          workshopDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          participantName: 'Test Participant',
          participantEmail: email || 'test@example.com',
          participantPhone: '9876543210',
          calendarEventLink: 'https://calendar.google.com/event?eid=test123'
        };
        result = await emailService.sendWorkshopStatusEmail(email || 'test@example.com', testWorkshop, 'confirmed', 'Looking forward to seeing you at the workshop!');
        break;
        
      case 'franchise':
        const testFranchise = {
          _id: '507f1f77bcf86cd799439012',
          fullName: 'Test Franchise Applicant',
          submittedAt: new Date(),
          city: 'Mumbai',
          investmentRange: '₹75K - ₹100K'
        };
        result = await emailService.sendFranchiseStatusEmail(email || 'test@example.com', testFranchise, 'approved', 'Congratulations! Welcome to the Rabuste Coffee family.');
        break;

      // Admin notification tests
      case 'admin-order':
        const adminTestOrder = {
          _id: '507f1f77bcf86cd799439013',
          orderDate: new Date(),
          totalAmount: 350,
          customerName: 'Test Customer',
          customerEmail: 'customer@example.com',
          customerPhone: '9876543210',
          orderType: 'mixed',
          items: [
            { name: 'Cappuccino', quantity: 2, price: 80, type: 'menu' },
            { name: 'Abstract Art Piece', quantity: 1, price: 190, type: 'art' }
          ],
          deliveryAddress: 'Test Address, Mumbai'
        };
        result = await emailService.notifyAdminNewOrder(adminTestOrder);
        break;

      case 'admin-workshop':
        const adminTestWorkshop = {
          _id: '507f1f77bcf86cd799439014',
          workshopName: 'Coffee Art Workshop',
          workshopDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          participantName: 'Test Participant',
          participantEmail: 'participant@example.com',
          participantPhone: '9876543210',
          registrationDate: new Date(),
          calendarEventCreated: true,
          googleCalendarEventLink: 'https://calendar.google.com/event?eid=test123'
        };
        result = await emailService.notifyAdminNewWorkshopRegistration(adminTestWorkshop);
        break;

      case 'admin-franchise':
        const adminTestFranchise = {
          _id: '507f1f77bcf86cd799439015',
          fullName: 'Test Franchise Applicant',
          email: 'applicant@example.com',
          phoneNumber: '9876543210',
          city: 'Mumbai',
          investmentRange: '₹75K - ₹100K',
          expectedTimeline: '6-12 months',
          businessExperience: 'I have 5 years of retail experience',
          submittedAt: new Date()
        };
        result = await emailService.notifyAdminNewFranchiseApplication(adminTestFranchise);
        break;

      case 'admin-request':
        const adminTestRequest = {
          _id: '507f1f77bcf86cd799439016',
          type: 'sell-art',
          title: 'Want to sell my paintings',
          description: 'I am an artist and would like to sell my paintings through your gallery.',
          price: 5000,
          createdAt: new Date()
        };
        const adminTestUser = {
          name: 'Test Artist',
          email: 'artist@example.com',
          isOAuthUser: false
        };
        result = await emailService.notifyAdminNewUserRequest(adminTestRequest, adminTestUser);
        break;

      case 'admin-user':
        const adminTestNewUser = {
          name: 'New Test User',
          email: 'newuser@example.com',
          isOAuthUser: false,
          createdAt: new Date()
        };
        result = await emailService.notifyAdminNewUserRegistration(adminTestNewUser);
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid email type. Use: welcome, order, workshop, franchise, admin-order, admin-workshop, admin-franchise, admin-request, admin-user' 
        });
    }
    
    res.json({ 
      success: true, 
      message: `Test ${type} email sent`,
      emailResult: result
    });
  } catch (error) {
    console.error('Error testing email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== USER MANAGEMENT API ENDPOINTS ==========

// Get all users
router.get('/users', async (req, res) => {
  try {
    console.log('=== ADMIN USERS API CALLED ===');
    
    const User = require('../../models/User');
    const users = await User.find()
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users for admin`);
    
    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: user.name || user.displayName || 'Unknown',
      email: user.email,
      role: user.role || 'customer',
      status: user.status || 'active',
      joinDate: user.createdAt || new Date(),
      isOAuthUser: user.isOAuthUser || false,
      phone: user.phone || '',
      lastLogin: user.lastLogin || null
    }));
    
    res.json({ success: true, users: transformedUsers });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// Get single user details
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Getting user details for:', userId);
    
    const User = require('../../models/User');
    const Order = require('../../models/Order');
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const Request = require('../../models/Request');
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get user's orders
    const orders = await Order.find({ userId: userId })
      .sort({ orderDate: -1 })
      .limit(10);
    
    // Get user's workshop registrations
    const workshops = await WorkshopRegistration.find({ userId: userId })
      .sort({ registrationDate: -1 })
      .limit(10);
    
    // Get user's requests
    const requests = await Request.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const userDetails = {
      id: user._id,
      name: user.name || user.displayName || 'Unknown',
      email: user.email,
      role: user.role || 'customer',
      status: user.status || 'active',
      joinDate: user.createdAt || new Date(),
      isOAuthUser: user.isOAuthUser || false,
      phone: user.phone || '',
      lastLogin: user.lastLogin || null,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      totalWorkshops: workshops.length,
      totalRequests: requests.length,
      recentOrders: orders.slice(0, 5),
      recentWorkshops: workshops.slice(0, 5),
      recentRequests: requests.slice(0, 5)
    };
    
    res.json({ success: true, user: userDetails });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user details', error: error.message });
  }
});

// Update user details
router.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, status, phone } = req.body;
    
    console.log('Updating user:', { userId, name, email, role, status, phone });
    
    // Validate role
    if (role && !['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    // Validate status
    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const User = require('../../models/User');
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (phone) updateData.phone = phone;
    
    updateData.updatedAt = new Date();
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('✅ User updated successfully:', {
      userId: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
    
    // Transform for frontend
    const transformedUser = {
      id: updatedUser._id,
      name: updatedUser.name || updatedUser.displayName || 'Unknown',
      email: updatedUser.email,
      role: updatedUser.role || 'customer',
      status: updatedUser.status || 'active',
      joinDate: updatedUser.createdAt || new Date(),
      isOAuthUser: updatedUser.isOAuthUser || false,
      phone: updatedUser.phone || '',
      lastLogin: updatedUser.lastLogin || null
    };
    
    res.json({ success: true, user: transformedUser });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, role, password, phone } = req.body;
    
    console.log('Creating new user:', { name, email, role });
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    
    // Validate role
    if (role && !['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const User = require('../../models/User');
    const bcrypt = require('bcrypt');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: role || 'customer',
      status: 'active',
      phone: phone || '',
      isOAuthUser: false,
      createdAt: new Date()
    });
    
    await newUser.save();
    
    console.log('✅ New user created successfully:', {
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    
    // Send welcome email
    try {
      const emailService = require('../../services/emailService');
      const emailResult = await emailService.sendWelcomeEmail(newUser.email, newUser.name);
      
      if (emailResult.success) {
        console.log('✅ Welcome email sent to new user');
      } else {
        console.error('❌ Failed to send welcome email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      // Don't fail user creation if email fails
    }
    
    // Transform for frontend
    const transformedUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      joinDate: newUser.createdAt,
      isOAuthUser: newUser.isOAuthUser,
      phone: newUser.phone || '',
      lastLogin: null
    };
    
    res.json({ success: true, user: transformedUser });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
});

// Delete user (soft delete - set status to inactive)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log('Deleting user:', userId);
    
    const User = require('../../models/User');
    
    // Don't allow deleting admin users
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }
    
    // Soft delete - set status to inactive
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        status: 'inactive',
        deletedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    console.log('✅ User soft deleted successfully:', {
      userId: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    });
    
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

module.exports = router;