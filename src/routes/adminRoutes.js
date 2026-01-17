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

// Analytics
router.get('/analytics', ensureAdmin, adminController.getAnalytics);
router.get('/api/analytics', ensureAdmin, adminController.getAnalyticsAPI);

// Menu Management
router.get('/menu-management', ensureAdmin, adminController.getMenuManagement);
router.get('/api/menu-items', ensureAdmin, adminController.getMenuItems);
router.get('/api/menu-items/:id', ensureAdmin, adminController.getMenuItemById);
router.post('/api/menu-items', ensureAdmin, adminController.addMenuItem);
router.put('/api/menu-items/:id', ensureAdmin, adminController.updateMenuItem);
router.delete('/api/menu-items/:id', ensureAdmin, adminController.deleteMenuItem);

router.get('/manage-artworks', ensureAdmin, adminController.getManageArtworks);
router.post('/api/add-artwork', ensureAdmin, adminController.getUpload().single('image'), adminController.addArtwork);
router.get('/api/artwork/:id', ensureAdmin, adminController.getArtworkById);
router.put('/api/update-artwork/:id', ensureAdmin, adminController.getUpload().single('image'), adminController.updateArtwork);
router.delete('/api/delete-artwork/:id', ensureAdmin, adminController.deleteArtwork);
// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Admin test route called');
  res.json({ message: 'Admin routes working!', timestamp: new Date() });
});

