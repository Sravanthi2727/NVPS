const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = require('./config/database');
const Franchise = require('./models/Franchise');

async function checkFranchiseApplications() {
  try {
    await connectDB();
    console.log('Connected to database');
    
    const applications = await Franchise.find();
    console.log(`Found ${applications.length} franchise applications:`);
    
    applications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.fullName} (${app.email})`);
      console.log(`   City: ${app.city}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Submitted: ${app.submittedAt}`);
      console.log(`   User ID: ${app.userId || 'Not linked'}`);
      console.log('---');
    });
    
    if (applications.length === 0) {
      console.log('No franchise applications found in database');
      
      // Create a test application
      console.log('Creating test application...');
      const testApp = new Franchise({
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        city: 'Mumbai',
        investmentRange: '₹75K - ₹100K',
        expectedTimeline: '6-12 months',
        businessExperience: 'Test experience',
        status: 'pending'
      });
      
      await testApp.save();
      console.log('Test application created:', testApp._id);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkFranchiseApplications();