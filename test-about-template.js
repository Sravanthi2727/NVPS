const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

// Test about route with error handling
app.get("/about", (req, res) => {
  console.log("About route hit!");
  try {
    res.render("about", {
      title: "About Us - Rabuste Coffee Franchise",
      description: "Learn about Rabuste Coffee franchise benefits, business model, brand support, and partner qualifications.",
      keywords: "about rabuste coffee, franchise benefits, business model, brand support, partner qualifications"
    });
    console.log("About template rendered successfully");
  } catch (error) {
    console.error("Error rendering about template:", error);
    res.status(500).send("Template rendering error: " + error.message);
  }
});

// Test route to verify server is working
app.get("/test", (req, res) => {
  res.send("Test route working!");
});

app.listen(3001, () => {
  console.log("Test server running on port 3001");
  
  // Test the route
  const http = require('http');
  setTimeout(() => {
    console.log("Testing about route...");
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/about',
      method: 'GET'
    }, (res) => {
      console.log('About route status:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ About route working! Response length:', data.length);
        } else {
          console.log('❌ About route failed. Response:', data);
        }
        process.exit(0);
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request error:', err.message);
      process.exit(1);
    });
    
    req.end();
  }, 1000);
});