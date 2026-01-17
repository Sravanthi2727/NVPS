// Simple test to verify analytics functionality
const http = require('http');

// Test the analytics page
function testAnalyticsPage() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/admin/analytics',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`Analytics Page Status: