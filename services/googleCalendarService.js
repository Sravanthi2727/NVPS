/**
 * Google Calendar Service
 * Handles Google Calendar API integration for workshop events
 */

const { google } = require('googleapis');

class GoogleCalendarService {
  constructor() {
    this.calendar = null;
    this.initializeCalendar();
  }

  initializeCalendar() {
    try {
      console.log('🔧 Initializing Google Calendar service...');
      console.log('Service account key file path:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE);
      
      // Check if service account key file exists
      const fs = require('fs');
      const path = require('path');
      
      const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
      if (!keyFilePath) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_FILE not set in environment variables');
      }
      
      const fullPath = path.resolve(keyFilePath);
      console.log('Full path to service account key:', fullPath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Service account key file not found at: ${fullPath}`);
      }
      
      // Read and validate the service account key
      const keyFileContent = fs.readFileSync(fullPath, 'utf8');
      const serviceAccountKey = JSON.parse(keyFileContent);
      
      if (!serviceAccountKey.private_key || !serviceAccountKey.client_email) {
        throw new Error('Invalid service account key: missing private_key or client_email');
      }
      
      console.log('✅ Service account key loaded successfully');
      console.log('Client email:', serviceAccountKey.client_email);
      
      // Initialize Google Calendar API with service account
      const auth = new google.auth.GoogleAuth({
        keyFile: fullPath,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({
        version: 'v3',
        auth: auth
      });

      console.log('✅ Google Calendar service initialized with service account');
    } catch (error) {
      console.error('❌ Error initializing Google Calendar service:', error.message);
      
      // Fallback: Try with API key for read-only operations
      if (process.env.GOOGLE_CALENDAR_API_KEY) {
        try {
          console.log('🔄 Trying fallback with API key...');
          this.calendar = google.calendar({
            version: 'v3',
            auth: process.env.GOOGLE_CALENDAR_API_KEY
          });
          console.log('⚠️ Google Calendar service initialized with API key (limited functionality)');
        } catch (apiKeyError) {
          console.error('❌ API key fallback also failed:', apiKeyError.message);
          this.calendar = null;
        }
      } else {
        console.error('❌ No API key available for fallback');
        this.calendar = null;
      }
    }
  }

  /**
   * Create a calendar event for workshop registration
   * @param {Object} workshopData - Workshop details
   * @param {Object} participantData - Participant details
   * @returns {Promise<Object>} - Created event details
   */
  async createWorkshopEvent(workshopData, participantData) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar service not initialized');
      }

      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      
      // Calculate event end time (assuming 2 hours duration if not specified)
      const startTime = new Date(workshopData.workshopDate);
      const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later

      const event = {
        summary: `Workshop: ${workshopData.workshopName}`,
        description: `
Workshop Registration Details:
- Participant: ${participantData.participantName}
- Email: ${participantData.participantEmail}
- Phone: ${participantData.participantPhone}
- Registration ID: ${participantData.registrationId || 'N/A'}

Workshop Description: ${workshopData.description || 'No description available'}

Organized by Rabuste Coffee
        `.trim(),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        location: 'Rabuste Coffee, India',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        colorId: '2', // Green color for workshops
        source: {
          title: 'Rabuste Coffee Workshop',
          url: 'https://rabustecoffee.com/workshops'
        }
      };

      console.log('📅 Creating Google Calendar event:', {
        workshop: workshopData.workshopName,
        participant: participantData.participantName,
        date: startTime.toISOString(),
        calendarId: calendarId
      });

      const response = await this.calendar.events.insert({
        calendarId: calendarId,
        resource: event,
        sendUpdates: 'none' // Don't send email notifications since we can't invite attendees
      });

      console.log('✅ Google Calendar event created:', response.data.id);

      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        event: response.data
      };

    } catch (error) {
      console.error('❌ Error creating Google Calendar event:', error);
      
      // Return detailed error information
      let errorMessage = error.message;
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        eventId: null,
        eventLink: null
      };
    }
  }

  /**
   * Update an existing calendar event
   * @param {string} eventId - Google Calendar event ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated event details
   */
  async updateWorkshopEvent(eventId, updateData) {
    try {
      if (!this.calendar || !eventId) {
        throw new Error('Calendar service not initialized or event ID missing');
      }

      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      console.log('📅 Updating Google Calendar event:', eventId);

      const response = await this.calendar.events.patch({
        calendarId: calendarId,
        eventId: eventId,
        resource: updateData,
        sendUpdates: 'all'
      });

      console.log('✅ Google Calendar event updated:', eventId);

      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        event: response.data
      };

    } catch (error) {
      console.error('❌ Error updating Google Calendar event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a calendar event
   * @param {string} eventId - Google Calendar event ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteWorkshopEvent(eventId) {
    try {
      if (!this.calendar || !eventId) {
        throw new Error('Calendar service not initialized or event ID missing');
      }

      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      console.log('📅 Deleting Google Calendar event:', eventId);

      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
        sendUpdates: 'all'
      });

      console.log('✅ Google Calendar event deleted:', eventId);

      return {
        success: true,
        message: 'Event deleted successfully'
      };

    } catch (error) {
      console.error('❌ Error deleting Google Calendar event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get calendar events for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - List of events
   */
  async getWorkshopEvents(startDate, endDate) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar service not initialized');
      }

      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        q: 'Workshop:' // Filter for workshop events
      });

      return {
        success: true,
        events: response.data.items || []
      };

    } catch (error) {
      console.error('❌ Error fetching Google Calendar events:', error);
      return {
        success: false,
        error: error.message,
        events: []
      };
    }
  }
}

// Export singleton instance
module.exports = new GoogleCalendarService();