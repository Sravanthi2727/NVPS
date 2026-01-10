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

  // Menu page - serve HTML file
  getMenu: (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '../../public', 'menu.html'));
  },

  // Gallery page - serve HTML file
  getGallery: (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '../../public', 'gallery.html'));
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
      description: 'Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support and proven business model. Investment range $75K-$150K.',
      currentPage: '/franchise',
      keywords: 'coffee franchise, robusta coffee franchise, café franchise opportunities, premium coffee business, franchise investment, coffee shop franchise',
      ogTitle: 'Franchise Opportunities - Partner with Rabuste Coffee',
      ogDescription: 'Join the bold coffee revolution. Premium Robusta-only franchise with proven business model, comprehensive support, and strong ROI potential.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/franchise',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/franchise',
      investmentRanges: [
        '$50K - $75K',
        '$75K - $100K',
        '$100K - $150K',
        '$150K - $200K',
        '$200K+'
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
  }
};

module.exports = homeController;