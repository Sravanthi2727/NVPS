/**
 * Workshop API Routes
 * All workshop-related API endpoints
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

// Public workshop registration endpoint (no authentication required)
router.post('/register', async (req, res) => {
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
    const Workshop = require('../../models/Workshop');
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ 
        success: false,
        error: 'Workshop not found' 
      });
    }

    // Check if email is already registered for this workshop
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
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

// Authenticated workshop registration endpoint (for logged-in users)
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { workshopId, workshopName, workshopDate, participantName, participantEmail, participantPhone } = req.body;
    
    // Check if user is already registered for this workshop
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
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
    res.json({ success: true, registration: registration });
  } catch (error) {
    console.error('Workshop registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error registering for workshop' 
    });
  }
});

// Cancel workshop registration
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    await WorkshopRegistration.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error canceling workshop registration' });
  }
});

// Workshop proposal submission endpoint
router.post('/submit-proposal', async (req, res) => {
  try {
    const proposalData = req.body;
    
    // Create a new request with the workshop proposal data
    const Request = require('../../models/Request');
    const request = new Request({
      userId: req.isAuthenticated() ? req.user.id : null,
      type: 'conduct-workshop',
      title: proposalData.title,
      description: proposalData.description,
      details: {
        category: proposalData.category,
        organizerName: proposalData.organizerName,
        organizerEmail: proposalData.organizerEmail,
        organizerPhone: proposalData.organizerPhone,
        organizerExperience: proposalData.organizerExperience,
        duration: proposalData.duration,
        capacity: proposalData.capacity,
        skillLevel: proposalData.skillLevel,
        price: proposalData.price,
        preferredDate: proposalData.preferredDate,
        materialsNeeded: proposalData.materialsNeeded,
        collaborationType: proposalData.collaborationType,
        additionalNotes: proposalData.additionalNotes
      },
      status: 'pending',
      submittedDate: new Date()
    });
    
    await request.save();
    
    res.json({ 
      success: true, 
      message: 'Workshop proposal submitted successfully! We will review it and get back to you soon.' 
    });
  } catch (error) {
    console.error('Error submitting workshop proposal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit workshop proposal. Please try again.' 
    });
  }
});

module.exports = router;