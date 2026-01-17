/**
 * Test script to verify payment flow
 */

const fetch = require('node-fetch');

async function testPaymentFlow() {
  try {
    console.log('🧪 Testing payment flow...');
    
    // Test if the API endpoint is accessible
    const response = await fetch('http://localhost:3000/api/orders/test-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test: true
      })
    });
    
    const result = await response.json();
    console.log('Test payment response:', result);
    
    if (result.success) {
      console.log('✅ Payment API is working');
    } else {
      console.log('❌ Payment API failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testPaymentFlow();
}

module.exports = { testPaymentFlow };