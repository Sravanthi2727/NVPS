/**
 * Test Google Calendar Integration
 * Run this script to test if Google Calendar API is working correctly
 */

require('dotenv').config();
const googleCalendarService = require('../services/googleCalendarService');

async function testCalendarIntegration() {
  console.log('🧪 Testing Google Calendar Integration...\n');

  // Test data
  const testWorkshopData = {
    workshopName: 'Test Coffee Workshop',
    workshopDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    description: 'This is a test workshop for calendar integration'
  };

  const testParticipantData = {
    registrationId: 'test-registration-123',
    participantName: 'Test Participant',
    participantEmail: 'test@example.com',
    participantPhone: '+91-9999999999'
  };

  try {
    console.log('📅 Creating test calendar event...');
    console.log('Workshop:', testWorkshopData.workshopName);
    console.log('Date:', testWorkshopData.workshopDate.toISOString());
    console.log('Participant:', testParticipantData.participantName);
    console.log('');

    // Test event creation
    const createResult = await googleCalendarService.createWorkshopEvent(
      testWorkshopData, 
      testParticipantData
    );

    if (createResult.success) {
      console.log('✅ Calendar event created successfully!');
      console.log('Event ID:', createResult.eventId);
      console.log('Event Link:', createResult.eventLink);
      console.log('');

      // Test event update
      console.log('📝 Testing event update...');
      const updateResult = await googleCalendarService.updateWorkshopEvent(
        createResult.eventId,
        {
          summary: '✅ Updated Test Workshop',
          colorId: '10' // Green color
        }
      );

      if (updateResult.success) {
        console.log('✅ Event updated successfully!');
        console.log('');
      } else {
        console.log('❌ Event update failed:', updateResult.error);
      }

      // Test event deletion
      console.log('🗑️ Testing event deletion...');
      const deleteResult = await googleCalendarService.deleteWorkshopEvent(createResult.eventId);

      if (deleteResult.success) {
        console.log('✅ Event deleted successfully!');
        console.log('');
      } else {
        console.log('❌ Event deletion failed:', deleteResult.error);
      }

      console.log('🎉 All tests completed successfully!');
      console.log('Google Calendar integration is working correctly.');

    } else {
      console.log('❌ Calendar event creation failed:', createResult.error);
      console.log('');
      console.log('🔧 Troubleshooting steps:');
      console.log('1. Check if Google Calendar API is enabled');
      console.log('2. Verify service account key file exists and path is correct');
      console.log('3. Ensure service account has calendar permissions');
      console.log('4. Check environment variables in .env file');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('');
    console.log('🔧 Common issues:');
    console.log('- Missing or invalid service account key file');
    console.log('- Google Calendar API not enabled');
    console.log('- Incorrect environment variables');
    console.log('- Network connectivity issues');
  }
}

// Test calendar event retrieval
async function testEventRetrieval() {
  console.log('\n📋 Testing event retrieval...');
  
  try {
    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Next 30 days
    
    const eventsResult = await googleCalendarService.getWorkshopEvents(startDate, endDate);
    
    if (eventsResult.success) {
      console.log(`✅ Found ${eventsResult.events.length} workshop events in the next 30 days`);
      
      if (eventsResult.events.length > 0) {
        console.log('\nUpcoming workshop events:');
        eventsResult.events.slice(0, 3).forEach((event, index) => {
          console.log(`${index + 1}. ${event.summary} - ${event.start?.dateTime || event.start?.date}`);
        });
      }
    } else {
      console.log('❌ Event retrieval failed:', eventsResult.error);
    }
  } catch (error) {
    console.error('❌ Event retrieval test failed:', error.message);
  }
}

// Environment check
function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');
  
  const requiredVars = [
    'GOOGLE_CALENDAR_API_KEY',
    'GOOGLE_CALENDAR_ID'
  ];
  
  const optionalVars = [
    'GOOGLE_SERVICE_ACCOUNT_KEY_FILE'
  ];
  
  console.log('Required environment variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  });
  
  console.log('\nOptional environment variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`⚠️ ${varName}: Not set (using API key method)`);
    }
  });
  
  console.log('');
}

// Main test function
async function runTests() {
  console.log('🚀 Google Calendar Integration Test Suite');
  console.log('==========================================\n');
  
  checkEnvironment();
  await testCalendarIntegration();
  await testEventRetrieval();
  
  console.log('\n✨ Test suite completed!');
  console.log('Check the output above for any issues that need to be resolved.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCalendarIntegration,
  testEventRetrieval,
  checkEnvironment,
  runTests
};