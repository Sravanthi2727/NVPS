/**
 * Home Controller
 * Handles home page and general site pages
 */

const MenuItem = require('../../models/MenuItem');
const Workshop = require('../../models/Workshop');

const homeController = {
  // Home page
  getHome: (req, res) => {
    res.render('home', { 
      title: 'Rabuste Coffee - Premium Robusta Coffee & Art',
      description: 'Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.',
      currentPage: '/',
      keywords: 'premium robusta coffee, art café, coffee shop, coffee and art, Rabuste Coffee',
      ogTitle: 'Rabuste Coffee - Premium Robusta Coffee & Art',
      ogDescription: 'Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com'
    });
  },

  // About page
  getAbout: (req, res) => {
    res.render('about', {
      title: 'About Us - Rabuste Coffee',
      description: 'Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.',
      currentPage: '/about',
      keywords: 'about Rabuste Coffee, our story, coffee passion, Robusta coffee, café team',
      ogTitle: 'About Us - Rabuste Coffee',
      ogDescription: 'Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/about',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/about',
      additionalCSS: '<link rel="stylesheet" href="/css/about.css">',
      additionalJS: '<script src="/js/about-animations.js"></script>'
    });
  },

  // Menu page
  getMenu: async (req, res) => {
    try {
      console.log('🍽️ Menu route called via homeController');
      
      console.log('📦 MenuItem model loaded');
      
      const menuItems = await MenuItem.find({ isAvailable: true })
        .sort({ category: 1, subCategory: 1, displayOrder: 1 });
      
      console.log('📊 Found menu items:', menuItems.length);
      
      if (menuItems.length === 0) {
        console.log('⚠️ No menu items found in database');
        // Check if any items exist at all
        const allItems = await MenuItem.find({});
        console.log('📋 Total items in database:', allItems.length);
        
        // If no items exist, try to initialize some basic items
        if (allItems.length === 0) {
          console.log('🔄 No menu items in database, creating sample items...');
          const sampleItems = [
            {
              name: 'Robusta Espresso',
              category: 'hot',
              subCategory: 'robusta-hot-non-milk',
              price: 120,
              description: 'Strong and bold robusta espresso',
              isAvailable: true,
              displayOrder: 1
            },
            {
              name: 'Robusta Cappuccino',
              category: 'hot',
              subCategory: 'robusta-hot-milk',
              price: 150,
              description: 'Creamy cappuccino with robusta coffee',
              isAvailable: true,
              displayOrder: 2
            },
            {
              name: 'Cold Brew',
              category: 'cold',
              subCategory: 'robusta-cold-non-milk',
              price: 180,
              description: 'Smooth cold brew coffee',
              isAvailable: true,
              displayOrder: 3
            }
          ];
          
          await MenuItem.insertMany(sampleItems);
          console.log('✅ Sample menu items created');
          
          // Refetch items
          const newMenuItems = await MenuItem.find({ isAvailable: true })
            .sort({ category: 1, subCategory: 1, displayOrder: 1 });
          console.log('📊 Found menu items after creation:', newMenuItems.length);
          
          // Update menuItems variable
          menuItems.splice(0, 0, ...newMenuItems);
        }
      }
      
      // Group items by category and subcategory
      const groupedMenu = {};
      menuItems.forEach(item => {
        if (!groupedMenu[item.category]) {
          groupedMenu[item.category] = {};
        }
        if (!groupedMenu[item.category][item.subCategory]) {
          groupedMenu[item.category][item.subCategory] = [];
        }
        groupedMenu[item.category][item.subCategory].push(item);
      });

      console.log('🗂️ Grouped menu categories:', Object.keys(groupedMenu));
      console.log('🔍 Sample grouped menu structure:', JSON.stringify(groupedMenu, null, 2).substring(0, 500) + '...');
      console.log('🎯 About to render menu template with menuItems:', typeof groupedMenu, Object.keys(groupedMenu).length);

      res.render('menu', {
        title: 'Our Menu - Rabuste Coffee',
        description: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
        currentPage: '/menu',
        keywords: 'coffee menu, robusta coffee, café menu, coffee drinks, food menu',
        ogTitle: 'Our Menu - Rabuste Coffee',
        ogDescription: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
        ogType: 'website',
        ogUrl: 'https://rabustecoffee.com/menu',
        ogImage: '/assets/coffee-bg.jpeg',
        canonicalUrl: 'https://rabustecoffee.com/menu',
        menuItems: groupedMenu,
        recommendedItems: [],
        isLoggedIn: req.isAuthenticated ? req.isAuthenticated() : false,
        currentUser: req.user || null
      });
    } catch (error) {
      console.error('❌ Menu route error:', error);
      console.error('📍 Error stack:', error.stack);
      console.log('🚨 RENDERING ERROR TEMPLATE - menuItems will be empty');
      res.render('menu', {
        title: 'Our Menu - Rabuste Coffee',
        description: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
        currentPage: '/menu',
        menuItems: {},
        recommendedItems: [],
        isLoggedIn: false,
        currentUser: null
      });
    }
  },

  // Gallery page
  getGallery: async (req, res) => {
    try {
      console.log('🎨 Gallery route called via homeController');
      
      const Artwork = require('../../models/Artwork');
      const artworks = await Artwork.find({ isAvailable: true })
        .sort({ category: 1, displayOrder: 1 });
      
      console.log('🎨 Found artworks:', artworks.length);
      
      if (artworks.length === 0) {
        console.log('⚠️ No artworks found in database');
        // Check if any artworks exist at all
        const allArtworks = await Artwork.find({});
        console.log('📋 Total artworks in database:', allArtworks.length);
      }

      // Get purchased art IDs for current user (if logged in)
      let purchasedArtIds = [];
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        try {
          const Order = require('../../models/Order');
          const completedArtOrders = await Order.find({
            userId: req.user._id || req.user.id,
            orderType: 'art',
            status: 'completed'
          });
          
          completedArtOrders.forEach(order => {
            order.items.forEach(item => {
              if (item.type === 'art' && item.itemId) {
                purchasedArtIds.push(String(item.itemId));
              }
            });
          });
          
          // Remove duplicates
          purchasedArtIds = [...new Set(purchasedArtIds)];
          console.log('🛒 Found', purchasedArtIds.length, 'purchased art items for user');
        } catch (orderError) {
          console.log('⚠️ Could not fetch purchased art items:', orderError.message);
        }
      }

      console.log('🎯 About to render gallery template with artworks:', artworks.length);

      res.render('gallery', {
        title: 'Gallery - Rabuste Coffee',
        description: 'Browse our curated collection of artwork available for purchase at Rabuste Coffee.',
        currentPage: '/gallery',
        keywords: 'art gallery, coffee shop art, artwork for sale, Rabuste Coffee gallery',
        ogTitle: 'Gallery - Rabuste Coffee',
        ogDescription: 'Browse our curated collection of artwork available for purchase at Rabuste Coffee.',
        ogType: 'website',
        ogUrl: 'https://rabustecoffee.com/gallery',
        ogImage: '/assets/coffee-bg.jpeg',
        canonicalUrl: 'https://rabustecoffee.com/gallery',
        artworks: artworks,
        purchasedArtIds: purchasedArtIds,
        isLoggedIn: req.isAuthenticated ? req.isAuthenticated() : false,
        currentUser: req.user || null
      });
    } catch (error) {
      console.error('❌ Gallery route error:', error);
      console.error('📍 Error stack:', error.stack);
      console.log('🚨 RENDERING ERROR TEMPLATE - artworks will be empty');
      res.render('gallery', {
        title: 'Gallery - Rabuste Coffee',
        description: 'Browse our curated collection of artwork available for purchase at Rabuste Coffee.',
        currentPage: '/gallery',
        artworks: [],
        purchasedArtIds: [],
        isLoggedIn: false,
        currentUser: null
      });
    }
  },

  // Franchise page
  getFranchise: (req, res) => {
    res.render('franchise', {
      title: 'Franchise Opportunities - Partner with Rabuste Coffee',
      description: 'Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support and proven business model. Investment range ₹75K-₹150K.',
      currentPage: '/franchise',
      keywords: 'coffee franchise, robusta coffee franchise, café franchise opportunities, premium coffee business, franchise investment, coffee shop franchise',
      ogTitle: 'Franchise Opportunities - Partner with Rabuste Coffee',
      ogDescription: 'Join the bold coffee revolution. Premium Robusta-only franchise with proven business model, comprehensive support, and strong ROI potential.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/franchise',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/franchise',
      investmentRanges: [
        '₹50K - ₹75K',
        '₹75K - ₹100K',
        '₹100K - ₹150K',
        '₹150K - ₹200K',
        '₹200K+'
      ]
    });
  },

  // Art request page
  getArtRequest: (req, res) => {
    res.render('art-request', {
      title: 'Submit Your Art - Rabuste Coffee',
      description: 'Submit your artwork to be featured in Rabuste Coffee gallery.',
      currentPage: '/art-request',
      layout: false // Use standalone layout
    });
  },

  // Handle art request submission
  submitArtRequest: (req, res) => {
    // Handle form submission here
    // For now, just log and redirect back with success message
    console.log('Art request submitted:', req.body);
    res.redirect('/art-request?success=true');
  },

  // User dashboard page
  getUserDashboard: (req, res) => {
    res.render('user-dashboard', {
      title: 'User Dashboard - Rabuste Coffee',
      description: 'Manage your wishlist, cart, workshop registrations, and requests.',
      currentPage: '/dashboard',
      layout: false // Use standalone layout
    });
  },

  // Workshop proposal submission
  submitWorkshopProposal: async (req, res) => {
    try {
      const proposalData = req.body;
      
      // Validate required fields
      const requiredFields = ['title', 'category', 'description', 'organizerName', 'organizerEmail', 'duration', 'capacity'];
      const missingFields = requiredFields.filter(field => !proposalData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(proposalData.organizerEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
      
      // Here you would save to database
      // const WorkshopProposal = require('../../models/WorkshopProposal');
      // const newProposal = new WorkshopProposal(proposalData);
      // await newProposal.save();
      
      console.log('Workshop proposal received:', {
        title: proposalData.title,
        organizer: proposalData.organizerName,
        email: proposalData.organizerEmail,
        category: proposalData.category,
        duration: proposalData.duration,
        capacity: proposalData.capacity,
        submittedAt: new Date().toISOString()
      });
      
      // Here you could also send email notifications
      // await sendProposalConfirmationEmail(proposalData.organizerEmail, proposalData);
      // await sendProposalNotificationToAdmin(proposalData);
      
      res.json({
        success: true,
        message: 'Workshop proposal submitted successfully! We\'ll review it and get back to you within 3-5 business days.',
        proposalId: Math.floor(Math.random() * 10000) + 1 // Mock ID
      });
    } catch (error) {
      console.error('Error submitting workshop proposal:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit workshop proposal. Please try again later.'
      });
    }
  },

  // Workshops page
  getWorkshops: async (req, res) => {
    try {
      console.log('Workshops route called via homeController');
      
      const upcomingWorkshops = await Workshop.find({ 
        type: 'upcoming', 
        isActive: true,
        date: { $gte: new Date() }
      }).sort({ date: 1, displayOrder: 1 });
      
      const pastWorkshops = await Workshop.find({ 
        type: 'past', 
        isActive: true 
      }).sort({ date: -1, displayOrder: 1 });

      console.log('Found workshops - upcoming:', upcomingWorkshops.length, 'past:', pastWorkshops.length);

      res.render('workshops', {
        title: 'Workshops - Rabuste Coffee',
        description: 'Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.',
        currentPage: '/workshops',
        upcomingWorkshops: upcomingWorkshops,
        pastWorkshops: pastWorkshops,
        teamMembers: [],
        layout: 'layouts/boilerplate',
        additionalCSS: ['/css/workshops.css', '/css/gallery.css']
      });
    } catch (error) {
      console.error('Workshops route error:', error);
      res.render('workshops', {
        title: 'Workshops - Rabuste Coffee',
        description: 'Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.',
        currentPage: '/workshops',
        upcomingWorkshops: [],
        pastWorkshops: [],
        teamMembers: [],
        layout: 'layouts/boilerplate',
        additionalCSS: ['/css/workshops.css', '/css/gallery.css']
      });
    }
  }
};

module.exports = homeController;