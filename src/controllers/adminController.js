/**
 * Admin Controller
 * Handles admin dashboard and management functions
 */

const adminController = {
  // Upload middleware instance
  _upload: null,

  // Initialize upload middleware
  getUpload: function() {
    if (!this._upload) {
      const multer = require('multer');
      const path = require('path');
      const fs = require('fs');

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../public/uploads/artworks');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
      });

      this._upload = multer({ 
        storage: storage,
        limits: {
          fileSize: 10 * 1024 * 1024 // 10MB limit
        },
        fileFilter: function (req, file, cb) {
          // Allow only image files
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'), false);
          }
        }
      });
    }
    return this._upload;
  },
  // Admin Dashboard
  getDashboard: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      const WorkshopRegistration = require('../../models/WorkshopRegistration');
      const Request = require('../../models/Request');
      const Franchise = require('../../models/Franchise');
      
      // Get dashboard statistics
      const [
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalWorkshops,
        recentOrders
      ] = await Promise.all([
        Order.countDocuments(),
        Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        // Add other stats as needed
        0, // placeholder for customers
        0, // placeholder for workshops
        Order.find().sort({ createdAt: -1 }).limit(5)
      ]);
      
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
        status: 'pending',
        type: 'franchise'
      });
      
      // Transform orders for dashboard display
      const recentActivity = recentOrders.map(order => ({
        type: 'Cart',
        customer: order.customerName,
        email: order.customerEmail,
        details: order.items.length > 1 
          ? `${order.items[0].name} +${order.items.length - 1} more`
          : order.items[0]?.name || 'Order',
        date: order.createdAt ? order.createdAt.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }) : 'N/A',
        status: order.status
      }));

      res.render("admin/dashboard", {
        title: 'Admin Dashboard - Rabuste Coffee',
        description: 'Admin dashboard for managing orders, workshop requests, and user accounts.',
        currentPage: '/admin',
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        totalWorkshops,
        recentOrders,
        recentActivity,
        counts: {
          cartOrders: pendingCartOrders,
          artOrders: pendingArtOrders,
          workshops: totalPendingWorkshops,
          franchise: pendingFranchise
        },
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      
      // Fallback to static data
      res.render("admin/dashboard", {
        title: 'Admin Dashboard - Rabuste Coffee',
        description: 'Admin dashboard for managing orders, workshop requests, and user accounts.',
        currentPage: '/admin',
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalWorkshops: 0,
        recentOrders: [],
        counts: {
          cartOrders: 0,
          artOrders: 0,
          workshops: 0,
          franchise: 0
        },
        layout: 'layouts/admin'
      });
    }
  },

  // Artworks Management
  getManageArtworks: async (req, res) => {
    try {
      const Artwork = require('../../models/Artwork');
      
      // Fetch all artworks from database
      const artworks = await Artwork.find()
        .sort({ displayOrder: 1, createdAt: -1 });

      console.log(`Loaded ${artworks.length} artworks for admin management`);

      res.render("admin/manage-artworks", {
        title: 'Manage Artworks - Rabuste Admin',
        description: 'Manage artworks in the gallery.',
        currentPage: '/admin/manage-artworks',
        artworks: artworks,
        layout: 'layouts/admin',
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>'
      });
    } catch (error) {
      console.error('Error in getManageArtworks:', error);
      
      // Fallback to empty array if database fails
      res.render("admin/manage-artworks", {
        title: 'Manage Artworks - Rabuste Admin',
        description: 'Manage artworks in the gallery.',
        currentPage: '/admin/manage-artworks',
        artworks: [],
        layout: 'layouts/admin',
        additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
        additionalJS: '<script src="/js/admin.js"></script>',
        error: 'Error loading artworks: ' + error.message
      });
    }
  },

  // API: Add new artwork
  addArtwork: async (req, res) => {
    try {
      const Artwork = require('../../models/Artwork');
      
      console.log('Adding artwork:', req.body);
      console.log('Uploaded file:', req.file);
      
      const {
        title,
        artist,
        category,
        price,
        description,
        year,
        medium,
        dimensions,
        availability,
        shipping,
        editionInfo,
        isAvailable,
        displayOrder
      } = req.body;

      // Validate required fields
      if (!title || !artist || !category || !price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title, artist, category, and price are required' 
        });
      }

      // Create artwork object
      const artworkData = {
        title: title.trim(),
        artist: artist.trim(),
        category: category,
        price: parseFloat(price),
        description: description ? description.trim() : '',
        year: year ? parseInt(year) : undefined,
        medium: medium ? medium.trim() : '',
        dimensions: dimensions ? dimensions.trim() : '',
        availability: availability || 'In Stock',
        shipping: shipping ? shipping.trim() : '',
        editionInfo: editionInfo ? editionInfo.trim() : '',
        isAvailable: isAvailable === 'true',
        displayOrder: displayOrder ? parseInt(displayOrder) : 0
      };

      // Add image path if file was uploaded
      if (req.file) {
        artworkData.image = `/uploads/artworks/${req.file.filename}`;
        console.log('Image saved to:', artworkData.image);
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Artwork image is required' 
        });
      }

      // Save to database
      const newArtwork = new Artwork(artworkData);
      await newArtwork.save();

      console.log('Artwork saved successfully:', newArtwork._id);
      
      res.json({ 
        success: true, 
        message: 'Artwork added successfully',
        artwork: newArtwork
      });

    } catch (error) {
      console.error('Error adding artwork:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error adding artwork: ' + error.message 
      });
    }
  },

  // API: Get individual artwork for editing
  getArtworkById: async (req, res) => {
    try {
      const Artwork = require('../../models/Artwork');
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Artwork ID is required' 
        });
      }

      const artwork = await Artwork.findById(id);
      
      if (!artwork) {
        return res.status(404).json({ 
          success: false, 
          message: 'Artwork not found' 
        });
      }

      res.json({ 
        success: true, 
        artwork: artwork 
      });

    } catch (error) {
      console.error('Error fetching artwork:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching artwork: ' + error.message 
      });
    }
  },

  // API: Update artwork
  updateArtwork: async (req, res) => {
    try {
      const Artwork = require('../../models/Artwork');
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Artwork ID is required' 
        });
      }

      const {
        title,
        artist,
        category,
        price,
        description,
        year,
        medium,
        dimensions,
        availability,
        shipping,
        editionInfo,
        isAvailable,
        displayOrder
      } = req.body;

      // Validate required fields
      if (!title || !artist || !category || !price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title, artist, category, and price are required' 
        });
      }

      // Find existing artwork
      const existingArtwork = await Artwork.findById(id);
      
      if (!existingArtwork) {
        return res.status(404).json({ 
          success: false, 
          message: 'Artwork not found' 
        });
      }

      // Update artwork object
      const updateData = {
        title: title.trim(),
        artist: artist.trim(),
        category: category,
        price: parseFloat(price),
        description: description ? description.trim() : '',
        year: year ? parseInt(year) : undefined,
        medium: medium ? medium.trim() : '',
        dimensions: dimensions ? dimensions.trim() : '',
        availability: availability || 'In Stock',
        shipping: shipping ? shipping.trim() : '',
        editionInfo: editionInfo ? editionInfo.trim() : '',
        isAvailable: isAvailable === 'true',
        displayOrder: displayOrder ? parseInt(displayOrder) : 0
      };

      // Update image if new file was uploaded
      if (req.file) {
        updateData.image = `/uploads/artworks/${req.file.filename}`;
        console.log('New image saved to:', updateData.image);
      }

      // Save to database
      const updatedArtwork = await Artwork.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );

      console.log('Artwork updated successfully:', updatedArtwork._id);
      
      res.json({ 
        success: true, 
        message: 'Artwork updated successfully',
        artwork: updatedArtwork
      });

    } catch (error) {
      console.error('Error updating artwork:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating artwork: ' + error.message 
      });
    }
  },

  // API: Delete artwork
  deleteArtwork: async (req, res) => {
    try {
      const Artwork = require('../../models/Artwork');
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Artwork ID is required' 
        });
      }

      // Find and delete artwork
      const deletedArtwork = await Artwork.findByIdAndDelete(id);
      
      if (!deletedArtwork) {
        return res.status(404).json({ 
          success: false, 
          message: 'Artwork not found' 
        });
      }

      console.log('Artwork deleted successfully:', id);
      
      res.json({ 
        success: true, 
        message: 'Artwork deleted successfully' 
      });

    } catch (error) {
      console.error('Error deleting artwork:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting artwork: ' + error.message 
      });
    }
  },

  // Cart Requests Management (Menu Orders only)
  getCartRequests: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      
      // Fetch only menu/cart orders (exclude art orders)
      const orders = await Order.find({ 
        $or: [
          { orderType: { $ne: 'art' } },
          { orderType: { $exists: false } },
          { orderType: null }
        ]
      })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      console.log(`Found ${orders.length} cart orders (excluding art orders)`);

      // Transform orders to match expected format
      const cartRequests = orders.map(order => ({
        _id: order._id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        status: order.status,
        orderDate: order.orderDate,
        createdAt: order.createdAt
      }));

      res.render("admin/cart-requests", {
        title: 'Cart Requests - Admin Dashboard',
        description: 'Manage customer cart orders and requests.',
        currentPage: '/admin/cart-requests',
        cartRequests,
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error fetching cart orders:', error);
      
      // Fallback to empty data if database fails
      res.render("admin/cart-requests", {
        title: 'Orders Management - Admin Dashboard',
        description: 'Manage customer orders and their status.',
        currentPage: '/admin/cart-requests',
        cartRequests: [],
        layout: 'layouts/admin'
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
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error fetching art requests:', error);
      
      // Fallback to empty array if database fails
      res.render("admin/art-requests", {
        title: 'Art Requests - Admin Dashboard',
        description: 'Manage artwork purchase orders.',
        currentPage: '/admin/art-requests',
        artRequests: [],
        layout: 'layouts/admin'
      });
    }
  },

  // API: Get individual art request for editing
  getArtRequestById: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order ID is required' 
        });
      }

      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }

      res.json({ 
        success: true, 
        order: order 
      });

    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching order: ' + error.message 
      });
    }
  },

  // Workshop Requests Management
  getWorkshopRequests: async (req, res) => {
    try {
      const WorkshopRegistration = require('../../models/WorkshopRegistration');
      const Request = require('../../models/Request');
      
      // Fetch all workshop registrations (bookings) and proposals
      const registrations = await WorkshopRegistration.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
      const proposals = await Request.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      console.log(`Found ${registrations.length} workshop registrations and ${proposals.length} proposals`);

      res.render("admin/workshop-requests", {
        title: 'Workshop Requests - Admin Dashboard',
        description: 'Manage workshop registrations and proposals.',
        currentPage: '/admin/workshop-requests',
        registrations,
        proposals,
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error fetching workshop requests:', error);
      
      // Fallback to empty data if database fails
      res.render("admin/workshop-requests", {
        title: 'Workshop Requests - Admin Dashboard',
        description: 'Manage workshop registrations and proposals.',
        currentPage: '/admin/workshop-requests',
        registrations: [],
        proposals: [],
        layout: 'layouts/admin'
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
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).render("admin/users", {
        title: 'User Management - Rabuste Admin',
        description: 'Manage user accounts and permissions.',
        currentPage: '/admin/users',
        users: [],
        layout: 'layouts/admin',
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
        franchiseRequests: applications,
        counts: {
          franchise: applications.filter(a => a.status === 'pending').length
        },
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error in getFranchise:', error);
      res.render("admin/franchise", {
        title: 'Franchise Applications - Rabuste Admin',
        description: 'Manage franchise applications and approvals.',
        currentPage: '/admin/franchise',
        franchiseRequests: [],
        counts: {
          franchise: 0
        },
        layout: 'layouts/admin',
        error: 'Error loading franchise applications: ' + error.message
      });
    }
  },

  // Analytics
  getAnalytics: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      const User = require('../../models/User');
      const MenuItem = require('../../models/MenuItem');
      const WorkshopRegistration = require('../../models/WorkshopRegistration');
      
      // Get real analytics data
      const [
        totalRevenue,
        totalOrders,
        totalCustomers,
        workshopRegistrations,
        popularItems,
        recentOrders,
        orderStatusStats
      ] = await Promise.all([
        Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        Order.countDocuments(),
        User.countDocuments(),
        WorkshopRegistration.countDocuments(),
        Order.aggregate([
          { $unwind: "$items" },
          { $group: { 
            _id: "$items.name", 
            orders: { $sum: 1 }, 
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }},
          { $sort: { orders: -1 } },
          { $limit: 5 }
        ]),
        Order.find().sort({ createdAt: -1 }).limit(10),
        Order.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ])
      ]);

      // Get daily data for charts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [dailyOrders, dailyRevenue, dailyUsers] = await Promise.all([
        // Daily Orders
        Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }},
          { $sort: { _id: 1 } }
        ]),
        // Daily Revenue
        Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" }
          }},
          { $sort: { _id: 1 } }
        ]),
        // Daily New Users
        User.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }},
          { $sort: { _id: 1 } }
        ])
      ]);

      // Create complete 30-day arrays with zeros for missing days
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
      }

      // Fill in missing days with 0 values
      const completeOrdersData = last30Days.map(date => {
        const found = dailyOrders.find(d => d._id === date);
        return { date, count: found ? found.count : 0 };
      });

      const completeRevenueData = last30Days.map(date => {
        const found = dailyRevenue.find(d => d._id === date);
        return { date, revenue: found ? found.revenue : 0 };
      });

      const completeUsersData = last30Days.map(date => {
        const found = dailyUsers.find(d => d._id === date);
        return { date, count: found ? found.count : 0 };
      });

      // Format recent activity
      const recentActivity = recentOrders.map(order => ({
        type: order.orderType === 'art' ? 'art' : 'order',
        message: `New ${order.orderType === 'art' ? 'art' : 'menu'} order from ${order.customerName}`,
        time: getTimeAgo(order.createdAt),
        icon: order.orderType === 'art' ? 'palette' : 'shopping-cart'
      }));

      res.render("admin/analytics", {
        title: 'Analytics - Rabuste Admin',
        description: 'Analytics and insights for your business.',
        currentPage: '/admin/analytics',
        stats: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders: totalOrders,
          totalCustomers: totalCustomers,
          workshopRegistrations: workshopRegistrations
        },
        popularItems: popularItems.map(item => ({
          name: item._id,
          orders: item.orders,
          revenue: item.revenue
        })),
        recentActivity: recentActivity,
        dailyOrders: completeOrdersData,
        dailyRevenue: completeRevenueData,
        dailyUsers: completeUsersData,
        orderStatusStats: orderStatusStats,
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      res.render("admin/analytics", {
        title: 'Analytics - Rabuste Admin',
        description: 'Analytics and insights for your business.',
        currentPage: '/admin/analytics',
        stats: {
          totalRevenue: 0,
          totalOrders: 0,
          totalCustomers: 0,
          workshopRegistrations: 0
        },
        popularItems: [],
        recentActivity: [],
        dailyOrders: [],
        dailyRevenue: [],
        dailyUsers: [],
        orderStatusStats: [],
        layout: 'layouts/admin'
      });
    }
  },

  // Menu Management
  getMenuManagement: async (req, res) => {
    try {
      res.render("admin/menu-management", {
        title: 'Menu Management - Rabuste Admin',
        description: 'Manage menu items across all categories.',
        currentPage: '/admin/menu-management',
        layout: 'layouts/admin'
      });
    } catch (error) {
      console.error('Error loading menu management:', error);
      res.render("admin/menu-management", {
        title: 'Menu Management - Rabuste Admin',
        description: 'Manage menu items across all categories.',
        currentPage: '/admin/menu-management',
        layout: 'layouts/admin'
      });
    }
  },

  // Get Menu Items API
  getMenuItems: async (req, res) => {
    try {
      const MenuItem = require('../../models/MenuItem');
      const items = await MenuItem.find().sort({ category: 1, displayOrder: 1 });
      
      res.json({
        success: true,
        items: items
      });
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching menu items: ' + error.message
      });
    }
  },

  // Add Menu Item API
  addMenuItem: async (req, res) => {
    try {
      const MenuItem = require('../../models/MenuItem');
      
      const {
        category,
        name,
        description,
        price,
        image,
        isAvailable
      } = req.body;

      // Validate required fields
      if (!category || !name || !description || !price || !image) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Create new menu item
      const newItem = new MenuItem({
        category,
        subCategory: category, // Use category as subCategory for now
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image: image.trim(),
        isAvailable: isAvailable !== false,
        displayOrder: 0
      });

      await newItem.save();

      res.json({
        success: true,
        message: 'Menu item added successfully',
        item: newItem
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding menu item: ' + error.message
      });
    }
  },

  // Update Menu Item API
  updateMenuItem: async (req, res) => {
    try {
      const MenuItem = require('../../models/MenuItem');
      const { id } = req.params;
      
      const {
        category,
        name,
        description,
        price,
        image,
        isAvailable
      } = req.body;

      // Validate required fields
      if (!category || !name || !description || !price || !image) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Update menu item
      const updatedItem = await MenuItem.findByIdAndUpdate(
        id,
        {
          category,
          subCategory: category,
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          image: image.trim(),
          isAvailable: isAvailable !== false
        },
        { new: true, runValidators: true }
      );

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item updated successfully',
        item: updatedItem
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating menu item: ' + error.message
      });
    }
  },

  // Delete Menu Item API
  deleteMenuItem: async (req, res) => {
    try {
      const MenuItem = require('../../models/MenuItem');
      const { id } = req.params;

      const deletedItem = await MenuItem.findByIdAndDelete(id);

      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting menu item: ' + error.message
      });
    }
  },

  // Analytics API
  getAnalyticsAPI: async (req, res) => {
    try {
      const Order = require('../../models/Order');
      const User = require('../../models/User');
      const WorkshopRegistration = require('../../models/WorkshopRegistration');
      
      // Get real analytics data
      const [
        totalRevenue,
        totalOrders,
        totalCustomers,
        workshopRegistrations,
        popularItems,
        recentOrders
      ] = await Promise.all([
        Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        Order.countDocuments(),
        User.countDocuments(),
        WorkshopRegistration.countDocuments(),
        Order.aggregate([
          { $unwind: "$items" },
          { $group: { 
            _id: "$items.name", 
            orders: { $sum: 1 }, 
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }},
          { $sort: { orders: -1 } },
          { $limit: 5 }
        ]),
        Order.find().sort({ createdAt: -1 }).limit(10)
      ]);

      // Get daily data for charts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [dailyOrders, dailyRevenue, dailyUsers] = await Promise.all([
        // Daily Orders
        Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }},
          { $sort: { _id: 1 } }
        ]),
        // Daily Revenue
        Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" }
          }},
          { $sort: { _id: 1 } }
        ]),
        // Daily New Users
        User.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }},
          { $sort: { _id: 1 } }
        ])
      ]);

      // Create complete 30-day arrays
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
      }

      // Fill in missing days with 0 values
      const completeOrdersData = last30Days.map(date => {
        const found = dailyOrders.find(d => d._id === date);
        return { date, count: found ? found.count : 0 };
      });

      const completeRevenueData = last30Days.map(date => {
        const found = dailyRevenue.find(d => d._id === date);
        return { date, revenue: found ? found.revenue : 0 };
      });

      const completeUsersData = last30Days.map(date => {
        const found = dailyUsers.find(d => d._id === date);
        return { date, count: found ? found.count : 0 };
      });

      // Format recent activity
      const recentActivity = recentOrders.map(order => ({
        type: order.orderType === 'art' ? 'art' : 'order',
        message: `New ${order.orderType === 'art' ? 'art' : 'menu'} order from ${order.customerName}`,
        time: getTimeAgo(order.createdAt),
        icon: order.orderType === 'art' ? 'palette' : 'shopping-cart'
      }));

      res.json({
        success: true,
        stats: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders: totalOrders,
          totalCustomers: totalCustomers,
          workshopRegistrations: workshopRegistrations
        },
        popularItems: popularItems.map(item => ({
          name: item._id,
          orders: item.orders,
          revenue: item.revenue
        })),
        recentActivity: recentActivity
      });
    } catch (error) {
      console.error('Error loading analytics API:', error);
      res.status(500).json({
        success: false,
        message: 'Error loading analytics data'
      });
    }
  }
};

// Helper function for time formatting
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${diffInDays} days ago`;
}

module.exports = adminController;