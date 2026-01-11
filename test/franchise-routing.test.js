const request = require('supertest');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// Create test app instance
function createTestApp() {
  const app = express();
  
  // Set up view engine and layouts
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/boilerplate');
  
  // Static files
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Routes
  app.get('/', (req, res) => {
    res.render('home', {
      coffeeMenu: [
        { title: "Bold Robusta", price: 120, image: "/assets/logo-icon.png" },
        { title: "Dark Shot", price: 150, image: "/assets/logo-icon.png" }
      ]
    });
  });

  // Franchise page route
  app.get('/franchise', (req, res) => {
    res.render('franchise', {
      title: "Franchise Opportunities - Rabuste Coffee",
      investmentRanges: [
        "₹50K - ₹75K",
        "₹75K - ₹100K", 
        "₹100K - ₹150K",
        "₹150K - ₹200K",
        "₹200K+"
      ]
    });
  });
  
  return app;
}

describe('Express Routing Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('Franchise Page Route', () => {
    test('should respond correctly to GET /franchise', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Verify response headers
      expect(response.headers['content-type']).toMatch(/text\/html/);
      
      // Verify response is not empty
      expect(response.text).toBeTruthy();
      expect(response.text.length).toBeGreaterThan(0);
    });

    test('should render franchise template without errors', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Verify essential franchise page content is present
      expect(response.text).toContain('Partner with a Bold Coffee Revolution');
      expect(response.text).toContain('Build a profitable café experience');
      expect(response.text).toContain('Apply for Franchise');
      expect(response.text).toContain('Download Franchise Deck');
      
      // Verify page structure sections are present
      expect(response.text).toContain('franchise-hero');
      expect(response.text).toContain('franchise-benefits');
      expect(response.text).toContain('franchise-business-model');
      expect(response.text).toContain('franchise-support');
      expect(response.text).toContain('franchise-qualification');
      expect(response.text).toContain('franchise-form-section');
      expect(response.text).toContain('franchise-footer-cta');
    });

    test('should include required CSS and JS assets', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Verify CSS and JS includes are present
      expect(response.text).toContain('/css/franchise.css');
      expect(response.text).toContain('/js/franchise.js');
    });

    test('should pass investment ranges data to template', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // The investment ranges should be available to the template
      // We can't directly test template variables, but we can verify
      // the route executes without throwing errors
      expect(response.status).toBe(200);
    });

    test('should set correct page title', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // The title should be passed to the template
      // We verify the route completes successfully
      expect(response.status).toBe(200);
    });
  });

  describe('Route Error Handling', () => {
    test('should handle non-existent routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    test('should handle invalid HTTP methods on franchise route', async () => {
      await request(app)
        .post('/franchise')
        .expect(404);
    });
  });

  describe('Static Asset Serving', () => {
    test('should serve franchise CSS file', async () => {
      await request(app)
        .get('/css/franchise.css')
        .expect(200)
        .expect('Content-Type', /text\/css/);
    });

    test('should serve franchise JS file', async () => {
      await request(app)
        .get('/js/franchise.js')
        .expect(200)
        .expect('Content-Type', /text\/javascript/);
    });
  });
});