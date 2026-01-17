/**
 * Test Menu API
 * Simple test to verify menu items are loading
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testMenuAPI() {
    try {
        console.log('🧪 Testing menu API...');
        
        // Test menu items endpoint
        const response = await fetch('http://localhost:3000/api/menu-items');
        const data = await response.json();
        
        console.log('📊 Menu API Response:');
        console.log('- Success:', data.success);
        console.log('- Items count:', data.items ? data.items.length : 0);
        
        if (data.items && data.items.length > 0) {
            console.log('- Sample items:');
            data.items.slice(0, 3).forEach(item => {
                console.log(`  * ${item.name} - ₹${item.price} (${item.category})`);
            });
        }
        
        // Test home page
        console.log('\n🏠 Testing home page...');
        const homeResponse = await fetch('http://localhost:3000/');
        console.log('- Home page status:', homeResponse.status);
        
        // Test menu page
        console.log('\n🍽️ Testing menu page...');
        const menuResponse = await fetch('http://localhost:3000/menu');
        console.log('- Menu page status:', menuResponse.status);
        
        // Test workshops page
        console.log('\n🎨 Testing workshops page...');
        const workshopsResponse = await fetch('http://localhost:3000/workshops');
        console.log('- Workshops page status:', workshopsResponse.status);
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testMenuAPI();