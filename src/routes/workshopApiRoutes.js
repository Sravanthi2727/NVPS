/**
 * Workshop API Routes
 * All workshop-related API endpoints with Google Calendar integration
 */

const express = require('express');
const router = express.Router();
const googleCalendarService = require('../../services/googleCalendarService');

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
    
    // Create registration record first
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
    console.log('✅ Workshop registration created:', registration._id);

    // Create Google Calendar event
    try {
      const workshopData = {
        workshopName: workshopName,
        workshopDate: workshopDate,
        description: workshop.description || `Workshop: ${workshopName}`
      };

      const participantData = {
        registrationId: registration._id,
        participantName: participantName,
        participantEmail: participantEmail,
        participantPhone: participantPhone
      };

      console.log('📅 Creating Google Calendar event for registration:', registration._id);
      const calendarResult = await googleCalendarService.createWorkshopEvent(workshopData, participantData);

      if (calendarResult.success) {
        // Update registration with calendar event details
        registration.googleCalendarEventId = calendarResult.eventId;
        registration.googleCalendarEventLink = calendarResult.eventLink;
        registration.calendarEventCreated = true;
        await registration.save();

        console.log('✅ Google Calendar event created and linked to registration');
      } else {
        // Log error but don't fail the registration
        registration.calendarEventError = calendarResult.error;
        await registration.save();
        
        console.log('⚠️ Registration successful but calendar event failed:', calendarResult.error);
      }
    } catch (calendarError) {
      console.error('❌ Calendar integration error (non-critical):', calendarError);
      registration.calendarEventError = calendarError.message;
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

    // Validate workshop exists
    const Workshop = require('../../models/Workshop');
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ 
        success: false,
        error: 'Workshop not found' 
      });
    }
    
    // Create registration record
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
    console.log('✅ Authenticated workshop registration created:', registration._id);

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

    // Create Google Calendar event
    try {
      const workshopData = {
        workshopName: workshopName,
        workshopDate: workshopDate,
        description: workshop.description || `Workshop: ${workshopName}`
      };

      const participantData = {
        registrationId: registration._id,
        participantName: participantName,
        participantEmail: participantEmail,
        participantPhone: participantPhone
      };

      console.log('📅 Creating Google Calendar event for authenticated registration:', registration._id);
      const calendarResult = await googleCalendarService.createWorkshopEvent(workshopData, participantData);

      if (calendarResult.success) {
        // Update registration with calendar event details
        registration.googleCalendarEventId = calendarResult.eventId;
        registration.googleCalendarEventLink = calendarResult.eventLink;
        registration.calendarEventCreated = true;
        await registration.save();

        console.log('✅ Google Calendar event created and linked to authenticated registration');
      } else {
        // Log error but don't fail the registration
        registration.calendarEventError = calendarResult.error;
        await registration.save();
        
        console.log('⚠️ Authenticated registration successful but calendar event failed:', calendarResult.error);
      }
    } catch (calendarError) {
      console.error('❌ Calendar integration error for authenticated user (non-critical):', calendarError);
      registration.calendarEventError = calendarError.message;
      await registration.save();
    }
    
    res.json({ 
      success: true, 
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
    console.error('Authenticated workshop registration error:', error);
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
    const registration = await WorkshopRegistration.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        error: 'Registration not found' 
      });
    }

    // Delete Google Calendar event if it exists
    if (registration.googleCalendarEventId) {
      try {
        console.log('📅 Deleting Google Calendar event:', registration.googleCalendarEventId);
        const deleteResult = await googleCalendarService.deleteWorkshopEvent(registration.googleCalendarEventId);
        
        if (deleteResult.success) {
          console.log('✅ Google Calendar event deleted successfully');
        } else {
          console.log('⚠️ Failed to delete Google Calendar event:', deleteResult.error);
        }
      } catch (calendarError) {
        console.error('❌ Error deleting calendar event (non-critical):', calendarError);
      }
    }

    // Delete the registration
    await WorkshopRegistration.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Workshop registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error canceling workshop registration:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error canceling workshop registration' 
    });
  }
});

// Get user's workshop registrations with calendar info
router.get('/my-registrations', ensureAuthenticated, async (req, res) => {
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
      calendarEventError: reg.calendarEventError
    }));

    res.json({ 
      success: true, 
      registrations: registrationsWithCalendar 
    });
  } catch (error) {
    console.error('Error fetching user workshop registrations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching workshop registrations' 
    });
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

// Admin: Update workshop registration status and sync with calendar
router.post('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const registrationId = req.params.id;

    if (!['registered', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const WorkshopRegistration = require('../../models/WorkshopRegistration');
    const registration = await WorkshopRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }

    // Update registration status
    registration.status = status;
    if (adminNotes) {
      registration.adminNotes = adminNotes;
    }
    await registration.save();

    console.log('✅ Workshop registration status updated:', {
      registrationId: registration._id,
      newStatus: status,
      participant: registration.participantName,
      workshop: registration.workshopName
    });

    // Update Google Calendar event if it exists
    if (registration.googleCalendarEventId) {
      try {
        let eventUpdate = {};
        
        if (status === 'cancelled') {
          // Delete the calendar event for cancelled registrations
          const deleteResult = await googleCalendarService.deleteWorkshopEvent(registration.googleCalendarEventId);
          if (deleteResult.success) {
            registration.googleCalendarEventId = null;
            registration.googleCalendarEventLink = null;
            registration.calendarEventCreated = false;
            await registration.save();
          }
        } else if (status === 'confirmed') {
          // Update event to confirmed status
          eventUpdate = {
            summary: `✅ Confirmed Workshop: ${registration.workshopName}`,
            colorId: '10' // Green color for confirmed
          };
          await googleCalendarService.updateWorkshopEvent(registration.googleCalendarEventId, eventUpdate);
        } else if (status === 'completed') {
          // Update event to completed status
          eventUpdate = {
            summary: `✅ Completed Workshop: ${registration.workshopName}`,
            colorId: '8' // Gray color for completed
          };
          await googleCalendarService.updateWorkshopEvent(registration.googleCalendarEventId, eventUpdate);
        }
      } catch (calendarError) {
        console.error('❌ Error updating calendar event (non-critical):', calendarError);
      }
    }

    // Send email notification to participant
    try {
      const emailService = require('../../services/emailService');
      
      if (registration.participantEmail) {
        console.log('📧 Sending workshop status email to:', registration.participantEmail);
        const emailResult = await emailService.sendWorkshopStatusEmail(
          registration.participantEmail,
          registration,
          status,
          adminNotes
        );
        
        if (emailResult.success) {
          console.log('✅ Workshop status email sent successfully');
        } else {
          console.error('❌ Failed to send workshop status email:', emailResult.error);
        }
      } else {
        console.log('⚠️ No participant email found for registration:', registrationId);
      }
    } catch (emailError) {
      console.error('❌ Error sending workshop status email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({ 
      success: true, 
      registration: {
        id: registration._id,
        status: registration.status,
        calendarEventCreated: registration.calendarEventCreated,
        calendarEventLink: registration.googleCalendarEventLink
      }
    });
  } catch (error) {
    console.error('Error updating workshop registration status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update registration status' 
    });
  }
});

module.exports = router;