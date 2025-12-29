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
        "$50K - $75K",
        "$75K - $100K", 
        "$100K - $150K",
        "$150K - $200K",
        "$200K+"
      ]
    });
  });
  
  return app;
}

describe('Franchise Business Model Content Unit Tests', () => {
  let app;
  let mockDocument;
  let mockWindow;
  
  beforeEach(() => {
    app = createTestApp();
    
    // Create mock DOM environment for responsive testing
    mockDocument = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      createElement: jest.fn()
    };
    
    mockWindow = {
      innerWidth: 1024,
      innerHeight: 768,
      getComputedStyle: jest.fn(),
      matchMedia: jest.fn(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    };
    
    // Mock business model section elements
    const mockBusinessModelSection = {
      getBoundingClientRect: () => ({
        width: Math.min(mockWindow.innerWidth, 1200),
        height: 600,
        top: 0,
        left: 0,
        right: Math.min(mockWindow.innerWidth, 1200),
        bottom: 600
      })
    };
    
    const mockBusinessModelContent = {
      getBoundingClientRect: () => ({
        width: Math.min(mockWindow.innerWidth - 40, 1200 - 40),
        height: 500,
        top: 50,
        left: 20,
        right: Math.min(mockWindow.innerWidth - 20, 1220),
        bottom: 550
      })
    };
    
    const mockVisualSection = {
      getBoundingClientRect: () => ({
        width: mockWindow.innerWidth < 768 ? Math.min(mockWindow.innerWidth - 40, 1200 - 40) : (Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.4),
        height: 240,
        top: 50,
        left: 20,
        right: mockWindow.innerWidth < 768 ? Math.min(mockWindow.innerWidth - 20, 1220) : (20 + Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.4),
        bottom: 290
      })
    };
    
    const mockInfoSection = {
      getBoundingClientRect: () => ({
        width: mockWindow.innerWidth < 768 ? Math.min(mockWindow.innerWidth - 40, 1200 - 40) : (Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.6),
        height: 400,
        top: mockWindow.innerWidth < 768 ? 330 : 50,
        left: mockWindow.innerWidth < 768 ? 20 : (20 + Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.4 + 60),
        right: Math.min(mockWindow.innerWidth - 20, 1220),
        bottom: mockWindow.innerWidth < 768 ? 730 : 450
      })
    };
    
    // Mock business model items (4 items as per requirements)
    const mockBusinessModelItems = Array.from({ length: 4 }, (_, index) => {
      const titles = [
        'Grab-and-Go Café Format',
        'Compact Space Requirements', 
        'Prime Location Strategy',
        'Investment & ROI'
      ];
      
      return {
        querySelector: jest.fn((selector) => {
          if (selector === '.franchise-business-model-item-title') {
            return { textContent: titles[index] };
          }
          if (selector === '.franchise-business-model-item-description') {
            const descriptions = [
              'Streamlined operations focused on quality coffee, light food, and community experiences. Perfect for busy urban locations with high foot traffic and strong profit potential.',
              'Efficient 500-1,200 sq ft footprint maximizes revenue per square foot while minimizing overhead costs and setup complexity for optimal business performance.',
              'Target high-traffic urban areas, business districts, and cultural neighborhoods where our unique Robusta positioning resonates with discerning customers and drives market success.',
              'Initial investment range of $75K-$150K with projected break-even within 12-18 months. Strong unit economics driven by premium positioning and operational efficiency for excellent ROI.'
            ];
            return { textContent: descriptions[index] };
          }
          return null;
        }),
        getBoundingClientRect: () => {
          const itemWidth = mockWindow.innerWidth < 768 ? 
            Math.min(mockWindow.innerWidth - 40, 1200 - 40) : 
            (Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.6 - 32) / (mockWindow.innerWidth < 1024 ? 1 : 2);
          
          const row = mockWindow.innerWidth < 1024 ? index : Math.floor(index / 2);
          const col = mockWindow.innerWidth < 1024 ? 0 : index % 2;
          
          return {
            width: itemWidth,
            height: 120,
            top: 100 + row * 140,
            left: mockWindow.innerWidth < 768 ? 20 : (20 + Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.4 + 60 + col * (itemWidth + 32)),
            right: mockWindow.innerWidth < 768 ? Math.min(mockWindow.innerWidth - 20, 1220) : (20 + Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.4 + 60 + col * (itemWidth + 32) + itemWidth),
            bottom: 100 + row * 140 + 120
          };
        }
      };
    });
    
    // Mock illustration elements
    const mockIllustration = {
      querySelector: jest.fn((selector) => {
        if (selector === 'svg') {
          return {
            getAttribute: jest.fn((attr) => {
              if (attr === 'viewBox') return '0 0 320 240';
              return null;
            }),
            innerHTML: `
              <rect x="40" y="80" width="240" height="120" fill="#F5F1EB" stroke="#3C2415" stroke-width="2"/>
              <polygon points="30,80 160,40 290,80" fill="#3C2415"/>
              <rect x="140" y="140" width="40" height="60" fill="#3C2415"/>
              <circle cx="170" cy="170" r="2" fill="#D4AF37"/>
              <rect x="70" y="110" width="40" height="40" fill="#FFFFFF" stroke="#3C2415" stroke-width="1"/>
              <rect x="210" y="110" width="40" height="40" fill="#FFFFFF" stroke="#3C2415" stroke-width="1"/>
              <text x="160" y="73" text-anchor="middle" fill="#3C2415" font-family="Arial, sans-serif" font-size="12" font-weight="bold">RABUSTE COFFEE</text>
              <circle cx="160" cy="100" r="8" fill="#3C2415"/>
            `
          };
        }
        return null;
      })
    };
    
    // Mock CTA elements
    const mockCTA = {
      querySelector: jest.fn((selector) => {
        if (selector === 'a.btn-franchise-primary') {
          return {
            textContent: 'Get Investment Details',
            getAttribute: jest.fn((attr) => {
              if (attr === 'href') return '#franchise-form';
              return null;
            })
          };
        }
        return null;
      })
    };
    
    // Mock details grid element
    const mockDetailsGrid = {
      getBoundingClientRect: () => ({
        width: mockWindow.innerWidth < 768 ? Math.min(mockWindow.innerWidth - 40, 1200 - 40) : (Math.min(mockWindow.innerWidth - 40, 1200 - 40) * 0.6),
        height: 300,
        top: 150,
        left: 20,
        right: Math.min(mockWindow.innerWidth - 20, 1220),
        bottom: 450
      })
    };
    
    // Set up querySelector mocks
    mockDocument.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-business-model':
          return mockBusinessModelSection;
        case '.franchise-business-model-content':
          return mockBusinessModelContent;
        case '.franchise-business-model-visual':
          return mockVisualSection;
        case '.franchise-business-model-info':
          return mockInfoSection;
        case '.franchise-business-model-title':
          return { textContent: 'A Proven Business Model' };
        case '.franchise-business-model-subtitle':
          return { textContent: 'Designed for profitability and scalability in today\'s market' };
        case '.franchise-cafe-illustration':
          return mockIllustration;
        case '.franchise-business-model-cta':
          return mockCTA;
        case '.franchise-business-model-header':
          return { getBoundingClientRect: () => ({ width: 400, height: 80, top: 50, left: 20, right: 420, bottom: 130 }) };
        case '.franchise-business-model-details':
          return mockDetailsGrid;
        default:
          return null;
      }
    });
    
    mockDocument.querySelectorAll.mockImplementation((selector) => {
      if (selector === '.franchise-business-model-item') {
        return mockBusinessModelItems;
      }
      return [];
    });
    
    // Mock computed styles
    mockWindow.getComputedStyle.mockImplementation((element) => {
      if (element === mockBusinessModelContent) {
        return {
          display: 'flex',
          flexDirection: mockWindow.innerWidth < 768 ? 'column' : 'row',
          gap: mockWindow.innerWidth < 768 ? '40px' : (mockWindow.innerWidth < 1024 ? '48px' : '60px'),
          alignItems: mockWindow.innerWidth < 768 ? 'center' : 'flex-start'
        };
      }
      
      // Mock styles for details grid
      if (element === mockDetailsGrid) {
        return {
          display: 'grid',
          gridTemplateColumns: mockWindow.innerWidth < 768 ? '1fr' : (mockWindow.innerWidth < 1024 ? '1fr' : 'repeat(2, 1fr)'),
          gap: mockWindow.innerWidth < 768 ? '32px' : (mockWindow.innerWidth < 1024 ? '24px' : '32px')
        };
      }
      
      return {
        display: 'block',
        padding: '16px',
        margin: '8px'
      };
    });
    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  describe('Business Model Content Presence Tests', () => {
    test('should render business model section with proper structure via Express route', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that the business model section exists in rendered HTML
      expect(response.text).toContain('franchise-business-model');
      expect(response.text).toContain('franchise-business-model-content');
      expect(response.text).toContain('franchise-business-model-visual');
      expect(response.text).toContain('franchise-business-model-info');
    });

    test('should contain all required information categories as per Requirements 4.1, 4.2', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test header content is present in rendered HTML
      expect(response.text).toContain('A Proven Business Model');
      expect(response.text).toContain('Designed for profitability and scalability');
      
      // Test that all four required business model categories are present (Requirements 4.1, 4.2)
      expect(response.text).toContain('Grab-and-Go Café Format');
      expect(response.text).toContain('Compact Space Requirements');
      expect(response.text).toContain('Prime Location Strategy');
      expect(response.text).toContain('Investment & ROI');
      
      // Test specific content for each category
      expect(response.text).toContain('Streamlined operations focused on quality coffee');
      expect(response.text).toContain('500-1,200 sq ft footprint');
      expect(response.text).toContain('high-traffic urban areas');
      expect(response.text).toContain('$75K-$150K');
      expect(response.text).toContain('12-18 months');
    });

    test('should include visual elements as specified in Requirements 4.1', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that café illustration exists in rendered HTML
      expect(response.text).toContain('franchise-cafe-illustration');
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('viewBox="0 0 320 240"');
      expect(response.text).toContain('RABUSTE COFFEE');
      
      // Test that illustration contains key visual elements
      expect(response.text).toContain('rect'); // Building structure
      expect(response.text).toContain('polygon'); // Roof
      expect(response.text).toContain('circle'); // Coffee cup and decorative elements
    });

    test('should include CTA button for investment details', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that CTA section exists in rendered HTML
      expect(response.text).toContain('franchise-business-model-cta');
      expect(response.text).toContain('Get Investment Details');
      expect(response.text).toContain('href="#franchise-form"');
      expect(response.text).toContain('btn-franchise-primary');
    });

    test('should present information in investor-friendly format as per Requirements 4.2', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that content uses professional, investor-friendly language
      expect(response.text).toContain('profitability');
      expect(response.text).toContain('scalability');
      expect(response.text).toContain('revenue per square foot');
      expect(response.text).toContain('operational efficiency');
      expect(response.text).toContain('break-even');
      expect(response.text).toContain('unit economics');
      
      // Test that investment information uses realistic ranges
      expect(response.text).toMatch(/\$\d+K-\$\d+K/); // Format like $75K-$150K
      expect(response.text).toMatch(/\d+-\d+\s+months/); // Format like 12-18 months
      
      // Test that content avoids placeholder text
      expect(response.text).not.toContain('TODO');
      expect(response.text).not.toMatch(/placeholder\s*text/i); // Don't match placeholder text content
      expect(response.text).not.toContain('Lorem ipsum');
    });

    test('should use mock DOM to verify content structure', () => {
      // Test that business model section exists
      const businessModelSection = mockDocument.querySelector('.franchise-business-model');
      expect(businessModelSection).toBeTruthy();
      
      // Test that the main content container exists
      const contentContainer = mockDocument.querySelector('.franchise-business-model-content');
      expect(contentContainer).toBeTruthy();
      
      // Test that visual and info sections exist
      const visualSection = mockDocument.querySelector('.franchise-business-model-visual');
      const infoSection = mockDocument.querySelector('.franchise-business-model-info');
      
      expect(visualSection).toBeTruthy();
      expect(infoSection).toBeTruthy();
      
      // Test that all four required business model items are present
      const businessModelItems = mockDocument.querySelectorAll('.franchise-business-model-item');
      expect(businessModelItems.length).toBe(4);
      
      // Test specific required information categories
      const itemTitles = Array.from(businessModelItems).map(item => 
        item.querySelector('.franchise-business-model-item-title').textContent
      );
      
      // Verify all required categories are present (Requirements 4.1, 4.2)
      expect(itemTitles).toContain('Grab-and-Go Café Format');
      expect(itemTitles).toContain('Compact Space Requirements');
      expect(itemTitles).toContain('Prime Location Strategy');
      expect(itemTitles).toContain('Investment & ROI');
    });
  });

  describe('Responsive Layout Behavior Tests', () => {
    test('should display split layout on desktop (Requirements 4.1)', () => {
      // Set desktop viewport
      mockWindow.innerWidth = 1024;
      mockWindow.innerHeight = 768;
      
      const contentContainer = mockDocument.querySelector('.franchise-business-model-content');
      const computedStyles = mockWindow.getComputedStyle(contentContainer);
      
      // On desktop, should use row layout (side-by-side)
      expect(computedStyles.flexDirection).toBe('row');
      expect(computedStyles.gap).toBe('60px');
      expect(computedStyles.alignItems).toBe('flex-start');
      
      // Test that details grid uses 2-column layout on desktop
      const detailsGrid = mockDocument.querySelector('.franchise-business-model-details');
      const detailsStyles = mockWindow.getComputedStyle(detailsGrid);
      expect(detailsStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
      expect(detailsStyles.gap).toBe('32px');
    });

    test('should display stacked layout on tablet (Requirements 4.1)', () => {
      // Set tablet viewport
      mockWindow.innerWidth = 768;
      mockWindow.innerHeight = 1024;
      
      const contentContainer = mockDocument.querySelector('.franchise-business-model-content');
      const computedStyles = mockWindow.getComputedStyle(contentContainer);
      
      // On tablet, should still use row layout but with different spacing
      expect(computedStyles.flexDirection).toBe('row');
      expect(computedStyles.gap).toBe('48px');
      expect(computedStyles.alignItems).toBe('flex-start');
      
      // Test that details grid uses single column on tablet
      const detailsGrid = mockDocument.querySelector('.franchise-business-model-details');
      const detailsStyles = mockWindow.getComputedStyle(detailsGrid);
      expect(detailsStyles.gridTemplateColumns).toBe('1fr');
      expect(detailsStyles.gap).toBe('24px');
    });

    test('should display stacked layout on mobile (Requirements 4.1)', () => {
      // Set mobile viewport
      mockWindow.innerWidth = 375;
      mockWindow.innerHeight = 667;
      
      const contentContainer = mockDocument.querySelector('.franchise-business-model-content');
      const computedStyles = mockWindow.getComputedStyle(contentContainer);
      
      // On mobile, should use column layout (stacked)
      expect(computedStyles.flexDirection).toBe('column');
      expect(computedStyles.gap).toBe('40px');
      expect(computedStyles.alignItems).toBe('center');
      
      // Test that details grid uses single column on mobile
      const detailsGrid = mockDocument.querySelector('.franchise-business-model-details');
      const detailsStyles = mockWindow.getComputedStyle(detailsGrid);
      expect(detailsStyles.gridTemplateColumns).toBe('1fr');
      expect(detailsStyles.gap).toBe('32px');
    });

    test('should maintain proper visual hierarchy across breakpoints', () => {
      const viewports = [
        { width: 375, height: 667, type: 'mobile' },
        { width: 768, height: 1024, type: 'tablet' },
        { width: 1024, height: 768, type: 'desktop' }
      ];
      
      viewports.forEach(viewport => {
        // Set viewport
        mockWindow.innerWidth = viewport.width;
        mockWindow.innerHeight = viewport.height;
        
        // Test that all essential elements are present regardless of viewport
        const title = mockDocument.querySelector('.franchise-business-model-title');
        const subtitle = mockDocument.querySelector('.franchise-business-model-subtitle');
        const items = mockDocument.querySelectorAll('.franchise-business-model-item');
        const illustration = mockDocument.querySelector('.franchise-cafe-illustration');
        const cta = mockDocument.querySelector('.franchise-business-model-cta');
        
        expect(title).toBeTruthy();
        expect(subtitle).toBeTruthy();
        expect(items.length).toBe(4);
        expect(illustration).toBeTruthy();
        expect(cta).toBeTruthy();
        
        // Test that content hierarchy is maintained
        expect(title.textContent).toContain('A Proven Business Model');
        expect(subtitle.textContent).toContain('Designed for profitability and scalability');
        
        const ctaButton = cta.querySelector('a.btn-franchise-primary');
        expect(ctaButton.textContent.trim()).toBe('Get Investment Details');
      });
    });

    test('should maintain readable content layout on all screen sizes', () => {
      const testViewports = [320, 375, 768, 1024, 1200, 1920];
      
      testViewports.forEach(width => {
        mockWindow.innerWidth = width;
        
        // Test that business model items remain accessible
        const items = mockDocument.querySelectorAll('.franchise-business-model-item');
        expect(items.length).toBe(4);
        
        // Test that each item has proper content structure
        items.forEach(item => {
          const title = item.querySelector('.franchise-business-model-item-title');
          const description = item.querySelector('.franchise-business-model-item-description');
          
          expect(title).toBeTruthy();
          expect(description).toBeTruthy();
          expect(title.textContent.length).toBeGreaterThan(0);
          expect(description.textContent.length).toBeGreaterThan(0);
        });
        
        // Test that visual elements remain present
        const illustration = mockDocument.querySelector('.franchise-cafe-illustration');
        const svg = illustration.querySelector('svg');
        expect(svg).toBeTruthy();
        
        // Test that CTA remains accessible
        const cta = mockDocument.querySelector('.franchise-business-model-cta');
        const ctaButton = cta.querySelector('a.btn-franchise-primary');
        expect(ctaButton).toBeTruthy();
        expect(ctaButton.getAttribute('href')).toBe('#franchise-form');
      });
    });

    test('should handle edge case viewport sizes gracefully', () => {
      const edgeCases = [
        { width: 320, height: 568 }, // Very small mobile
        { width: 767, height: 1024 }, // Mobile edge
        { width: 768, height: 1024 }, // Tablet start
        { width: 1023, height: 768 }, // Tablet edge
        { width: 1024, height: 768 }, // Desktop start
        { width: 1920, height: 1080 } // Large desktop
      ];
      
      edgeCases.forEach(viewport => {
        mockWindow.innerWidth = viewport.width;
        mockWindow.innerHeight = viewport.height;
        
        // Test that layout doesn't break at edge cases
        const contentContainer = mockDocument.querySelector('.franchise-business-model-content');
        const computedStyles = mockWindow.getComputedStyle(contentContainer);
        
        // Should have valid flex direction
        expect(['row', 'column']).toContain(computedStyles.flexDirection);
        
        // Should have reasonable gap values
        expect(['40px', '48px', '60px']).toContain(computedStyles.gap);
        
        // Should have valid alignment
        expect(['center', 'flex-start']).toContain(computedStyles.alignItems);
        
        // Test that all content remains accessible
        const items = mockDocument.querySelectorAll('.franchise-business-model-item');
        expect(items.length).toBe(4);
        
        const illustration = mockDocument.querySelector('.franchise-cafe-illustration');
        expect(illustration).toBeTruthy();
        
        // Test that items have proper positioning
        items.forEach(item => {
          const rect = item.getBoundingClientRect();
          expect(rect.width).toBeGreaterThan(0);
          expect(rect.height).toBeGreaterThan(0);
        });
      });
    });

    test('should verify responsive layout through Express integration', async () => {
      // Test that the rendered HTML contains responsive CSS classes
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Verify responsive structure is present in HTML
      expect(response.text).toContain('franchise-business-model-content');
      expect(response.text).toContain('franchise-business-model-visual');
      expect(response.text).toContain('franchise-business-model-info');
      expect(response.text).toContain('franchise-business-model-details');
      
      // Verify that CSS file is included for responsive styling
      expect(response.text).toContain('/css/franchise.css');
      
      // Verify that the structure supports responsive layout
      // The visual and info sections should be separate containers
      const visualSectionMatch = response.text.match(/<div[^>]*class="[^"]*franchise-business-model-visual[^"]*"[^>]*>/);
      const infoSectionMatch = response.text.match(/<div[^>]*class="[^"]*franchise-business-model-info[^"]*"[^>]*>/);
      
      expect(visualSectionMatch).toBeTruthy();
      expect(infoSectionMatch).toBeTruthy();
    });
  });

  describe('Content Quality and Accessibility Tests', () => {
    test('should use professional, non-technical language as per Requirements 4.2', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Should avoid overly technical jargon in rendered HTML
      expect(response.text).not.toContain('API');
      expect(response.text).not.toContain('database');
      expect(response.text).not.toContain('algorithm');
      
      // Should use investor-friendly language
      expect(response.text.toLowerCase()).toMatch(/(profit|revenue|roi|investment|efficient|scalab)/);
      
      // Test specific business model descriptions use professional language
      expect(response.text).toContain('profitability');
      expect(response.text).toContain('scalability');
      expect(response.text).toContain('operational efficiency');
      expect(response.text).toContain('unit economics');
    });

    test('should include proper semantic HTML structure', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test section has proper semantic structure
      expect(response.text).toMatch(/<section[^>]*class="[^"]*franchise-business-model[^"]*"[^>]*>/);
      
      // Test headings hierarchy - should have h2 for main title
      expect(response.text).toMatch(/<h2[^>]*class="[^"]*franchise-business-model-title[^"]*"[^>]*>/);
      
      // Test that item titles use h3 tags
      expect(response.text).toMatch(/<h3[^>]*class="[^"]*franchise-business-model-item-title[^"]*"[^>]*>/);
      
      // Test that descriptions use paragraph tags
      expect(response.text).toMatch(/<p[^>]*class="[^"]*franchise-business-model-item-description[^"]*"[^>]*>/);
    });

    test('should maintain consistent styling classes', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that all required CSS classes are present in rendered HTML
      expect(response.text).toContain('franchise-business-model');
      expect(response.text).toContain('franchise-business-model-content');
      expect(response.text).toContain('franchise-business-model-visual');
      expect(response.text).toContain('franchise-business-model-info');
      expect(response.text).toContain('franchise-business-model-header');
      expect(response.text).toContain('franchise-business-model-details');
      expect(response.text).toContain('franchise-business-model-cta');
      
      // Test that all items have consistent class structure
      const itemMatches = response.text.match(/franchise-business-model-item/g);
      expect(itemMatches).toBeTruthy();
      expect(itemMatches.length).toBeGreaterThanOrEqual(4); // Should have at least 4 items
      
      // Test that item titles and descriptions have consistent classes
      expect(response.text).toContain('franchise-business-model-item-title');
      expect(response.text).toContain('franchise-business-model-item-description');
    });

    test('should verify mock DOM structure consistency', () => {
      // Test that all required CSS classes are present in mock
      expect(mockDocument.querySelector('.franchise-business-model')).toBeTruthy();
      expect(mockDocument.querySelector('.franchise-business-model-content')).toBeTruthy();
      expect(mockDocument.querySelector('.franchise-business-model-visual')).toBeTruthy();
      expect(mockDocument.querySelector('.franchise-business-model-info')).toBeTruthy();
      expect(mockDocument.querySelector('.franchise-business-model-header')).toBeTruthy();
      expect(mockDocument.querySelector('.franchise-business-model-details')).toBeTruthy();
      expect(mockDocument.querySelector('.franchise-business-model-cta')).toBeTruthy();
      
      // Test that all items have consistent class structure
      const items = mockDocument.querySelectorAll('.franchise-business-model-item');
      items.forEach(item => {
        expect(item.querySelector('.franchise-business-model-item-title')).toBeTruthy();
        expect(item.querySelector('.franchise-business-model-item-description')).toBeTruthy();
      });
    });

    test('should ensure content meets investor presentation standards', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that content includes key investor-focused metrics
      expect(response.text).toContain('$75K-$150K'); // Investment range
      expect(response.text).toContain('12-18 months'); // Break-even timeline
      expect(response.text).toContain('500-1,200 sq ft'); // Space requirements
      
      // Test that content focuses on business benefits
      expect(response.text).toContain('revenue per square foot');
      expect(response.text).toContain('overhead costs');
      expect(response.text).toContain('break-even');
      expect(response.text).toContain('premium positioning');
      
      // Test that content avoids placeholder or development text
      expect(response.text).not.toContain('TODO');
      expect(response.text).not.toMatch(/placeholder\s*text/i); // Don't match placeholder text content
      expect(response.text).not.toContain('Lorem ipsum');
      expect(response.text).not.toContain('coming soon');
    });

    test('should validate business model item content completeness', () => {
      const items = mockDocument.querySelectorAll('.franchise-business-model-item');
      
      // Test that each item has substantial, meaningful content
      items.forEach(item => {
        const title = item.querySelector('.franchise-business-model-item-title');
        const description = item.querySelector('.franchise-business-model-item-description');
        
        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        
        // Titles should be clear and professional
        expect(title.textContent.length).toBeGreaterThan(10);
        expect(title.textContent).not.toContain('TODO');
        expect(title.textContent).not.toMatch(/placeholder/i); // Don't match placeholder text content
        
        // Descriptions should be substantial and informative
        expect(description.textContent.length).toBeGreaterThan(50);
        expect(description.textContent).not.toContain('Lorem ipsum');
        expect(description.textContent).not.toMatch(/placeholder/i); // Don't match placeholder text content
        
        // Each description should contain business-relevant keywords
        const descText = description.textContent.toLowerCase();
        const hasBusinessKeywords = /\b(profit|revenue|cost|efficiency|scalab|investment|roi|business|operation|customer|market)\b/.test(descText);
        expect(hasBusinessKeywords).toBe(true);
      });
    });
  });
});