const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/debug/menu-items',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const result = JSON.parse(data);
      console.log('Menu items count:', result.items ? result.items.length : 0);
      if (result.items && result.items.length > 0) {
        console.log('First 3 items:');
        result.items.slice(0, 3).forEach(item => {
          console.log(`- ${item.name}: ${item.image || 'NO IMAGE'}`);
        });
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => console.error('Error:', error.message));
req.end();