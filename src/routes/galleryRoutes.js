/**
 * Gallery Routes
 * Routes for gallery page and artwork-related functionality
 */

const express = require('express');
const router = express.Router();

// Gallery page route
router.get('/gallery', async (req, res) => {
  try {
    console.log('🎨 GALLERY ROUTE CALLED');
    const Artwork = require('../../models/Artwork');
    const artworks = await Artwork.find({ isAvailable: true })
      .sort({ category: 1, displayOrder: 1 });
    console.log('🎨 Found', artworks.length, 'artworks');
    
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
    
    console.log('🎨 Artworks by category:', artworks.reduce((acc, art) => {
      acc[art.category] = (acc[art.category] || 0) + 1;
      return acc;
    }, {}));
    
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
    console.error('🎨 GALLERY ERROR:', error);
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
});

module.exports = router;