// Analytics
router.get('/analytics', ensureAdmin, async (req, res) => {
  console.log('🔍 Analytics route called');
  try {
    const User = require('../../models/User');
    const Order = require('../../models/Order');
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const Franchise = require('../../models/Franchise');

    console.log('📊 Starting analytics data collection...');

    // Get date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get analytics data
    const analytics = {
      // User statistics
      totalUsers: await User.countDocuments(),
      newUsersLast7Days: await User.countDocuments({ createdAt: { $gte: last7Days } }),
      newUsersLast30Days: await User.countDocuments({ createdAt: { $gte: last30Days } }),
      
      // Order statistics
      totalOrders: await Order.countDocuments(),
      ordersLast7Days: await Order.countDocuments({ orderDate: { $gte: last7Days } }),
      ordersLast30Days: await Order.countDocuments({ orderDate: { $gte: last30Days } }),
      
      // Revenue statistics
      totalRevenue: await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      revenueLast7Days: await Order.aggregate([
        { $match: { orderDate: { $gte: last7Days } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      revenueLast30Days: await Order.aggregate([
        { $match: { orderDate: { $gte: last30Days } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),

      // Workshop statistics
      totalWorkshopRegistrations: await WorkshopRegistration.countDocuments(),
      workshopRegistrationsLast7Days: await WorkshopRegistration.countDocuments({ 
        createdAt: { $gte: last7Days } 
      }),
      
      // Franchise statistics
      totalFranchiseApplications: await Franchise.countDocuments(),
      franchiseApplicationsLast7Days: await Franchise.countDocuments({ 
        submittedAt: { $gte: last7Days } 
      }),

      // Order status breakdown
      ordersByStatus: await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Daily orders for last 30 days
      dailyOrders: await Order.aggregate([
        { $match: { orderDate: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Popular menu items
      popularItems: await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.type': { $ne: 'art' } } },
        {
          $group: {
            _id: '$items.name',
            count: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // User registration trend
      userRegistrationTrend: await User.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    };

    // Calculate growth percentages
    const userGrowth = analytics.newUsersLast7Days > 0 ? 
      ((analytics.newUsersLast7Days / Math.max(analytics.totalUsers - analytics.newUsersLast7Days, 1)) * 100).toFixed(1) : 0;
    
    const orderGrowth = analytics.ordersLast7Days > 0 ? 
      ((analytics.ordersLast7Days / Math.max(analytics.totalOrders - analytics.ordersLast7Days, 1)) * 100).toFixed(1) : 0;

    const revenueGrowth = analytics.revenueLast7Days > 0 ? 
      ((analytics.revenueLast7Days / Math.max(analytics.totalRevenue - analytics.revenueLast7Days, 1)) * 100).toFixed(1) : 0;

    console.log('📊 Analytics data prepared:', {
      totalUsers: analytics.totalUsers,
      totalOrders: analytics.totalOrders,
      totalRevenue: analytics.totalRevenue,
      userGrowth: userGrowth + '%',
      orderGrowth: orderGrowth + '%',
      popularItemsCount: analytics.popularItems.length,
      dailyOrdersCount: analytics.dailyOrders.length
    });

    res.render('admin-analytics', {
      title: 'Analytics - Rabuste Admin',
      analyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
      analytics: analytics,
      userGrowth: userGrowth,
      orderGrowth: orderGrowth,
      revenueGrowth: revenueGrowth,
      error: null,
      layout: false
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.render('admin-analytics', {
      title: 'Analytics - Rabuste Admin',
      analyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
      analytics: null,
      userGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0,
      error: 'Failed to load analytics data: ' + error.message,
      layout: false
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Admin test route called');
  res.json({ message: 'Admin routes working!', timestamp: new Date() });
});

// Analytics
router.get('/analytics', ensureAdmin, async (req, res) => {
  console.log('🔍 Analytics route called');
  try {
    const User = require('../../models/User');
    const Order = require('../../models/Order');
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const Franchise = require('../../models/Franchise');

    console.log('📊 Starting analytics data collection...');

    // Get date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get analytics data
    const analytics = {
      // User statistics
      totalUsers: await User.countDocuments(),
      newUsersLast7Days: await User.countDocuments({ createdAt: { $gte: last7Days } }),
      newUsersLast30Days: await User.countDocuments({ createdAt: { $gte: last30Days } }),
      
      // Order statistics
      totalOrders: await Order.countDocuments(),
      ordersLast7Days: await Order.countDocuments({ orderDate: { $gte: last7Days } }),
      ordersLast30Days: await Order.countDocuments({ orderDate: { $gte: last30Days } }),
      
      // Revenue statistics
      totalRevenue: await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      revenueLast7Days: await Order.aggregate([
        { $match: { orderDate: { $gte: last7Days } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      revenueLast30Days: await Order.aggregate([
        { $match: { orderDate: { $gte: last30Days } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),

      // Workshop statistics
      totalWorkshopRegistrations: await WorkshopRegistration.countDocuments(),
      workshopRegistrationsLast7Days: await WorkshopRegistration.countDocuments({ 
        createdAt: { $gte: last7Days } 
      }),
      
      // Franchise statistics
      totalFranchiseApplications: await Franchise.countDocuments(),
      franchiseApplicationsLast7Days: await Franchise.countDocuments({ 
        submittedAt: { $gte: last7Days } 
      }),

      // Order status breakdown
      ordersByStatus: await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Daily orders for last 30 days
      dailyOrders: await Order.aggregate([
        { $match: { orderDate: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Popular menu items
      popularItems: await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.type': { $ne: 'art' } } },
        {
          $group: {
            _id: '$items.name',
            count: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // User registration trend
      userRegistrationTrend: await User.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    };

    // Calculate growth percentages
    const userGrowth = analytics.newUsersLast7Days > 0 ? 
      ((analytics.newUsersLast7Days / Math.max(analytics.totalUsers - analytics.newUsersLast7Days, 1)) * 100).toFixed(1) : 0;
    
    const orderGrowth = analytics.ordersLast7Days > 0 ? 
      ((analytics.ordersLast7Days / Math.max(analytics.totalOrders - analytics.ordersLast7Days, 1)) * 100).toFixed(1) : 0;

    const revenueGrowth = analytics.revenueLast7Days > 0 ? 
      ((analytics.revenueLast7Days / Math.max(analytics.totalRevenue - analytics.revenueLast7Days, 1)) * 100).toFixed(1) : 0;

    console.log('📊 Analytics data prepared:', {
      totalUsers: analytics.totalUsers,
      totalOrders: analytics.totalOrders,
      totalRevenue: analytics.totalRevenue,
      userGrowth: userGrowth + '%',
      orderGrowth: orderGrowth + '%',
      popularItemsCount: analytics.popularItems.length,
      dailyOrdersCount: analytics.dailyOrders.length
    });

    res.render('admin-analytics', {
      title: 'Analytics - Rabuste Admin',
      analyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
      analytics: analytics,
      userGrowth: userGrowth,
      orderGrowth: orderGrowth,
      revenueGrowth: revenueGrowth,
      error: null,
      layout: false
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.render('admin-analytics', {
      title: 'Analytics - Rabuste Admin',
      analyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
      analytics: null,
      userGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0,
      error: 'Failed to load analytics data: ' + error.message,
      layout: false
    });
  }
});

router.get('/manage-artworks', ensureAdmin, adminController.getManageArtworks);
router.post('/api/add-artwork', ensureAdmin, adminController.getUpload().single('image'), adminController.addArtwork);
router.get('/api/artwork/:id', ensureAdmin, adminController.getArtworkById);
router.put('/api/update-artwork/:id', ensureAdmin, adminController.getUpload().single('image'), adminController.updateArtwork);
router.delete('/api/delete-artwork/:id', ensureAdmin, adminController.deleteArtwork);
// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Admin test route called');
  res.json({ message: 'Admin routes working!', timestamp: new Date() });
});

// Analytics
router.get('/analytics', ensureAdmin, async (req, res) => {
  console.log('🔍 Analytics route called');
  try {
    const User = require('../../models/User');
    const Order = require('../../models/Order');
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const Franchise = require('../../models/Franchise');

    console.log('📊 Starting analytics data collection...');

    // Get date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get analytics data
    const analytics = {
      // User statistics
      totalUsers: await User.countDocuments(),
      newUsersLast7Days: await User.countDocuments({ createdAt: { $gte: last7Days } }),
      newUsersLast30Days: await User.countDocuments({ createdAt: { $gte: last30Days } }),
      
      // Order statistics
      totalOrders: await Order.countDocuments(),
      ordersLast7Days: await Order.countDocuments({ orderDate: { $gte: last7Days } }),
      ordersLast30Days: await Order.countDocuments({ orderDate: { $gte: last30Days } }),
      
      // Revenue statistics
      totalRevenue: await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      revenueLast7Days: await Order.aggregate([
        { $match: { orderDate: { $gte: last7Days } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      revenueLast30Days: await Order.aggregate([
        { $match: { orderDate: { $gte: last30Days } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),

      // Workshop statistics
      totalWorkshopRegistrations: await WorkshopRegistration.countDocuments(),
      workshopRegistrationsLast7Days: await WorkshopRegistration.countDocuments({ 
        createdAt: { $gte: last7Days } 
      }),
      
      // Franchise statistics
      totalFranchiseApplications: await Franchise.countDocuments(),
      franchiseApplicationsLast7Days: await Franchise.countDocuments({ 
        submittedAt: { $gte: last7Days } 
      }),

      // Order status breakdown
      ordersByStatus: await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Daily orders for last 30 days
      dailyOrders: await Order.aggregate([
        { $match: { orderDate: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Popular menu items
      popularItems: await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.type': { $ne: 'art' } } },
        {
          $group: {
            _id: '$items.name',
            count: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // User registration trend
      userRegistrationTrend: await User.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    };

    // Calculate growth percentages
    const userGrowth = analytics.newUsersLast7Days > 0 ? 
      ((analytics.newUsersLast7Days / Math.max(analytics.totalUsers - analytics.newUsersLast7Days, 1)) * 100).toFixed(1) : 0;
    
    const orderGrowth = analytics.ordersLast7Days > 0 ? 
      ((analytics.ordersLast7Days / Math.max(analytics.totalOrders - analytics.ordersLast7Days, 1)) * 100).toFixed(1) : 0;

    const revenueGrowth = analytics.revenueLast7Days > 0 ? 
      ((analytics.revenueLast7Days / Math.max(analytics.totalRevenue - analytics.revenueLast7Days, 1)) * 100).toFixed(1) : 0;

    console.log('📊 Analytics data prepared:', {
      totalUsers: analytics.totalUsers,
      totalOrders: analytics.totalOrders,
      totalRevenue: analytics.totalRevenue,
      userGrowth: userGrowth + '%',
      orderGrowth: orderGrowth + '%',
      popularItemsCount: analytics.popularItems.length,
      dailyOrdersCount: analytics.dailyOrders.length
    });

    res.render('admin-analytics', {
      title: 'Analytics - Rabuste Admin',
      analyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
      analytics: analytics,
      userGrowth: userGrowth,
      orderGrowth: orderGrowth,
      revenueGrowth: revenueGrowth,
      error: null,
      layout: false
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.render('admin-analytics', {
      title: 'Analytics - Rabuste Admin',
      analyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
      analytics: null,
      userGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0,
      error: 'Failed to load analytics data: ' + error.message,
      layout: false
    });
  }
});
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

// Menu management
router.get('/menu-management', ensureAdmin, (req, res) => {
  res.render('admin/menu-management', {
    title: 'Menu Management - Admin Dashboard'
  });
});

// Menu management
router.get('/menu-management', ensureAdmin, (req, res) => {
  res.render('admin/menu-management', {
    title: 'Menu Management - Admin Dashboard'
  });
});

// User management
router.get('/users', ensureAdmin, adminController.getUsers);
router.post('/users/:id/update', ensureAdmin, adminController.updateUser);

module.exports = router;