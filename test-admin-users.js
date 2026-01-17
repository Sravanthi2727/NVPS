/**
 * Test script for admin user management
 */

const fetch = require('node-fetch');

async function testAdminUsers() {
  try {
    console.log('🧪 Testing admin user management...');
    
    // Test if the API endpoint is accessible
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Admin users API is working');
        console.log('Users found:', result.users ? result.users.length : 0);
      } catch (parseError) {
        console.log('⚠️ Response is not JSON:', responseText);
      }
    } else {
      console.log('❌ Admin users API failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAdminUsers();
}

module.exports = { testAdminUsers };