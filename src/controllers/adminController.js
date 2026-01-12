/**
 * Admin Controller
 * Handles admin dashboard and management functions
 */

const adminController = {
  // Admin Dashboard
  getDashboard: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      
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
        layout: false
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      
      // Fallback to static data
      res.render("admin/dashboard", {
        title: 'Admin Dashboard - Rabuste Coffee',
        description: 'Admin dashboard for managing orders, workshop requests, and user accounts.',
        currentPage: '/admin',
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
  getWorkshopRequests: (req, res) => {
    try {
      // Mock data - in real app, fetch from database
      const workshopRequests = [
        // Workshop Bookings (existing workshops)
        {
          id: 1,
          type: 'booking',
          customerName: 'Alice Johnson',
          email: 'alice@example.com',
          workshop: 'Coffee Brewing Basics',
          date: '2024-01-15',
          participants: 2,
          status: 'pending',
          requestDate: '2024-01-08'
        },
        {
          id: 2,
          type: 'booking',
          customerName: 'Bob Wilson',
          email: 'bob@example.com',
          workshop: 'Latte Art Masterclass',
          date: '2024-01-20',
          participants: 1,
          status: 'approved',
          requestDate: '2024-01-07'
        },
        // Workshop Proposals (new workshop ideas from users)
        {
          id: 3,
          type: 'proposal',
          organizerName: 'Sarah Martinez',
          email: 'sarah@example.com',
          title: 'Digital Art & Coffee',
          category: 'art',
          description: 'Combining digital art creation with coffee appreciation',
          duration: 3,
          capacity: 12,
          status: 'pending',
          requestDate: '2024-01-09'
        }
      ];
      
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
      res.status(500).send('Error loading workshop requests');
    }
  },

  // Art Requests Management (Art Purchase Orders)
  getArtRequests: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      
      // Fetch art orders from database
      const artOrders = await Order.find({ orderType: 'art' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      // Transform orders to match the expected format
      const artRequests = artOrders.map(order => ({
        _id: order._id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        deliveryAddress: order.deliveryAddress,
        orderDate: order.orderDate,
        createdAt: order.createdAt,
        userId: order.userId
      }));

      res.render("admin/art-requests", {
        title: 'Art Requests - Admin Dashboard',
        description: 'Manage artwork purchase orders and requests.',
        currentPage: '/admin/art-requests',
        artRequests,
        layout: false,
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    } catch (error) {
      console.error('Error fetching art orders:', error);
      
      // Fallback to empty array if database fails
      res.render("admin/art-requests", {
        title: 'Art Requests - Admin Dashboard',
        description: 'Manage artwork purchase orders and requests.',
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

  // Update art request status
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
  updateWorkshopRequest: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Update workshop request status in database
    console.log(`Updating workshop request ${id} to status: ${status}`);
    res.redirect("/admin/workshop-requests");
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
  updateUser: (req, res) => {
    const { id } = req.params;
    const { role, status } = req.body;
    // Update user role/status in database
    console.log(`Updating user ${id} - role: ${role}, status: ${status}`);
    res.redirect("/admin/users");
  }
};

module.exports = adminController;