/**
 * Admin Controller
 * Handles admin dashboard and management functions
 */

const adminController = {
  // Admin Dashboard
  getDashboard: (req, res) => {
    res.render("admin/dashboard", {
      title: 'Admin Dashboard - Rabuste Coffee',
      description: 'Admin dashboard for managing cart requests, workshop requests, and user accounts.',
      currentPage: '/admin',
      layout: false // Disable layout system completely
    });
  },

  // Cart Requests Management
  getCartRequests: (req, res) => {
    // Mock data - replace with actual database queries
    const cartRequests = [
      {
        id: 1,
        customerName: 'John Doe',
        email: 'john@example.com',
        items: ['Robusta Blend', 'Espresso Shot'],
        total: 25.50,
        status: 'pending',
        date: '2024-01-08'
      },
      {
        id: 2,
        customerName: 'Jane Smith',
        email: 'jane@example.com',
        items: ['Cold Brew', 'Pastry'],
        total: 18.75,
        status: 'completed',
        date: '2024-01-07'
      }
    ];
    
    res.render("admin/cart-requests", {
      title: 'Cart Requests - Admin Dashboard',
      description: 'Manage customer cart requests and orders.',
      currentPage: '/admin/cart-requests',
      cartRequests,
      layout: false,
      additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
      additionalJS: '<script src="/js/admin.js"></script>'
    });
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

  // Update cart request status
  updateCartRequest: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Update cart request status in database
    console.log(`Updating cart request ${id} to status: ${status}`);
    res.redirect("/admin/cart-requests");
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