/**
 * Franchise Routes
 * Routes for franchise page and franchise applications
 */

const express = require('express');
const router = express.Router();
const Franchise = require('../../models/Franchise');

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}

// Franchise page
router.get('/franchise', (req, res) => {
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
      '₹200K+',
    ],
    isLoggedIn: res.locals.isLoggedIn || false,
    currentUser: res.locals.currentUser || null
  });
});

// Franchise application submission
router.post('/franchise', ensureAuthenticated, async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      city,
      investmentRange,
      expectedTimeline,
      businessExperience
    } = req.body;

    // Use the authenticated user's email
    const email = req.user.email;

    // Validate required fields
    if (!fullName || !phoneNumber || !city || !investmentRange || !expectedTimeline) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Check if application already exists for this user
    const existingApplication = await Franchise.findOne({ 
      $or: [
        { userId: req.user._id || req.user.id },
        { email: email.toLowerCase() }
      ]
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a franchise application. Check your dashboard for status updates.'
      });
    }

    // Create new franchise application
    const franchiseApplication = new Franchise({
      userId: req.user._id || req.user.id,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      city: city.trim(),
      investmentRange,
      expectedTimeline,
      businessExperience: businessExperience ? businessExperience.trim() : '',
      status: 'pending'
    });

    await franchiseApplication.save();

    console.log('New franchise application submitted:', {
      id: franchiseApplication._id,
      name: franchiseApplication.fullName,
      email: franchiseApplication.email,
      city: franchiseApplication.city,
      investmentRange: franchiseApplication.investmentRange,
      userId: franchiseApplication.userId
    });

    // Send admin notification email for new franchise application
    try {
      const emailService = require('../../services/emailService');
      console.log('📧 Sending admin notification for new franchise application');
      
      const emailResult = await emailService.notifyAdminNewFranchiseApplication(franchiseApplication);
      if (emailResult.success) {
        console.log('✅ Admin franchise notification email sent successfully');
      } else {
        console.error('❌ Failed to send admin franchise notification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending admin franchise notification email:', emailError);
      // Don't fail application creation if email fails
    }

    res.json({
      success: true,
      message: 'Your franchise application has been submitted successfully! You can track its status in your dashboard.',
      applicationId: franchiseApplication._id
    });

  } catch (error) {
    console.error('Franchise application error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your application. Please try again.'
    });
  }
});

module.exports = router;
