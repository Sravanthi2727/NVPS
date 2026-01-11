/**
 * Home Controller
 * Handles home page and general site pages
 */

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
  getMenu: (req, res) => {
    res.render('menu', {
      title: 'Menu - Rabuste Coffee',
      description: 'Explore our premium Robusta coffee menu featuring bold flavors and artistic presentations.',
      currentPage: '/menu',
      keywords: 'coffee menu, robusta coffee drinks, premium coffee, café menu, Rabuste Coffee menu',
      ogTitle: 'Menu - Rabuste Coffee',
      ogDescription: 'Explore our premium Robusta coffee menu featuring bold flavors and artistic presentations.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/menu',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/menu'
    });
  },

  // Gallery page
  getGallery: (req, res) => {
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
      canonicalUrl: 'https://rabustecoffee.com/gallery'
    });
  },

  // Workshops page
  getWorkshops: (req, res) => {
    res.render('workshops', {
      title: 'Workshops - Rabuste Coffee',
      description: 'Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.',
      currentPage: '/workshops',
      layout: false // Use the workshops page without the main layout
    });
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

  // Philosophy page
  getPhilosophy: (req, res) => {
    res.render('philosophy', {
      title: 'Philosophy - The Robusta Rebellion | Rabuste Coffee',
      description: 'Discover the philosophy behind Rabuste Coffee - our commitment to bold Robusta beans, art, and the rebellion against the ordinary.',
      currentPage: '/philosophy',
      keywords: 'robusta coffee philosophy, coffee rebellion, bold coffee, art and coffee, Rabuste philosophy',
      ogTitle: 'Philosophy - The Robusta Rebellion | Rabuste Coffee',
      ogDescription: 'Challenging the Arabica status quo. We curate strength, narrative, and the unapologetic pursuit of the bold.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/philosophy',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/philosophy'
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+₹/;
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
  }
};

module.exports = homeController;