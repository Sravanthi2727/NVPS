/**
 * Fix existing workshop registrations by retrying calendar sync
 */

require('dotenv').config();
const mongoose = require('mongoose');
const googleCalendarService = require('../services/googleCalendarService');

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function fixWorkshopCalendarSync() {
  console.log('🔧 Fixing existing workshop calendar sync...\n');

  try {
    // Import models
    const WorkshopRegistration = require('../models/WorkshopRegistration');
    const Workshop = require('../models/Workshop');

    // Find all registrations that don't have calendar events created
    const registrationsToFix = await WorkshopRegistration.find({
      $or: [
        { calendarEventCreated: { $ne: true } },
        { calendarEventCreated: { $exists: false } },
        { googleCalendarEventId: { $exists: false } }
      ]
    }).populate('workshopId');

    console.log(`Found ${registrationsToFix.length} registrations that need calendar sync\n`);

    if (registrationsToFix.length === 0) {
      console.log('✅ All workshop registrations already have calendar events!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const registration of registrationsToFix) {
      console.log(`📅 Processing registration: ${registration._id}`);
      console.log(`   Workshop: ${registration.workshopName}`);
      console.log(`   Participant: ${registration.participantName}`);
      console.log(`   Date: ${registration.workshopDate}`);

      try {
        // Prepare workshop data
        const workshopData = {
          workshopName: registration.workshopName,
          workshopDate: registration.workshopDate,
          description: registration.workshopId ? registration.workshopId.description : `Workshop: ${registration.workshopName}`
        };

        // Prepare participant data
        const participantData = {
          registrationId: registration._id,
          participantName: registration.participantName,
          participantEmail: registration.participantEmail,
          participantPhone: registration.participantPhone
        };

        // Create calendar event
        const calendarResult = await googleCalendarService.createWorkshopEvent(workshopData, participantData);

        if (calendarResult.success) {
          // Update registration with calendar event details
          registration.googleCalendarEventId = calendarResult.eventId;
          registration.googleCalendarEventLink = calendarResult.eventLink;
          registration.calendarEventCreated = true;
          registration.calendarEventError = null; // Clear any previous errors
          
          await registration.save();
          
          console.log(`   ✅ Calendar event created: ${calendarResult.eventId}`);
          console.log(`   🔗 Event link: ${calendarResult.eventLink}`);
          successCount++;
        } else {
          // Update registration with error details
          registration.calendarEventError = calendarResult.error;
          registration.calendarEventCreated = false;
          
          await registration.save();
          
          console.log(`   ❌ Calendar event failed: ${calendarResult.error}`);
          errorCount++;
        }

      } catch (error) {
        console.error(`   ❌ Error processing registration ${registration._id}:`, error.message);
        
        // Update registration with error
        registration.calendarEventError = error.message;
        registration.calendarEventCreated = false;
        await registration.save();
        
        errorCount++;
      }

      console.log(''); // Empty line for readability
    }

    console.log('📊 Summary:');
    console.log(`   ✅ Successfully synced: ${successCount}`);
    console.log(`   ❌ Failed to sync: ${errorCount}`);
    console.log(`   📝 Total processed: ${registrationsToFix.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Calendar sync completed! Users can now see their calendar events in the dashboard.');
    }

    if (errorCount > 0) {
      console.log('\n⚠️ Some registrations failed to sync. Check the error messages above for details.');
      console.log('Common issues:');
      console.log('- Google Calendar API not properly configured');
      console.log('- Service account permissions not set correctly');
      console.log('- Network connectivity issues');
    }

  } catch (error) {
    console.error('❌ Error fixing workshop calendar sync:', error);
  }
}

async function main() {
  console.log('🚀 Workshop Calendar Sync Fix Tool');
  console.log('==================================\n');

  await connectDB();
  await fixWorkshopCalendarSync();
  
  console.log('\n✨ Process completed!');
  process.exit(0);
}

// Run the fix if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixWorkshopCalendarSync };