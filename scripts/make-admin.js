/**
 * Script to make a user admin
 * Usage: node scripts/make-admin.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeUserAdmin(email) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    // Check current role
    console.log('📋 Current user details:');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Current Role:', user.role);
    console.log('- OAuth User:', user.isOAuthUser);

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User role updated successfully!');
    console.log('🔧 User is now an admin and can access admin panel');

  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

console.log('🔧 Making user admin:', email);
makeUserAdmin(email);