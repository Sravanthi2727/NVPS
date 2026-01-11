const request = require('supertest');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// Create test app instance for integration testing
function createTestApp() {
  const app = express();
  
  // Set up view engine and layouts
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/boilerplate');
  
  // Static files
  app.use(express.static(path.join(__dirname, '../public')));
  
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

describe('Franchise Page Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('Express Routing Integration Tests', () => {
    test('should render franchise page successfully', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that the page renders without errors
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Rabuste Coffee');
      expect(response.text).toContain('franchise');
    });

    test('should include all required sections', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that all major sections are present
      expect(response.text).toContain('franchise-hero');
      expect(response.text).toContain('franchise-benefits');
      expect(response.text).toContain('franchise-business-model');
      expect(response.text).toContain('franchise-support');
      expect(response.text).toContain('franchise-qualification');
      expect(response.text).toContain('franchise-form');
    });

    test('should include required CSS and JS files', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that required assets are included
      expect(response.text).toContain('/css/franchise.css');
      expect(response.text).toContain('/js/franchise.js');
    });
  });
});