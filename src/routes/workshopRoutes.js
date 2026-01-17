/**
 * Workshops Routes
 * Routes for workshops page and workshop functionality
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Workshop = require('../../models/Workshop');
const WorkshopRegistration = require('../../models/WorkshopRegistration');

// Workshops page
router.get('/workshops', async (req, res) => {
  console.log("Workshops route accessed - fetching dynamic data from database");
  
  try {
    let upcomingWorkshops = [];
    let pastWorkshops = [];
    let teamMembers = [];

    // Always try to fetch from database first - make it truly dynamic
    if (mongoose.connection.readyState === 1) {
      console.log("Database connected, fetching dynamic workshop data");
      
      try {
        // Fetch workshops from database - dynamic data only
        upcomingWorkshops = await Workshop.find({ 
          type: 'upcoming', 
          isActive: true,
          date: { $gte: new Date() } // Only show future workshops
        }).sort({ date: 1, displayOrder: 1 });
        
        pastWorkshops = await Workshop.find({ 
          type: 'past', 
          isActive: true 
        }).sort({ date: -1, displayOrder: 1 });

        // Fetch team members from database if TeamModel exists
        try {
          const TeamModel = require('../../models/Team');
          teamMembers = await TeamModel.find({ 
            isActive: true 
          }).sort({ displayOrder: 1 });
        } catch (teamError) {
          console.log("Team model not available, skipping team members");
          teamMembers = [];
        }

        console.log("Dynamic database results - upcoming:", upcomingWorkshops.length, "past:", pastWorkshops.length, "team:", teamMembers.length);

        // Convert Mongoose documents to plain objects to ensure _id is properly serialized
        const ensureId = (doc) => {
          const plain = doc?.toObject ? doc.toObject() : doc || {};
          if (plain._id) {
            plain._id = String(plain._id);
          } else if (plain.id) {
            plain._id = String(plain.id);
          } else {
            // Fallback: generate an id so front-end registration never breaks
            console.warn('Workshop missing _id, generating temporary ID:', plain.title || 'Unknown');
            plain._id = new mongoose.Types.ObjectId().toString();
          }
          // Ensure _id is never empty or undefined
          if (!plain._id || plain._id === 'undefined' || plain._id === 'null') {
            console.error('Workshop _id is invalid after processing:', plain.title || 'Unknown', plain._id);
            plain._id = new mongoose.Types.ObjectId().toString();
          }
          return plain;
        };

        upcomingWorkshops = upcomingWorkshops.map(ensureId);
        pastWorkshops = pastWorkshops.map(ensureId);
        
        // Debug: Log first workshop to verify _id is set
        if (upcomingWorkshops.length > 0) {
          console.log('Sample upcoming workshop:', {
            title: upcomingWorkshops[0].title,
            _id: upcomingWorkshops[0]._id,
            _idType: typeof upcomingWorkshops[0]._id,
            _idLength: upcomingWorkshops[0]._id ? upcomingWorkshops[0]._id.length : 0
          });
        }

      } catch (dbError) {
        console.error('Database query error:', dbError);
        // On error, return empty arrays - no static fallback to force dynamic data
        upcomingWorkshops = [];
        pastWorkshops = [];
        teamMembers = [];
      }
    } else {
      console.log("Database not connected - returning empty arrays. Please ensure database is connected for dynamic workshop data.");
      // Return empty arrays if database is not connected - no static fallback
      upcomingWorkshops = [];
      pastWorkshops = [];
      teamMembers = [];
    }

    res.render("workshops", {
      title: "Workshops - Rabuste Coffee",
      description: "Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.",
      currentPage: "/workshops",
      upcomingWorkshops: upcomingWorkshops,
      pastWorkshops: pastWorkshops,
      teamMembers: teamMembers,
      additionalCSS: `
        <link rel="stylesheet" href="/css/workshops.css">
        <link rel="stylesheet" href="/css/gallery.css">
      `,
      additionalJS: `
        <script src="/js/workshops.js"></script>
      `
    });
  } catch (error) {
    console.error('Workshops route error:', error);
    // On any error, return empty arrays - truly dynamic approach
    res.render("workshops", {
      title: "Workshops - Rabuste Coffee",
      description: "Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.",
      currentPage: "/workshops",
      upcomingWorkshops: [],
      pastWorkshops: [],
      teamMembers: [],
      additionalCSS: `
        <link rel="stylesheet" href="/css/workshops.css">
        <link rel="stylesheet" href="/css/gallery.css">
      `,
      additionalJS: `
        <script src="/js/workshops.js"></script>
      `
    });
  }
});

// Workshop registration endpoint (requires authentication)
router.post('/api/workshops/register', async (req, res) => {
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false,
      error: 'You must be logged in to register for workshops. Please login and try again.',
      requiresAuth: true
    });
  }

  try {
    const { workshopId, workshopName, workshopDate, participantName, participantEmail, participantPhone } = req.body;
    
    // Validate required fields
    if (!workshopId || !workshopName || !workshopDate || !participantName || !participantEmail || !participantPhone) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    // Validate workshop exists
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ 
        success: false,
        error: 'Workshop not found' 
      });
    }

    // Check if user is already registered for this workshop
    const existingRegistration = await WorkshopRegistration.findOne({
      userId: req.user.id,
      workshopId: workshopId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false,
        error: 'You are already registered for this workshop' 
      });
    }
    
    // Create registration with authenticated user ID
    const registration = new WorkshopRegistration({
      userId: req.user.id,
      workshopId,
      workshopName,
      workshopDate: new Date(workshopDate),
      participantName,
      participantEmail,
      participantPhone,
      status: 'registered'
    });
    
    await registration.save();
    
    console.log('✅ Workshop registration created:', registration._id);

    // Send admin notification email
    try {
      const emailService = require('../../services/emailService');
      console.log('📧 Sending admin notification for new workshop registration');
      
      const emailResult = await emailService.notifyAdminNewWorkshopRegistration(registration);
      if (emailResult.success) {
        console.log('✅ Admin workshop notification email sent successfully');
      } else {
        console.error('❌ Failed to send admin workshop notification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending admin workshop notification email:', emailError);
      // Don't fail registration if email fails
    }
    
    // Try to create Google Calendar event
    try {
      const googleCalendarService = require('../../services/googleCalendarService');
      const calendarResult = await googleCalendarService.createWorkshopEvent(
        {
          workshopName,
          workshopDate: new Date(workshopDate)
        },
        {
          participantName,
          participantEmail,
          participantPhone
        }
      );
      
      if (calendarResult.success) {
        registration.calendarEventCreated = true;
        registration.googleCalendarEventId = calendarResult.eventId;
        registration.googleCalendarEventLink = calendarResult.eventLink;
        await registration.save();
        console.log('✅ Google Calendar event created for workshop registration');
      } else {
        registration.calendarEventError = calendarResult.error;
        await registration.save();
        console.log('⚠️ Google Calendar event creation failed:', calendarResult.error);
      }
    } catch (calendarError) {
      console.error('❌ Google Calendar service error:', calendarError);
      registration.calendarEventError = 'Calendar service unavailable';
      await registration.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Registration successful! You will receive a confirmation email shortly.',
      registration: {
        id: registration._id,
        workshopName: registration.workshopName,
        workshopDate: registration.workshopDate,
        participantName: registration.participantName,
        status: registration.status,
        calendarEventCreated: registration.calendarEventCreated,
        calendarEventLink: registration.googleCalendarEventLink
      }
    });
  } catch (error) {
    console.error('Workshop registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error registering for workshop. Please try again.' 
    });
  }
});

module.exports = router;
