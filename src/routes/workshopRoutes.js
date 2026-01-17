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

// Public workshop registration endpoint (no authentication required)
router.post('/api/workshops/register', async (req, res) => {
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

    // Check if email is already registered for this workshop
    const existingRegistration = await WorkshopRegistration.findOne({
      participantEmail: participantEmail,
      workshopId: workshopId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false,
        error: 'This email is already registered for this workshop' 
      });
    }
    
    // Get userId if user is authenticated, otherwise null for public registration
    const userId = req.isAuthenticated && req.isAuthenticated() && req.user ? req.user.id : null;
    
    const registration = new WorkshopRegistration({
      userId: userId,
      workshopId,
      workshopName,
      workshopDate: new Date(workshopDate),
      participantName,
      participantEmail,
      participantPhone,
      status: 'registered'
    });
    
    await registration.save();
    res.json({ 
      success: true, 
      message: 'Registration successful! You will receive a confirmation email shortly.',
      registration: registration 
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
