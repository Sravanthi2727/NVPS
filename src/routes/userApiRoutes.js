/**
 * User API Routes
 * All user-specific API endpoints
 */

const express = require('express');
const router = express.Router();

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Authentication required' });
}

// Get user's orders
router.get('/orders', async (req, res) => {
  try {
    console.log('=== USER ORDERS API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const Order = require('../../models/Order');
    
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userId = req.user._id || req.user.id;
      console.log('Fetching orders for authenticated user:', userId);
      
      // Find orders by userId (ObjectId) or by customer email as fallback
      const userOrders = await Order.find({
        $or: [
          { userId: userId },
          { customerEmail: req.user.email }
        ]
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${userOrders.length} orders for user ${userId} (${req.user.email})`);
      res.json(userOrders);
    } else {
      console.log('User not authenticated');
      // For debugging, return recent orders
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);
      console.log('Returning recent orders for debugging:', recentOrders.length);
      res.json(recentOrders);
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// Get user's purchased art item IDs (completed orders only)
router.get('/purchased-arts', async (req, res) => {
  try {
    const Order = require('../../models/Order');
    
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userId = req.user._id || req.user.id;
      
      // Find completed orders with art items
      const completedArtOrders = await Order.find({
        userId: userId,
        orderType: 'art',
        status: 'completed'
      });
      
      // Extract art item IDs from completed orders
      const purchasedArtIds = [];
      completedArtOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.type === 'art' && item.itemId) {
            purchasedArtIds.push(String(item.itemId));
          }
        });
      });
      
      // Remove duplicates
      const uniquePurchasedArtIds = [...new Set(purchasedArtIds)];
      
      console.log(`Found ${uniquePurchasedArtIds.length} purchased art items for user ${userId}`);
      res.json({ purchasedArtIds: uniquePurchasedArtIds });
    } else {
      res.json({ purchasedArtIds: [] });
    }
  } catch (error) {
    console.error('Error fetching purchased arts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchased arts', purchasedArtIds: [] });
  }
});

// Get user's franchise applications
router.get('/franchise', async (req, res) => {
  try {
    console.log('=== USER FRANCHISE API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const Franchise = require('../../models/Franchise');
    
    if (req.isAuthenticated && req.isAuthenticated()) {
      const userId = req.user._id || req.user.id;
      const userEmail = req.user.email;
      
      console.log('Fetching franchise applications for user:', userId, userEmail);
      
      // Find applications by userId or email (for backward compatibility)
      const userApplications = await Franchise.find({
        $or: [
          { userId: userId },
          { email: userEmail }
        ]
      }).sort({ submittedAt: -1 });
      
      console.log(`Found ${userApplications.length} franchise applications for user`);
      
      res.json({ success: true, applications: userApplications });
    } else {
      res.status(401).json({ success: false, message: 'Authentication required' });
    }
  } catch (error) {
    console.error('Error fetching user franchise applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch franchise applications', error: error.message });
  }
});

// Get user's workshop registrations with calendar info
router.get('/workshops', ensureAuthenticated, async (req, res) => {
  try {
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const registrations = await WorkshopRegistration.find({ 
      userId: req.user.id 
    })
    .populate('workshopId')
    .sort({ workshopDate: 1 });

    const registrationsWithCalendar = registrations.map(reg => ({
      id: reg._id,
      workshopId: reg.workshopId,
      workshopName: reg.workshopName,
      workshopDate: reg.workshopDate,
      participantName: reg.participantName,
      participantEmail: reg.participantEmail,
      participantPhone: reg.participantPhone,
      status: reg.status,
      registrationDate: reg.registrationDate,
      calendarEventCreated: reg.calendarEventCreated,
      calendarEventLink: reg.googleCalendarEventLink,
      calendarEventError: reg.calendarEventError,
      notes: reg.notes
    }));

    res.json({ 
      success: true, 
      registrations: registrationsWithCalendar 
    });
  } catch (error) {
    console.error('Error fetching workshop registrations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching workshop registrations' 
    });
  }
});

// Get user's workshop events for calendar (formatted for FullCalendar)
router.get('/workshops/calendar-events', ensureAuthenticated, async (req, res) => {
  try {
    console.log('📅 Calendar events API called for user:', req.user.id);
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const registrations = await WorkshopRegistration.find({ 
      userId: req.user.id 
    })
    .populate('workshopId')
    .sort({ workshopDate: 1 });

    console.log('📅 Found', registrations.length, 'workshop registrations');
    console.log('📅 Registration data:', registrations.map(r => ({
      id: r._id,
      workshopName: r.workshopName,
      workshopDate: r.workshopDate,
      status: r.status
    })));

    const calendarEvents = registrations.map(reg => {
      const startDate = new Date(reg.workshopDate);
      const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration

      console.log('📅 Processing registration:', {
        workshopName: reg.workshopName,
        originalDate: reg.workshopDate,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return {
        id: reg._id.toString(),
        title: reg.workshopName,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor: getStatusColor(reg.status),
        borderColor: getStatusColor(reg.status),
        textColor: '#000',
        extendedProps: {
          participantName: reg.participantName,
          participantEmail: reg.participantEmail,
          participantPhone: reg.participantPhone,
          status: reg.status,
          registrationDate: reg.registrationDate,
          calendarEventLink: reg.googleCalendarEventLink,
          calendarEventCreated: reg.calendarEventCreated,
          calendarEventError: reg.calendarEventError
        }
      };
    });

    console.log('📅 Sending', calendarEvents.length, 'calendar events');
    console.log('📅 Calendar events:', calendarEvents);

    res.json({ 
      success: true, 
      events: calendarEvents 
    });
  } catch (error) {
    console.error('Error fetching workshop calendar events:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching workshop calendar events',
      events: []
    });
  }
});

// Helper function to get color based on status
function getStatusColor(status) {
  switch (status) {
    case 'confirmed': return '#28a745';
    case 'completed': return '#6c757d';
    case 'cancelled': return '#dc3545';
    case 'registered':
    default: return '#d6a45a';
  }
}

// Get user's requests
router.get('/requests', ensureAuthenticated, async (req, res) => {
  try {
    const Request = require('../../models/Request');
    const requests = await Request.find({ userId: req.user.id });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching requests' });
  }
});

// Create new request
router.post('/requests', ensureAuthenticated, async (req, res) => {
  try {
    const { type, title, description, price, preferredDate } = req.body;
    const Request = require('../../models/Request');
    const newRequest = new Request({
      userId: req.user.id,
      type,
      title,
      description,
      price: price || null,
      preferredDate: preferredDate || null,
      status: 'pending'
    });
    await newRequest.save();

    console.log('✅ New user request created:', {
      requestId: newRequest._id,
      type: type,
      title: title,
      userId: req.user.id,
      userEmail: req.user.email
    });

    // Send admin notification email
    try {
      const emailService = require('../../services/emailService');
      console.log('📧 Sending admin notification for new request');
      
      const emailResult = await emailService.notifyAdminNewUserRequest(newRequest, req.user);
      if (emailResult.success) {
        console.log('✅ Admin notification email sent successfully');
      } else {
        console.error('❌ Failed to send admin notification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending admin notification email:', emailError);
      // Don't fail request creation if email fails
    }

    res.json({ success: true, item: newRequest });
  } catch (error) {
    console.error('❌ Error creating user request:', error);
    res.status(500).json({ error: 'Error submitting request' });
  }
});

// Get all users (for admin purposes)
router.get('/all', async (req, res) => {
  try {
    const User = require('../../models/User');
    const users = await User.find({}).select('googleId displayName email createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;