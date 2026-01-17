/**
 * Test script for admin user management
 */

const http = require('http');

async function testAdminUsers() {
  try {
    console.log('🧪 Testing admin user management...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response body:', data);
        
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            console.log('✅ Admin users API is working');
            console.log('Users found:', result.users ? result.users.length : 0);
          } catch (parseError) {
            console.log('⚠️ Response is not JSON:', data);
          }
        } else {
          console.log('❌ Admin users API failed:', res.statusCode);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAdminUsers();
}

module.exports = { testAdminUsers };