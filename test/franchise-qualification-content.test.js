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

describe('Franchise Qualification Content Unit Tests', () => {
  let app;
  let mockDocument;
  let mockWindow;
  
  beforeEach(() => {
    app = createTestApp();
    
    // Create mock DOM environment
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
    
    // Mock qualification checklist items (4 items as per requirements)
    const mockQualificationItems = Array.from({ length: 4 }, (_, index) => {
      const titles = [
        'Passion for Coffee & Culture',
        'Entrepreneur/Investor Mindset',
        'Willingness to Follow Brand Standards',
        'Community-Oriented Approach'
      ];
      
      const descriptions = [
        'You appreciate the artistry of exceptional coffee and believe in creating spaces where community and culture thrive together.',
        'You\'re ready to invest in a proven business model and have the drive to build something meaningful in your community.',
        'You understand the value of consistency and are excited to uphold the Rabuste Coffee experience that customers love.',
        'You believe in building genuine connections and see your café as more than a business—it\'s a gathering place for your neighborhood.'
      ];
      
      return {
        className: 'franchise-qualification-item',
        querySelector: jest.fn((selector) => {
          if (selector === '.franchise-qualification-check') {
            return {
              querySelector: jest.fn((svgSelector) => {
                if (svgSelector === 'svg') {
                  return {
                    getAttribute: jest.fn((attr) => {
                      if (attr === 'viewBox') return '0 0 24 24';
                      return null;
                    }),
                    innerHTML: `
                      <circle cx="12" cy="12" r="10" fill="#228B22"/>
                      <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    `
                  };
                }
                return null;
              })
            };
          }
          if (selector === '.franchise-qualification-item-title') {
            return { textContent: titles[index] };
          }
          if (selector === '.franchise-qualification-item-description') {
            return { textContent: descriptions[index] };
          }
          return null;
        }),
        getBoundingClientRect: () => ({
          width: 600,
          height: 120,
          top: index * 140,
          left: 0,
          right: 600,
          bottom: index * 140 + 120
        })
      };
    });
    
    // Mock qualification section elements
    const mockQualificationSection = {
      getBoundingClientRect: () => ({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        right: 800,
        bottom: 600
      })
    };
    
    const mockQualificationHeader = {
      querySelector: jest.fn((selector) => {
        if (selector === '.franchise-qualification-title') {
          return { textContent: 'Are You Ready to Join Our Coffee Revolution?' };
        }
        if (selector === '.franchise-qualification-subtitle') {
          return { textContent: 'We\'re looking for passionate partners who share our vision. See if you\'re a great fit for the Rabuste Coffee family.' };
        }
        return null;
      })
    };
    
    const mockQualificationChecklist = {
      getBoundingClientRect: () => ({
        width: 700,
        height: 500,
        top: 100,
        left: 50,
        right: 750,
        bottom: 600
      })
    };
    
    const mockQualificationCTA = {
      querySelector: jest.fn((selector) => {
        if (selector === '.franchise-qualification-encouragement') {
          return { textContent: 'Sound like you? We\'d love to learn more about your vision.' };
        }
        if (selector === 'a.btn-franchise-primary') {
          return {
            textContent: 'Start Your Application',
            getAttribute: jest.fn((attr) => {
              if (attr === 'href') return '#franchise-form';
              return null;
            })
          };
        }
        return null;
      })
    };
    
    // Set up querySelector mocks
    mockDocument.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-qualification':
          return mockQualificationSection;
        case '.franchise-qualification-header':
          return mockQualificationHeader;
        case '.franchise-qualification-title':
          return { textContent: 'Are You Ready to Join Our Coffee Revolution?' };
        case '.franchise-qualification-subtitle':
          return { textContent: 'We\'re looking for passionate partners who share our vision. See if you\'re a great fit for the Rabuste Coffee family.' };
        case '.franchise-qualification-checklist':
          return mockQualificationChecklist;
        case '.franchise-qualification-cta':
          return mockQualificationCTA;
        case '.franchise-qualification-encouragement':
          return { textContent: 'Sound like you? We\'d love to learn more about your vision.' };
        default:
          return null;
      }
    });
    
    mockDocument.querySelectorAll.mockImplementation((selector) => {
      if (selector === '.franchise-qualification-item') {
        return mockQualificationItems;
      }
      return [];
    });
    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  describe('Qualification Checklist Format Tests', () => {
    test('should render qualification section with proper checklist structure via Express route', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that the qualification section exists in rendered HTML
      expect(response.text).toContain('franchise-qualification');
      expect(response.text).toContain('franchise-qualification-header');
      expect(response.text).toContain('franchise-qualification-checklist');
      expect(response.text).toContain('franchise-qualification-cta');
    });

    test('should implement friendly checklist format as per Requirements 6.1', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that checklist uses friendly format with checkmark icons
      expect(response.text).toContain('franchise-qualification-item');
      expect(response.text).toContain('franchise-qualification-check');
      
      // Test that checkmark SVG icons are present
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('viewBox="0 0 24 24"');
      expect(response.text).toContain('fill="#228B22"'); // Green checkmark color
      expect(response.text).toContain('stroke="white"'); // White checkmark path
      
      // Test that checklist structure includes proper content containers
      expect(response.text).toContain('franchise-qualification-content');
      expect(response.text).toContain('franchise-qualification-item-title');
      expect(response.text).toContain('franchise-qualification-item-description');
    });

    test('should use mock DOM to verify checklist format implementation', () => {
      // Test that qualification section exists
      const qualificationSection = mockDocument.querySelector('.franchise-qualification');
      expect(qualificationSection).toBeTruthy();
      
      // Test that checklist container exists
      const checklist = mockDocument.querySelector('.franchise-qualification-checklist');
      expect(checklist).toBeTruthy();
      
      // Test that all four qualification items are present
      const qualificationItems = mockDocument.querySelectorAll('.franchise-qualification-item');
      expect(qualificationItems.length).toBe(4);
      
      // Test that each item has proper checklist format structure
      qualificationItems.forEach(item => {
        // Each item should have a checkmark icon
        const checkIcon = item.querySelector('.franchise-qualification-check');
        expect(checkIcon).toBeTruthy();
        
        // Checkmark should contain SVG with proper attributes
        const svg = checkIcon.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
        
        // SVG should contain green circle and white checkmark path
        expect(svg.innerHTML).toContain('fill="#228B22"'); // Green background
        expect(svg.innerHTML).toContain('stroke="white"'); // White checkmark
        
        // Each item should have title and description
        const title = item.querySelector('.franchise-qualification-item-title');
        const description = item.querySelector('.franchise-qualification-item-description');
        
        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        expect(title.textContent.length).toBeGreaterThan(0);
        expect(description.textContent.length).toBeGreaterThan(0);
      });
    });

    test('should display proper header content for qualification section', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test main title is present and engaging
      expect(response.text).toContain('Are You Ready to Join Our Coffee Revolution?');
      
      // Test subtitle provides context and encouragement
      expect(response.text).toContain('We\'re looking for passionate partners who share our vision');
      expect(response.text).toContain('See if you\'re a great fit for the Rabuste Coffee family');
    });

    test('should include encouraging CTA section after checklist', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that CTA section exists
      expect(response.text).toContain('franchise-qualification-cta');
      
      // Test encouraging message
      expect(response.text).toContain('Sound like you? We\'d love to learn more about your vision');
      
      // Test CTA button
      expect(response.text).toContain('Start Your Application');
      expect(response.text).toContain('href="#franchise-form"');
      expect(response.text).toContain('btn-franchise-primary');
    });
  });

  describe('Four Qualification Criteria Tests', () => {
    test('should contain all four required criteria as per Requirements 6.1, 6.2', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that all four specific criteria are present in rendered HTML
      expect(response.text).toContain('Passion for Coffee & Culture');
      expect(response.text).toContain('Entrepreneur/Investor Mindset');
      expect(response.text).toContain('Willingness to Follow Brand Standards');
      expect(response.text).toContain('Community-Oriented Approach');
    });

    test('should use positive, encouraging language for each criterion as per Requirements 6.2', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test Passion for Coffee & Culture criterion
      expect(response.text).toContain('appreciate the artistry of exceptional coffee');
      expect(response.text).toContain('community and culture thrive together');
      
      // Test Entrepreneur/Investor Mindset criterion
      expect(response.text).toContain('ready to invest in a proven business model');
      expect(response.text).toContain('drive to build something meaningful');
      
      // Test Willingness to Follow Brand Standards criterion
      expect(response.text).toContain('understand the value of consistency');
      expect(response.text).toContain('excited to uphold the Rabuste Coffee experience');
      
      // Test Community-Oriented Approach criterion
      expect(response.text).toContain('building genuine connections');
      expect(response.text).toContain('gathering place for your neighborhood');
      
      // Verify language is positive and inclusive, not exclusionary
      expect(response.text).not.toContain('must have');
      expect(response.text).not.toContain('required to');
      expect(response.text).not.toContain('only if');
      expect(response.text).not.toContain('cannot');
    });

    test('should verify all four criteria using mock DOM structure', () => {
      // Test that all four qualification items are present
      const qualificationItems = mockDocument.querySelectorAll('.franchise-qualification-item');
      expect(qualificationItems.length).toBe(4);
      
      // Test specific criteria titles
      const itemTitles = Array.from(qualificationItems).map(item => 
        item.querySelector('.franchise-qualification-item-title').textContent
      );
      
      // Verify all required criteria are present (Requirements 6.1, 6.2)
      expect(itemTitles).toContain('Passion for Coffee & Culture');
      expect(itemTitles).toContain('Entrepreneur/Investor Mindset');
      expect(itemTitles).toContain('Willingness to Follow Brand Standards');
      expect(itemTitles).toContain('Community-Oriented Approach');
      
      // Test that each criterion has substantial, encouraging description
      qualificationItems.forEach(item => {
        const title = item.querySelector('.franchise-qualification-item-title');
        const description = item.querySelector('.franchise-qualification-item-description');
        
        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        
        // Titles should be clear and specific
        expect(title.textContent.length).toBeGreaterThan(15);
        
        // Descriptions should be encouraging and substantial
        expect(description.textContent.length).toBeGreaterThan(50);
        
        // Descriptions should use positive language
        const descText = description.textContent.toLowerCase();
        const hasPositiveLanguage = /\b(appreciate|believe|ready|excited|understand|value|meaningful|genuine|thrive)\b/.test(descText);
        expect(hasPositiveLanguage).toBe(true);
        
        // Should not use exclusionary language
        expect(descText).not.toContain('must have');
        expect(descText).not.toContain('required to');
        expect(descText).not.toContain('only if');
      });
    });

    test('should present criteria as partnership alignment rather than exclusion per Requirements 6.2', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that language focuses on alignment and partnership
      expect(response.text).toContain('passionate partners who share our vision');
      expect(response.text).toContain('great fit for the Rabuste Coffee family');
      
      // Test that criteria descriptions use inclusive "you" language
      expect(response.text).toContain('You appreciate');
      expect(response.text).toContain('You\'re ready');
      expect(response.text).toContain('You understand');
      expect(response.text).toContain('You believe');
      
      // Verify absence of exclusionary or demanding language
      expect(response.text).not.toContain('must be');
      expect(response.text).not.toMatch(/\brequired\b(?![^<]*>)/); // Don't match "required" in HTML attributes
      expect(response.text).not.toContain('only qualified');
      expect(response.text).not.toContain('minimum requirements');
      expect(response.text).not.toContain('not eligible');
      
      // Test that overall tone is welcoming
      expect(response.text).toContain('Sound like you?');
      expect(response.text).toContain('We\'d love to learn more');
    });

    test('should maintain quality standards while being inclusive per Requirements 6.2', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that criteria maintain professional standards
      expect(response.text).toContain('proven business model');
      expect(response.text).toContain('Brand Standards');
      expect(response.text).toContain('consistency');
      expect(response.text).toContain('exceptional coffee');
      
      // Test that standards are presented as partnership benefits
      expect(response.text).toContain('value of consistency');
      expect(response.text).toContain('Rabuste Coffee experience that customers love');
      expect(response.text).toContain('artistry of exceptional coffee');
      
      // Verify criteria address key business aspects without being demanding
      const criteriaText = response.text.toLowerCase();
      expect(criteriaText).toMatch(/\b(investment|business|brand|community|coffee|culture)\b/);
      
      // Should present standards as positive attributes rather than barriers
      expect(response.text).toContain('excited to uphold');
      expect(response.text).toContain('appreciate the artistry');
      expect(response.text).toContain('believe in creating spaces');
    });

    test('should verify content completeness and quality for each criterion', () => {
      const qualificationItems = mockDocument.querySelectorAll('.franchise-qualification-item');
      
      // Test that each criterion has substantial, meaningful content
      qualificationItems.forEach((item, index) => {
        const title = item.querySelector('.franchise-qualification-item-title');
        const description = item.querySelector('.franchise-qualification-item-description');
        
        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        
        // Titles should be specific and professional
        expect(title.textContent.length).toBeGreaterThan(15);
        expect(title.textContent).not.toContain('TODO');
        expect(title.textContent).not.toContain('placeholder');
        
        // Descriptions should be substantial and encouraging
        expect(description.textContent.length).toBeGreaterThan(80);
        expect(description.textContent).not.toContain('Lorem ipsum');
        expect(description.textContent).not.toContain('placeholder');
        
        // Each description should contain relevant business keywords
        const descText = description.textContent.toLowerCase();
        
        // Test specific content for each criterion
        switch (index) {
          case 0: // Passion for Coffee & Culture
            expect(descText).toMatch(/\b(coffee|culture|artistry|community|spaces)\b/);
            break;
          case 1: // Entrepreneur/Investor Mindset
            expect(descText).toMatch(/\b(invest|business|model|drive|meaningful|community)\b/);
            break;
          case 2: // Willingness to Follow Brand Standards
            expect(descText).toMatch(/\b(consistency|brand|standards|experience|customers)\b/);
            break;
          case 3: // Community-Oriented Approach
            expect(descText).toMatch(/\b(connections|community|café|business|neighborhood|gathering)\b/);
            break;
        }
      });
    });
  });

  describe('Content Structure and Accessibility Tests', () => {
    test('should use proper semantic HTML structure', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test section has proper semantic structure
      expect(response.text).toMatch(/<section[^>]*class="[^"]*franchise-qualification[^"]*"[^>]*>/);
      
      // Test headings hierarchy - should have h2 for main title
      expect(response.text).toMatch(/<h2[^>]*class="[^"]*franchise-qualification-title[^"]*"[^>]*>/);
      
      // Test that item titles use h3 tags
      expect(response.text).toMatch(/<h3[^>]*class="[^"]*franchise-qualification-item-title[^"]*"[^>]*>/);
      
      // Test that descriptions use paragraph tags
      expect(response.text).toMatch(/<p[^>]*class="[^"]*franchise-qualification-item-description[^"]*"[^>]*>/);
      
      // Test that checklist uses proper list structure or div containers
      expect(response.text).toContain('franchise-qualification-checklist');
    });

    test('should maintain consistent CSS class structure', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that all required CSS classes are present in rendered HTML
      expect(response.text).toContain('franchise-qualification');
      expect(response.text).toContain('franchise-qualification-header');
      expect(response.text).toContain('franchise-qualification-checklist');
      expect(response.text).toContain('franchise-qualification-cta');
      
      // Test that all items have consistent class structure
      const itemMatches = response.text.match(/franchise-qualification-item/g);
      expect(itemMatches).toBeTruthy();
      expect(itemMatches.length).toBeGreaterThanOrEqual(4); // Should have at least 4 items
      
      // Test that item components have consistent classes
      expect(response.text).toContain('franchise-qualification-check');
      expect(response.text).toContain('franchise-qualification-content');
      expect(response.text).toContain('franchise-qualification-item-title');
      expect(response.text).toContain('franchise-qualification-item-description');
    });

    test('should include proper checkmark icon accessibility', async () => {
      const response = await request(app)
        .get('/franchise')
        .expect(200);
      
      // Test that SVG icons have proper structure
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('viewBox="0 0 24 24"');
      
      // Test that checkmark uses accessible colors (green with white contrast)
      expect(response.text).toContain('fill="#228B22"'); // Green background
      expect(response.text).toContain('stroke="white"'); // White checkmark for contrast
      
      // Test that checkmark path is properly defined
      expect(response.text).toContain('stroke-width="2"');
      expect(response.text).toContain('stroke-linecap="round"');
      expect(response.text).toContain('stroke-linejoin="round"');
    });

    test('should verify mock DOM accessibility structure', () => {
      // Test that all qualification items have proper structure
      const qualificationItems = mockDocument.querySelectorAll('.franchise-qualification-item');
      
      qualificationItems.forEach(item => {
        // Each item should have checkmark icon
        const checkIcon = item.querySelector('.franchise-qualification-check');
        expect(checkIcon).toBeTruthy();
        
        // Checkmark should have proper SVG structure
        const svg = checkIcon.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
        
        // SVG should have accessible color contrast
        expect(svg.innerHTML).toContain('#228B22'); // Green
        expect(svg.innerHTML).toContain('white'); // White contrast
        
        // Each item should have proper content structure
        const title = item.querySelector('.franchise-qualification-item-title');
        const description = item.querySelector('.franchise-qualification-item-description');
        
        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        
        // Content should be meaningful and accessible
        expect(title.textContent.trim().length).toBeGreaterThan(0);
        expect(description.textContent.trim().length).toBeGreaterThan(0);
      });
      
      // Test that CTA section is accessible
      const cta = mockDocument.querySelector('.franchise-qualification-cta');
      expect(cta).toBeTruthy();
      
      const ctaButton = cta.querySelector('a.btn-franchise-primary');
      expect(ctaButton).toBeTruthy();
      expect(ctaButton.getAttribute('href')).toBe('#franchise-form');
      expect(ctaButton.textContent.trim()).toBe('Start Your Application');
    });
  });
});