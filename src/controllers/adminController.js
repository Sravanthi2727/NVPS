/**
 * Admin Controller
 * Handles admin dashboard and management functions
 */

const adminController = {
  // Admin Dashboard
  getDashboard: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      const WorkshopRegistration = require('../../models/WorkshopRegistration');
      const Request = require('../../models/Request');
      const Franchise = require('../../models/Franchise');
      
      // Get all orders first to debug
      const allOrders = await Order.find();
      console.log('=== ALL ORDERS ===');
      console.log('Total orders:', allOrders.length);
      allOrders.forEach(order => {
        console.log(`Order ${order._id}: status="${order.status}", orderType="${order.orderType}"`);
      });
      
      // Get counts for dashboard cards
      const pendingCartOrders = await Order.countDocuments({ 
        status: 'pending',
        $or: [
          { orderType: 'menu' },
          { orderType: { $exists: false } },
          { orderType: null }
        ]
      });
      
      console.log('Pending cart orders count:', pendingCartOrders);
      
      const pendingArtOrders = await Order.countDocuments({ 
        status: 'pending',
        orderType: 'art'
      });
      
      console.log('Pending art orders count:', pendingArtOrders);
      
      const pendingWorkshopBookings = await WorkshopRegistration.countDocuments({ 
        status: { $in: ['registered', 'pending'] }
      });
      
      const pendingWorkshopProposals = await Request.countDocuments({ 
        type: 'conduct-workshop',
        status: 'pending'
      });
      
      const totalPendingWorkshops = pendingWorkshopBookings + pendingWorkshopProposals;
      
      const pendingFranchise = await Franchise.countDocuments({ 
        status: 'pending'
      });
      
      // Get recent orders for dashboard
      const recentOrders = await Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      // Transform orders for dashboard display
      const recentActivity = recentOrders.map(order => ({
        type: 'Cart',
        customer: order.customerName,
        email: order.customerEmail,
        details: order.items.length > 1 
          ? `${order.items[0].name} +${order.items.length - 1} more`
          : order.items[0]?.name || 'Order',
        date: order.orderDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        status: order.status
      }));

      res.render("admin/dashboard", {
        title: 'Admin Dashboard - Rabuste Coffee',
        description: 'Admin dashboard for managing orders, workshop requests, and user accounts.',
        currentPage: '/admin',
        recentActivity,
        counts: {
          cartOrders: pendingCartOrders,
          artOrders: pendingArtOrders,
          workshops: totalPendingWorkshops,
          franchise: pendingFranchise
        },
        layout: false
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      
      // Fallback to static data
      res.render("admin/dashboard", {
        title: 'Admin Dashboard - Rabuste Coffee',
        description: 'Admin dashboard for managing orders, workshop requests, and user accounts.',
        currentPage: '/admin',
        counts: {
          cartOrders: 0,
          artOrders: 0,
          workshops: 0,
          franchise: 0
        },
        layout: false
      });
    }
  },

  // Cart Requests Management (now Orders Management)
  getCartRequests: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      
      // Fetch orders from database
      const orders = await Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      // Transform orders to match the expected format
      const cartRequests = orders.map(order => ({
        id: order._id,
        customerName: order.customerName,
        email: order.customerEmail,
        items: order.items.map(item => `${item.name} (x${item.quantity})`),
        itemsDetailed: order.items,
        total: order.totalAmount,
        status: order.status,
        date: order.orderDate.toISOString().split('T')[0],
        createdAt: order.createdAt
      }));

      res.render("admin/cart-requests", {
        title: 'Orders Management - Admin Dashboard',
        description: 'Manage customer orders and their status.',
        currentPage: '/admin/cart-requests',
        cartRequests,
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Fallback to mock data if database fails
      const cartRequests = [
        {
          id: 1,
          customerName: 'John Doe',
          email: 'john@example.com',
          items: ['Robusta Blend', 'Espresso Shot'],
          total: 25.50,
          status: 'pending',
          date: '2024-01-08'
        }
      ];
      
      res.render("admin/cart-requests", {
        title: 'Orders Management - Admin Dashboard',
        description: 'Manage customer orders and their status.',
        currentPage: '/admin/cart-requests',
        cartRequests,
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    }
  },

  // Workshop Requests Management
  getWorkshopRequests: async (req, res) => {
    try {
      const WorkshopRegistration = require('../../models/WorkshopRegistration');
      const Request = require('../../models/Request');
      
      // Fetch workshop registrations (bookings)
      const registrations = await WorkshopRegistration.find()
        .populate('workshopId', 'title date meta')
        .populate('userId', 'name email')
        .sort({ registrationDate: -1 });
      
      // Fetch workshop proposals (conduct-workshop requests)
      const proposals = await Request.find({ type: 'conduct-workshop' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
      
      // Map registrations to workshopRequests format
      const registrationRequests = registrations.map((reg, index) => ({
        id: reg._id.toString(),
        type: 'booking',
        customerName: reg.participantName || (reg.userId && reg.userId.name) || '',
        name: reg.participantName || (reg.userId && reg.userId.name) || '',
        email: reg.participantEmail || (reg.userId && reg.userId.email) || '',
        phone: reg.participantPhone || '',
        workshop: reg.workshopName || (reg.workshopId && reg.workshopId.title) || '',
        title: reg.workshopName || (reg.workshopId && reg.workshopId.title) || '',
        date: reg.workshopDate,
        duration: reg.workshopId && reg.workshopId.meta && reg.workshopId.meta.duration ? reg.workshopId.meta.duration : '',
        participants: 1, // Each registration is for 1 participant
        capacity: reg.workshopId && reg.workshopId.meta && reg.workshopId.meta.capacity ? reg.workshopId.meta.capacity : '',
        price: reg.workshopId && reg.workshopId.meta && reg.workshopId.meta.price ? reg.workshopId.meta.price : '',
        status: reg.status === 'registered' ? 'pending' : reg.status === 'confirmed' ? 'approved' : reg.status,
        requestDate: reg.registrationDate || reg.createdAt,
        submittedDate: reg.registrationDate || reg.createdAt,
        createdAt: reg.createdAt,
        // Additional details for modal
        workshopId: reg.workshopId ? reg.workshopId._id.toString() : '',
        notes: reg.notes || ''
      }));
      
      // Map proposals to workshopRequests format
      const proposalRequests = proposals.map((proposal, index) => ({
        id: proposal._id.toString(),
        type: 'proposal',
        customerName: proposal.details && proposal.details.organizerName ? proposal.details.organizerName : (proposal.userId && proposal.userId.name) || '',
        name: proposal.details && proposal.details.organizerName ? proposal.details.organizerName : (proposal.userId && proposal.userId.name) || '',
        organizerName: proposal.details && proposal.details.organizerName ? proposal.details.organizerName : '',
        email: proposal.details && proposal.details.organizerEmail ? proposal.details.organizerEmail : (proposal.userId && proposal.userId.email) || '',
        phone: proposal.details && proposal.details.organizerPhone ? proposal.details.organizerPhone : '',
        workshop: proposal.title || '',
        title: proposal.title || '',
        category: proposal.details && proposal.details.category ? proposal.details.category : '',
        description: proposal.description || '',
        date: proposal.details && proposal.details.preferredDate ? proposal.details.preferredDate : '',
        duration: proposal.details && proposal.details.duration ? proposal.details.duration + ' hrs' : '',
        participants: proposal.details && proposal.details.capacity ? proposal.details.capacity : '',
        capacity: proposal.details && proposal.details.capacity ? proposal.details.capacity : '',
        price: proposal.details && proposal.details.price ? proposal.details.price : '',
        skillLevel: proposal.details && proposal.details.skillLevel ? proposal.details.skillLevel : '',
        materialsNeeded: proposal.details && proposal.details.materialsNeeded ? proposal.details.materialsNeeded : '',
        collaborationType: proposal.details && proposal.details.collaborationType ? proposal.details.collaborationType : '',
        additionalNotes: proposal.details && proposal.details.additionalNotes ? proposal.details.additionalNotes : '',
        organizerExperience: proposal.details && proposal.details.organizerExperience ? proposal.details.organizerExperience : '',
        status: proposal.status || 'pending',
        requestDate: proposal.submittedDate || proposal.createdAt,
        submittedDate: proposal.submittedDate || proposal.createdAt,
        createdAt: proposal.createdAt
      }));
      
      // Combine both types of requests
      const workshopRequests = [...registrationRequests, ...proposalRequests].sort((a, b) => {
        const dateA = new Date(a.requestDate || a.submittedDate || a.createdAt);
        const dateB = new Date(b.requestDate || b.submittedDate || b.createdAt);
        return dateB - dateA; // Most recent first
      });
      
      console.log(`Loaded ${registrationRequests.length} workshop registrations and ${proposalRequests.length} workshop proposals`);
      
      res.render("admin/workshop-requests", {
        title: 'Workshop Requests - Rabuste Admin',
        description: 'Manage workshop booking requests and proposals.',
        currentPage: '/admin/workshop-requests',
        workshopRequests,
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    } catch (error) {
      console.error('Error in getWorkshopRequests:', error);
      res.status(500).render("admin/workshop-requests", {
        title: 'Workshop Requests - Rabuste Admin',
        description: 'Manage workshop booking requests and proposals.',
        currentPage: '/admin/workshop-requests',
        workshopRequests: [],
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>',
        error: 'Error loading workshop requests: ' + error.message
      });
    }
  },

  // Art Requests Management (Art Purchase Orders)
  getArtRequests: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      
      // Fetch art purchase orders from database
      const artRequests = await Order.find({ orderType: 'art' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      console.log(`Found ${artRequests.length} art purchase orders`);

      res.render("admin/art-requests", {
        title: 'Art Requests - Admin Dashboard',
        description: 'Manage artwork purchase orders.',
        currentPage: '/admin/art-requests',
        artRequests,
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    } catch (error) {
      console.error('Error fetching art requests:', error);
      
      // Fallback to empty array if database fails
      res.render("admin/art-requests", {
        title: 'Art Requests - Admin Dashboard',
        description: 'Manage artwork purchase orders.',
        currentPage: '/admin/art-requests',
        artRequests: [],
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    }
  },

  // Update cart request status (now order status)
  updateCartRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const Order = require('../../models/Order');
      
      // Validate status
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        console.error('Invalid status:', status);
        return res.redirect("/admin/cart-requests?error=invalid_status");
      }

      // Update order status in database
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );

      if (!updatedOrder) {
        console.error('Order not found:', id);
        return res.redirect("/admin/cart-requests?error=order_not_found");
      }

      console.log(`Order status updated successfully:`, {
        orderId: id,
        newStatus: status,
        customer: updatedOrder.customerName
      });

      res.redirect("/admin/cart-requests?success=status_updated");
    } catch (error) {
      console.error('Error updating order status:', error);
      res.redirect("/admin/cart-requests?error=update_failed");
    }
  },

  // Update art request status (Order status)
  updateArtRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const Order = require('../../models/Order');
      
      // Validate status
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        console.error('Invalid status:', status);
        return res.redirect("/admin/art-requests?error=invalid_status");
      }

      // Update order status in database
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );

      if (!updatedOrder) {
        console.error('Order not found:', id);
        return res.redirect("/admin/art-requests?error=order_not_found");
      }

      // If order is completed, remove purchased art from all users' carts and wishlists
      if (status === 'completed' && updatedOrder.orderType === 'art') {
        const User = require('../../models/User');
        const artItemIds = updatedOrder.items.map(item => String(item.itemId));
        
        // Get all users and remove items from their carts and wishlists
        const users = await User.find({});
        for (const user of users) {
          let updated = false;
          
          // Remove from cart
          const cartBeforeLength = user.cart.length;
          user.cart = user.cart.filter(cartItem => {
            const cartItemId = String(cartItem.itemId);
            return !artItemIds.includes(cartItemId);
          });
          if (user.cart.length !== cartBeforeLength) {
            user.markModified('cart');
            updated = true;
          }
          
          // Remove from wishlist
          const wishlistBeforeLength = user.wishlist.length;
          user.wishlist = user.wishlist.filter(wishlistItem => {
            const wishlistItemId = String(wishlistItem.itemId);
            return !artItemIds.includes(wishlistItemId);
          });
          if (user.wishlist.length !== wishlistBeforeLength) {
            user.markModified('wishlist');
            updated = true;
          }
          
          if (updated) {
            await user.save();
          }
        }
        
        console.log(`Removed purchased art items from all users' carts and wishlists:`, artItemIds);
      }

      console.log(`Art order status updated successfully:`, {
        orderId: id,
        newStatus: status,
        customer: updatedOrder.customerName
      });

      res.redirect("/admin/art-requests?success=status_updated");
    } catch (error) {
      console.error('Error updating art order status:', error);
      res.redirect("/admin/art-requests?error=update_failed");
    }
  },

  // Update workshop request status
  updateWorkshopRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const WorkshopRegistration = require('../../models/WorkshopRegistration');
      const Request = require('../../models/Request');
      const mongoose = require('mongoose');
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid request ID' });
      }
      
      // Try to find in WorkshopRegistration first (bookings)
      let registration = await WorkshopRegistration.findById(id);
      if (registration) {
        // Map admin status to registration status
        let registrationStatus = status;
        if (status === 'approved') {
          registrationStatus = 'confirmed';
        } else if (status === 'rejected') {
          registrationStatus = 'cancelled';
        } else if (status === 'completed') {
          registrationStatus = 'completed';
        }
        
        registration.status = registrationStatus;
        await registration.save();
        
        console.log(`Updated workshop registration ${id} to status: ${registrationStatus}`);
        return res.redirect("/admin/workshop-requests");
      }
      
      // Try to find in Request (proposals)
      let proposal = await Request.findById(id);
      if (proposal) {
        // Validate status for Request model
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (validStatuses.includes(status)) {
          proposal.status = status;
          await proposal.save();
          
          console.log(`Updated workshop proposal ${id} to status: ${status}`);
          return res.redirect("/admin/workshop-requests");
        } else {
          return res.status(400).json({ success: false, message: 'Invalid status for proposal' });
        }
      }
      
      // If neither found
      return res.status(404).json({ success: false, message: 'Workshop request not found' });
      
    } catch (error) {
      console.error('Error updating workshop request:', error);
      return res.status(500).json({ success: false, message: 'Error updating workshop request: ' + error.message });
    }
  },

  // Create new workshop
  createWorkshop: async (req, res) => {
    try {
      const workshopData = req.body;
      
      // Validate required fields
      const requiredFields = ['title', 'category', 'description', 'date', 'startTime', 'endTime', 'maxParticipants', 'price', 'instructorName'];
      const missingFields = requiredFields.filter(field => !workshopData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      // Here you would save to database
      // const Workshop = require('../../models/Workshop');
      // const newWorkshop = new Workshop(workshopData);
      // await newWorkshop.save();
      
      console.log('Creating new workshop:', {
        title: workshopData.title,
        category: workshopData.category,
        date: workshopData.date,
        instructor: workshopData.instructorName,
        participants: workshopData.maxParticipants,
        price: workshopData.price
      });
      
      res.json({
        success: true,
        message: 'Workshop created successfully',
        workshopId: Math.floor(Math.random() * 1000) + 1 // Mock ID
      });
    } catch (error) {
      console.error('Error creating workshop:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create workshop'
      });
    }
  },

  // Save workshop as draft
  saveWorkshopDraft: async (req, res) => {
    try {
      const workshopData = { ...req.body, status: 'draft' };
      
      // Here you would save to database
      console.log('Saving workshop draft:', {
        title: workshopData.title || 'Untitled Workshop',
        category: workshopData.category,
        status: 'draft'
      });
      
      res.json({
        success: true,
        message: 'Workshop draft saved successfully',
        draftId: Math.floor(Math.random() * 1000) + 1 // Mock ID
      });
    } catch (error) {
      console.error('Error saving workshop draft:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save workshop draft'
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { role, status } = req.body;
      
      const User = require('../../models/User');
      
      // Validate inputs
      if (role && !['customer', 'staff', 'admin'].includes(role)) {
        console.error('Invalid role:', role);
        return res.redirect("/admin/users?error=invalid_role");
      }
      
      if (status && !['active', 'inactive', 'suspended'].includes(status)) {
        console.error('Invalid status:', status);
        return res.redirect("/admin/users?error=invalid_status");
      }
      
      // Update user in database
      const updateData = {};
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      updateData.updatedAt = new Date();
      
      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      if (!updatedUser) {
        console.error('User not found:', id);
        return res.redirect("/admin/users?error=user_not_found");
      }
      
      console.log(`User updated successfully:`, {
        userId: id,
        newRole: role,
        newStatus: status,
        name: updatedUser.name
      });
      
      res.redirect("/admin/users?success=user_updated");
    } catch (error) {
      console.error('Error updating user:', error);
      res.redirect("/admin/users?error=update_failed");
    }
  },

  // Get users
  getUsers: async (req, res) => {
    try {
      const User = require('../../models/User');
      
      // Fetch all users from database
      const users = await User.find()
        .sort({ createdAt: -1 });
      
      // Transform users to match view expectations
      const transformedUsers = users.map(user => ({
        id: user._id,
        name: user.name || 'Unknown User',
        email: user.email || 'No Email',
        role: user.role || 'customer',
        status: user.status || 'active',
        joinDate: user.createdAt
      }));
      
      console.log(`Loaded ${users.length} users`);
      
      res.render("admin/users", {
        title: 'User Management - Rabuste Admin',
        description: 'Manage user accounts and permissions.',
        currentPage: '/admin/users',
        users: transformedUsers,
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).render("admin/users", {
        title: 'User Management - Rabuste Admin',
        description: 'Manage user accounts and permissions.',
        currentPage: '/admin/users',
        users: [],
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>',
        error: 'Error loading users: ' + error.message
      });
    }
  },

  // Franchise Applications Management
  getFranchise: async (req, res) => {
    try {
      const Franchise = require('../../models/Franchise');
      
      // Fetch all franchise applications from database
      const applications = await Franchise.find()
        .sort({ submittedAt: -1 });
      
      console.log(`Loaded ${applications.length} franchise applications`);
      
      res.render("admin/franchise", {
        title: 'Franchise Applications - Rabuste Admin',
        description: 'Manage franchise applications and approvals.',
        currentPage: '/admin/franchise',
        applications: applications,
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    } catch (error) {
      console.error('Error in getFranchise:', error);
      res.status(500).render("admin/franchise", {
        title: 'Franchise Applications - Rabuste Admin',
        description: 'Manage franchise applications and approvals.',
        currentPage: '/admin/franchise',
        applications: [],
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>',
        error: 'Error loading franchise applications: ' + error.message
      });
    }
  }
};

module.exports = adminController;