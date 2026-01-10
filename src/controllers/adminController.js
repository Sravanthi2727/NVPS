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
    // Mock data - replace with actual database queries
    const workshopRequests = [
      {
        id: 1,
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
        customerName: 'Bob Wilson',
        email: 'bob@example.com',
        workshop: 'Latte Art Masterclass',
        date: '2024-01-20',
        participants: 1,
        status: 'approved',
        requestDate: '2024-01-07'
      }
    ];
    
    res.render("admin/workshop-requests", {
      title: 'Workshop Requests - Admin Dashboard',
      description: 'Manage workshop booking requests and schedules.',
      currentPage: '/admin/workshop-requests',
      workshopRequests,
      layout: false,
      additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
      additionalJS: '<script src="/js/admin.js"></script>'
    });
  },

  // Art Requests Management
  getArtRequests: (req, res) => {
    // Mock data - replace with actual database queries
    const artRequests = [
      {
        id: 1,
        artistName: 'Sarah Martinez',
        email: 'sarah@example.com',
        title: 'Coffee Bean Dreams',
        description: 'Abstract painting inspired by coffee culture',
        type: 'painting',
        thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
        submissionDate: '2024-01-08',
        status: 'pending'
      },
      {
        id: 2,
        artistName: 'Mike Wilson',
        email: 'mike@example.com',
        title: 'Morning Brew',
        description: 'Photography series of coffee preparation',
        type: 'photography',
        thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop',
        submissionDate: '2024-01-07',
        status: 'approved'
      },
      {
        id: 3,
        artistName: 'Emma Chen',
        email: 'emma@example.com',
        title: 'Digital Café',
        description: 'Digital art representation of modern café life',
        type: 'digital',
        thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop',
        submissionDate: '2024-01-06',
        status: 'displayed'
      }
    ];
    
    res.render("admin/art-requests", {
      title: 'Art Requests - Admin Dashboard',
      description: 'Manage artwork submissions and gallery requests.',
      currentPage: '/admin/art-requests',
      artRequests,
      layout: false,
      additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
      additionalJS: '<script src="/js/admin.js"></script>'
    });
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
  updateArtRequest: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Update art request status in database
    console.log(`Updating art request ${id} to status: ${status}`);
    res.redirect("/admin/art-requests");
  },

  // Update workshop request status
  updateWorkshopRequest: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Update workshop request status in database
    console.log(`Updating workshop request ${id} to status: ${status}`);
    res.redirect("/admin/workshop-requests");
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