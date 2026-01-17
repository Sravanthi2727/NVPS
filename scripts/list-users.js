/**
 * Script to list all users and their roles
 * Usage: node scripts/list-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function listUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({})
      .select('name email role isOAuthUser createdAt')
      .sort({ createdAt: -1 });

    console.log('\n📋 All Users:');
    console.log('=' .repeat(80));

    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }

    users.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : 
                      user.role === 'staff' ? '👨‍💼' : '👤';
      const authType = user.isOAuthUser ? '🔗 Google' : '📧 Email';
      
      console.log(`${index + 1}. ${roleIcon} ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Role: ${user.role.toUpperCase()}`);
      console.log(`   ${authType} | Joined: ${user.createdAt.toLocaleDateString()}`);
      console.log('-'.repeat(60));
    });

    // Summary
    const adminCount = users.filter(u => u.role === 'admin').length;
    const staffCount = users.filter(u => u.role === 'staff').length;
    const customerCount = users.filter(u => u.role === 'customer').length;
    const oauthCount = users.filter(u => u.isOAuthUser).length;

    console.log('\n📊 Summary:');
    console.log(`👑 Admins: ${adminCount}`);
    console.log(`👨‍💼 Staff: ${staffCount}`);
    console.log(`👤 Customers: ${customerCount}`);
    console.log(`🔗 Google Users: ${oauthCount}`);
    console.log(`📧 Email Users: ${users.length - oauthCount}`);
    console.log(`📈 Total Users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

console.log('📋 Fetching all users...');
listUsers();