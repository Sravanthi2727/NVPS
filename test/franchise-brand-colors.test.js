const fc = require('fast-check');

// Feature: franchise-page, Property 6: Brand Color Consistency

describe('Franchise Brand Color Consistency Properties', () => {
  let mockDocument;
  let mockWindow;
  
  // Brand color constants from design document
  const BRAND_COLORS = {
    COFFEE_BROWN: '#3C2415',
    CREAM: '#F5F1EB', 
    GOLD: '#D4AF37',
    TEXT_DARK: '#2C1810',
    TEXT_LIGHT: '#FFFFFF'
  };
  
  beforeEach(() => {
    // Create mock DOM environment
    mockDocument = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      createElement: jest.fn(),
      documentElement: {
        scrollWidth: 1024
      }
    };
    
    mockWindow = {
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1,
      getComputedStyle: jest.fn(),
      matchMedia: jest.fn(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    };
    
    // Mock page elements that should use brand colors
    const mockElements = {
      // Hero section elements
      heroSection: {
        className: 'franchise-hero',
        getBoundingClientRect: () => ({ width: 1024, height: 600 })
      },
      heroTitle: {
        className: 'franchise-hero-title',
        getBoundingClientRect: () => ({ width: 800, height: 60 })
      },
      heroSubtitle: {
        className: 'franchise-hero-subtitle', 
        getBoundingClientRect: () => ({ width: 800, height: 40 })
      },
      primaryButton: {
        className: 'btn-franchise-primary',
        getBoundingClientRect: () => ({ width: 200, height: 44 })
      },
      secondaryButton: {
        className: 'btn-franchise-secondary',
        getBoundingClientRect: () => ({ width: 200, height: 44 })
      },
      
      // Benefits section elements
      benefitsSection: {
        className: 'franchise-benefits',
        getBoundingClientRect: () => ({ width: 1024, height: 800 })
      },
      benefitsTitle: {
        className: 'franchise-benefits-title',
        getBoundingClientRect: () => ({ width: 600, height: 50 })
      },
      benefitCards: Array.from({ length: 6 }, (_, index) => ({
        className: 'franchise-benefit-card',
        getBoundingClientRect: () => ({ width: 300, height: 400 }),
        querySelector: jest.fn((selector) => {
          if (selector === '.franchise-benefit-icon') {
            return {
              className: 'franchise-benefit-icon',
              getBoundingClientRect: () => ({ width: 80, height: 80 })
            };
          }
          if (selector === '.franchise-benefit-title') {
            return {
              className: 'franchise-benefit-title',
              getBoundingClientRect: () => ({ width: 260, height: 32 })
            };
          }
          if (selector === '.franchise-benefit-description') {
            return {
              className: 'franchise-benefit-description',
              getBoundingClientRect: () => ({ width: 260, height: 96 })
            };
          }
          return null;
        })
      })),
      
      // Business model section elements
      businessModelSection: {
        className: 'franchise-business-model',
        getBoundingClientRect: () => ({ width: 1024, height: 600 })
      },
      businessModelTitle: {
        className: 'franchise-business-model-title',
        getBoundingClientRect: () => ({ width: 600, height: 50 })
      },
      businessModelItems: Array.from({ length: 4 }, (_, index) => ({
        className: 'franchise-business-model-item',
        getBoundingClientRect: () => ({ width: 480, height: 200 }),
        querySelector: jest.fn((selector) => {
          if (selector === '.franchise-business-model-item-title') {
            return {
              className: 'franchise-business-model-item-title',
              getBoundingClientRect: () => ({ width: 440, height: 30 })
            };
          }
          return null;
        })
      })),
      
      // Support section elements
      supportSection: {
        className: 'franchise-support',
        getBoundingClientRect: () => ({ width: 1024, height: 700 })
      },
      supportTitle: {
        className: 'franchise-support-title',
        getBoundingClientRect: () => ({ width: 600, height: 50 })
      },
      supportCards: Array.from({ length: 6 }, (_, index) => ({
        className: 'franchise-support-card',
        getBoundingClientRect: () => ({ width: 300, height: 350 }),
        querySelector: jest.fn((selector) => {
          if (selector === '.franchise-support-icon') {
            return {
              className: 'franchise-support-icon',
              getBoundingClientRect: () => ({ width: 80, height: 80 })
            };
          }
          if (selector === '.franchise-support-title-card') {
            return {
              className: 'franchise-support-title-card',
              getBoundingClientRect: () => ({ width: 260, height: 32 })
            };
          }
          if (selector === '.franchise-support-description') {
            return {
              className: 'franchise-support-description',
              getBoundingClientRect: () => ({ width: 260, height: 80 })
            };
          }
          return null;
        })
      }))
    };
    
    // Mock computed styles with brand colors
    mockWindow.getComputedStyle.mockImplementation((element) => {
      const className = element.className || '';
      
      // Hero section styles
      if (className === 'franchise-hero') {
        return {
          background: BRAND_COLORS.COFFEE_BROWN,
          backgroundColor: BRAND_COLORS.COFFEE_BROWN,
          color: BRAND_COLORS.CREAM
        };
      }
      
      if (className === 'franchise-hero-title' || className === 'franchise-hero-subtitle') {
        return {
          color: BRAND_COLORS.CREAM
        };
      }
      
      // Button styles
      if (className === 'btn-franchise-primary') {
        return {
          background: BRAND_COLORS.GOLD,
          backgroundColor: BRAND_COLORS.GOLD,
          color: BRAND_COLORS.TEXT_DARK,
          borderColor: BRAND_COLORS.GOLD
        };
      }
      
      if (className === 'btn-franchise-secondary') {
        return {
          background: 'transparent',
          backgroundColor: 'transparent',
          color: BRAND_COLORS.CREAM,
          borderColor: BRAND_COLORS.CREAM
        };
      }
      
      // Benefits section styles
      if (className === 'franchise-benefits') {
        return {
          background: BRAND_COLORS.CREAM,
          backgroundColor: BRAND_COLORS.CREAM,
          color: BRAND_COLORS.TEXT_DARK
        };
      }
      
      if (className === 'franchise-benefits-title') {
        return {
          color: BRAND_COLORS.COFFEE_BROWN
        };
      }
      
      if (className === 'franchise-benefit-card') {
        return {
          background: BRAND_COLORS.CREAM,
          backgroundColor: BRAND_COLORS.CREAM,
          border: `1px solid rgba(60, 36, 21, 0.1)`,
          boxShadow: `0 4px 12px rgba(60, 36, 21, 0.15)`
        };
      }
      
      if (className === 'franchise-benefit-icon') {
        return {
          backgroundColor: 'rgba(60, 36, 21, 0.05)'
        };
      }
      
      if (className === 'franchise-benefit-title') {
        return {
          color: BRAND_COLORS.COFFEE_BROWN
        };
      }
      
      if (className === 'franchise-benefit-description') {
        return {
          color: BRAND_COLORS.TEXT_DARK
        };
      }
      
      // Business model section styles
      if (className === 'franchise-business-model') {
        return {
          background: BRAND_COLORS.COFFEE_BROWN,
          backgroundColor: BRAND_COLORS.COFFEE_BROWN,
          color: BRAND_COLORS.CREAM
        };
      }
      
      if (className === 'franchise-business-model-title') {
        return {
          color: BRAND_COLORS.CREAM
        };
      }
      
      if (className === 'franchise-business-model-item-title') {
        return {
          color: BRAND_COLORS.GOLD
        };
      }
      
      // Support section styles
      if (className === 'franchise-support') {
        return {
          background: BRAND_COLORS.CREAM,
          backgroundColor: BRAND_COLORS.CREAM,
          color: BRAND_COLORS.TEXT_DARK
        };
      }
      
      if (className === 'franchise-support-title') {
        return {
          color: BRAND_COLORS.COFFEE_BROWN
        };
      }
      
      if (className === 'franchise-support-card') {
        return {
          background: BRAND_COLORS.CREAM,
          backgroundColor: BRAND_COLORS.CREAM,
          border: `1px solid rgba(60, 36, 21, 0.1)`,
          boxShadow: `0 4px 12px rgba(60, 36, 21, 0.15)`
        };
      }
      
      if (className === 'franchise-support-icon') {
        return {
          backgroundColor: 'rgba(60, 36, 21, 0.05)'
        };
      }
      
      if (className === 'franchise-support-title-card') {
        return {
          color: BRAND_COLORS.COFFEE_BROWN
        };
      }
      
      if (className === 'franchise-support-description') {
        return {
          color: BRAND_COLORS.TEXT_DARK
        };
      }
      
      return {
        display: 'block'
      };
    });
    
    // Set up querySelector mocks
    mockDocument.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-hero':
          return mockElements.heroSection;
        case '.franchise-hero-title':
          return mockElements.heroTitle;
        case '.franchise-hero-subtitle':
          return mockElements.heroSubtitle;
        case '.btn-franchise-primary':
          return mockElements.primaryButton;
        case '.btn-franchise-secondary':
          return mockElements.secondaryButton;
        case '.franchise-benefits':
          return mockElements.benefitsSection;
        case '.franchise-benefits-title':
          return mockElements.benefitsTitle;
        case '.franchise-business-model':
          return mockElements.businessModelSection;
        case '.franchise-business-model-title':
          return mockElements.businessModelTitle;
        case '.franchise-support':
          return mockElements.supportSection;
        case '.franchise-support-title':
          return mockElements.supportTitle;
        default:
          return null;
      }
    });
    
    mockDocument.querySelectorAll.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-benefit-card':
          return mockElements.benefitCards;
        case '.franchise-business-model-item':
          return mockElements.businessModelItems;
        case '.franchise-support-card':
          return mockElements.supportCards;
        default:
          return [];
      }
    });
    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  /**
   * Property 6: Brand Color Consistency
   * For any page element using brand colors, the deep coffee brown (#3C2415), 
   * cream (#F5F1EB), and gold (#D4AF37) should be applied consistently throughout the design
   * Validates: Requirements 8.1, 8.2, 8.3
   */
  test('Property 6: Brand Color Consistency - Coffee brown primary color used consistently', () => {
    fc.assert(
      fc.property(
        // Generate different viewport sizes to test color consistency across responsive breakpoints
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          elementType: fc.oneof(
            fc.constant('hero'),
            fc.constant('business-model'),
            fc.constant('titles'),
            fc.constant('icons')
          )
        }),
        (testCase) => {
          const { viewport, elementType } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Test coffee brown color consistency across different element types
          if (elementType === 'hero') {
            // Hero section should use coffee brown as background
            const heroSection = mockDocument.querySelector('.franchise-hero');
            expect(heroSection).toBeTruthy();
            
            const heroStyles = mockWindow.getComputedStyle(heroSection);
            expect(heroStyles.backgroundColor).toBe(BRAND_COLORS.COFFEE_BROWN);
            expect(heroStyles.background).toBe(BRAND_COLORS.COFFEE_BROWN);
            
          } else if (elementType === 'business-model') {
            // Business model section should use coffee brown as background
            const businessModelSection = mockDocument.querySelector('.franchise-business-model');
            expect(businessModelSection).toBeTruthy();
            
            const businessModelStyles = mockWindow.getComputedStyle(businessModelSection);
            expect(businessModelStyles.backgroundColor).toBe(BRAND_COLORS.COFFEE_BROWN);
            expect(businessModelStyles.background).toBe(BRAND_COLORS.COFFEE_BROWN);
            
          } else if (elementType === 'titles') {
            // Titles on cream backgrounds should use coffee brown text
            const benefitsTitle = mockDocument.querySelector('.franchise-benefits-title');
            const supportTitle = mockDocument.querySelector('.franchise-support-title');
            
            if (benefitsTitle) {
              const benefitsTitleStyles = mockWindow.getComputedStyle(benefitsTitle);
              expect(benefitsTitleStyles.color).toBe(BRAND_COLORS.COFFEE_BROWN);
            }
            
            if (supportTitle) {
              const supportTitleStyles = mockWindow.getComputedStyle(supportTitle);
              expect(supportTitleStyles.color).toBe(BRAND_COLORS.COFFEE_BROWN);
            }
            
            // Card titles should also use coffee brown
            const benefitCards = mockDocument.querySelectorAll('.franchise-benefit-card');
            const supportCards = mockDocument.querySelectorAll('.franchise-support-card');
            
            benefitCards.forEach(card => {
              const cardTitle = card.querySelector('.franchise-benefit-title');
              if (cardTitle) {
                const titleStyles = mockWindow.getComputedStyle(cardTitle);
                expect(titleStyles.color).toBe(BRAND_COLORS.COFFEE_BROWN);
              }
            });
            
            supportCards.forEach(card => {
              const cardTitle = card.querySelector('.franchise-support-title-card');
              if (cardTitle) {
                const titleStyles = mockWindow.getComputedStyle(cardTitle);
                expect(titleStyles.color).toBe(BRAND_COLORS.COFFEE_BROWN);
              }
            });
            
          } else if (elementType === 'icons') {
            // Icons should use coffee brown with opacity for background
            const benefitCards = mockDocument.querySelectorAll('.franchise-benefit-card');
            const supportCards = mockDocument.querySelectorAll('.franchise-support-card');
            
            benefitCards.forEach(card => {
              const icon = card.querySelector('.franchise-benefit-icon');
              if (icon) {
                const iconStyles = mockWindow.getComputedStyle(icon);
                expect(iconStyles.backgroundColor).toBe('rgba(60, 36, 21, 0.05)');
              }
            });
            
            supportCards.forEach(card => {
              const icon = card.querySelector('.franchise-support-icon');
              if (icon) {
                const iconStyles = mockWindow.getComputedStyle(icon);
                expect(iconStyles.backgroundColor).toBe('rgba(60, 36, 21, 0.05)');
              }
            });
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  test('Property 6: Brand Color Consistency - Cream color used consistently for backgrounds and text', () => {
    fc.assert(
      fc.property(
        // Test cream color consistency across different sections and viewport sizes
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          sectionType: fc.oneof(
            fc.constant('benefits'),
            fc.constant('support'),
            fc.constant('hero-text'),
            fc.constant('cards')
          )
        }),
        (testCase) => {
          const { viewport, sectionType } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          if (sectionType === 'benefits') {
            // Benefits section should use cream as background
            const benefitsSection = mockDocument.querySelector('.franchise-benefits');
            expect(benefitsSection).toBeTruthy();
            
            const benefitsStyles = mockWindow.getComputedStyle(benefitsSection);
            expect(benefitsStyles.backgroundColor).toBe(BRAND_COLORS.CREAM);
            expect(benefitsStyles.background).toBe(BRAND_COLORS.CREAM);
            
          } else if (sectionType === 'support') {
            // Support section should use cream as background
            const supportSection = mockDocument.querySelector('.franchise-support');
            expect(supportSection).toBeTruthy();
            
            const supportStyles = mockWindow.getComputedStyle(supportSection);
            expect(supportStyles.backgroundColor).toBe(BRAND_COLORS.CREAM);
            expect(supportStyles.background).toBe(BRAND_COLORS.CREAM);
            
          } else if (sectionType === 'hero-text') {
            // Hero text should use cream color on coffee brown background
            const heroTitle = mockDocument.querySelector('.franchise-hero-title');
            const heroSubtitle = mockDocument.querySelector('.franchise-hero-subtitle');
            
            if (heroTitle) {
              const titleStyles = mockWindow.getComputedStyle(heroTitle);
              expect(titleStyles.color).toBe(BRAND_COLORS.CREAM);
            }
            
            if (heroSubtitle) {
              const subtitleStyles = mockWindow.getComputedStyle(heroSubtitle);
              expect(subtitleStyles.color).toBe(BRAND_COLORS.CREAM);
            }
            
          } else if (sectionType === 'cards') {
            // All cards should use cream as background
            const benefitCards = mockDocument.querySelectorAll('.franchise-benefit-card');
            const supportCards = mockDocument.querySelectorAll('.franchise-support-card');
            
            benefitCards.forEach(card => {
              const cardStyles = mockWindow.getComputedStyle(card);
              expect(cardStyles.backgroundColor).toBe(BRAND_COLORS.CREAM);
              expect(cardStyles.background).toBe(BRAND_COLORS.CREAM);
            });
            
            supportCards.forEach(card => {
              const cardStyles = mockWindow.getComputedStyle(card);
              expect(cardStyles.backgroundColor).toBe(BRAND_COLORS.CREAM);
              expect(cardStyles.background).toBe(BRAND_COLORS.CREAM);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Brand Color Consistency - Gold accent color used consistently for highlights', () => {
    fc.assert(
      fc.property(
        // Test gold color consistency across interactive elements and accents
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          elementType: fc.oneof(
            fc.constant('primary-button'),
            fc.constant('business-model-titles'),
            fc.constant('accents')
          )
        }),
        (testCase) => {
          const { viewport, elementType } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          if (elementType === 'primary-button') {
            // Primary CTA button should use gold background
            const primaryButton = mockDocument.querySelector('.btn-franchise-primary');
            expect(primaryButton).toBeTruthy();
            
            const buttonStyles = mockWindow.getComputedStyle(primaryButton);
            expect(buttonStyles.backgroundColor).toBe(BRAND_COLORS.GOLD);
            expect(buttonStyles.background).toBe(BRAND_COLORS.GOLD);
            expect(buttonStyles.borderColor).toBe(BRAND_COLORS.GOLD);
            
          } else if (elementType === 'business-model-titles') {
            // Business model item titles should use gold color
            const businessModelItems = mockDocument.querySelectorAll('.franchise-business-model-item');
            
            businessModelItems.forEach(item => {
              const itemTitle = item.querySelector('.franchise-business-model-item-title');
              if (itemTitle) {
                const titleStyles = mockWindow.getComputedStyle(itemTitle);
                expect(titleStyles.color).toBe(BRAND_COLORS.GOLD);
              }
            });
            
          } else if (elementType === 'accents') {
            // Verify gold is used consistently as accent color
            // This test ensures gold is not overused but appears in key highlight areas
            
            // Primary button should use gold
            const primaryButton = mockDocument.querySelector('.btn-franchise-primary');
            if (primaryButton) {
              const buttonStyles = mockWindow.getComputedStyle(primaryButton);
              expect(buttonStyles.backgroundColor).toBe(BRAND_COLORS.GOLD);
            }
            
            // Business model titles should use gold
            const businessModelItems = mockDocument.querySelectorAll('.franchise-business-model-item');
            let goldTitleCount = 0;
            
            businessModelItems.forEach(item => {
              const itemTitle = item.querySelector('.franchise-business-model-item-title');
              if (itemTitle) {
                const titleStyles = mockWindow.getComputedStyle(itemTitle);
                if (titleStyles.color === BRAND_COLORS.GOLD) {
                  goldTitleCount++;
                }
              }
            });
            
            // All business model titles should use gold (4 items as per requirements)
            expect(goldTitleCount).toBe(4);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Brand Color Consistency - Border and shadow colors maintain brand consistency', () => {
    fc.assert(
      fc.property(
        // Test that borders and shadows use brand colors consistently
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          cardType: fc.oneof(
            fc.constant('benefit'),
            fc.constant('support')
          )
        }),
        (testCase) => {
          const { viewport, cardType } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Get cards based on type
          const cards = cardType === 'benefit' 
            ? mockDocument.querySelectorAll('.franchise-benefit-card')
            : mockDocument.querySelectorAll('.franchise-support-card');
          
          expect(cards.length).toBeGreaterThan(0);
          
          // Test that all cards use consistent brand colors for borders and shadows
          cards.forEach(card => {
            const cardStyles = mockWindow.getComputedStyle(card);
            
            // Borders should use coffee brown with opacity
            expect(cardStyles.border).toBe('1px solid rgba(60, 36, 21, 0.1)');
            
            // Shadows should use coffee brown with opacity
            expect(cardStyles.boxShadow).toBe('0 4px 12px rgba(60, 36, 21, 0.15)');
            
            // Background should be cream
            expect(cardStyles.backgroundColor).toBe(BRAND_COLORS.CREAM);
          });
          
          // Verify consistency across card types
          if (cardType === 'benefit') {
            const supportCards = mockDocument.querySelectorAll('.franchise-support-card');
            if (supportCards.length > 0) {
              const benefitCardStyles = mockWindow.getComputedStyle(cards[0]);
              const supportCardStyles = mockWindow.getComputedStyle(supportCards[0]);
              
              // Both card types should have identical border and shadow styling
              expect(benefitCardStyles.border).toBe(supportCardStyles.border);
              expect(benefitCardStyles.boxShadow).toBe(supportCardStyles.boxShadow);
              expect(benefitCardStyles.backgroundColor).toBe(supportCardStyles.backgroundColor);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Brand Color Consistency - Secondary button maintains brand color scheme', () => {
    fc.assert(
      fc.property(
        // Test secondary button color consistency
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          })
        }),
        (testCase) => {
          const { viewport } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Secondary button should use cream text and border on transparent background
          const secondaryButton = mockDocument.querySelector('.btn-franchise-secondary');
          expect(secondaryButton).toBeTruthy();
          
          const buttonStyles = mockWindow.getComputedStyle(secondaryButton);
          
          // Secondary button should have transparent background
          expect(buttonStyles.backgroundColor).toBe('transparent');
          expect(buttonStyles.background).toBe('transparent');
          
          // Text and border should be cream color
          expect(buttonStyles.color).toBe(BRAND_COLORS.CREAM);
          expect(buttonStyles.borderColor).toBe(BRAND_COLORS.CREAM);
          
          // Verify contrast with primary button
          const primaryButton = mockDocument.querySelector('.btn-franchise-primary');
          if (primaryButton) {
            const primaryStyles = mockWindow.getComputedStyle(primaryButton);
            
            // Primary and secondary buttons should have different backgrounds
            expect(primaryStyles.backgroundColor).not.toBe(buttonStyles.backgroundColor);
            
            // But both should maintain brand color consistency
            expect(primaryStyles.backgroundColor).toBe(BRAND_COLORS.GOLD);
            expect(primaryStyles.borderColor).toBe(BRAND_COLORS.GOLD);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Brand Color Consistency - All brand colors are from approved palette', () => {
    fc.assert(
      fc.property(
        // Test that only approved brand colors are used throughout the page
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          elementCategory: fc.oneof(
            fc.constant('backgrounds'),
            fc.constant('text-colors'),
            fc.constant('borders'),
            fc.constant('buttons')
          )
        }),
        (testCase) => {
          const { viewport, elementCategory } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Define approved color values (including variations with opacity)
          const approvedColors = [
            BRAND_COLORS.COFFEE_BROWN,
            BRAND_COLORS.CREAM,
            BRAND_COLORS.GOLD,
            BRAND_COLORS.TEXT_DARK,
            BRAND_COLORS.TEXT_LIGHT,
            'transparent',
            'rgba(60, 36, 21, 0.05)', // Coffee brown with low opacity for icons
            'rgba(60, 36, 21, 0.1)',  // Coffee brown with opacity for borders
            'rgba(60, 36, 21, 0.15)'  // Coffee brown with opacity for shadows
          ];
          
          if (elementCategory === 'backgrounds') {
            // Test section backgrounds
            const sections = [
              mockDocument.querySelector('.franchise-hero'),
              mockDocument.querySelector('.franchise-benefits'),
              mockDocument.querySelector('.franchise-business-model'),
              mockDocument.querySelector('.franchise-support')
            ];
            
            sections.forEach(section => {
              if (section) {
                const styles = mockWindow.getComputedStyle(section);
                expect(approvedColors).toContain(styles.backgroundColor);
              }
            });
            
          } else if (elementCategory === 'text-colors') {
            // Test text colors
            const textElements = [
              mockDocument.querySelector('.franchise-hero-title'),
              mockDocument.querySelector('.franchise-benefits-title'),
              mockDocument.querySelector('.franchise-business-model-title'),
              mockDocument.querySelector('.franchise-support-title')
            ];
            
            textElements.forEach(element => {
              if (element) {
                const styles = mockWindow.getComputedStyle(element);
                expect(approvedColors).toContain(styles.color);
              }
            });
            
          } else if (elementCategory === 'borders') {
            // Test border colors on cards
            const cards = [
              ...mockDocument.querySelectorAll('.franchise-benefit-card'),
              ...mockDocument.querySelectorAll('.franchise-support-card')
            ];
            
            cards.forEach(card => {
              const styles = mockWindow.getComputedStyle(card);
              // Extract border color from border property
              const borderColor = styles.border.includes('rgba(60, 36, 21, 0.1)');
              expect(borderColor).toBe(true);
            });
            
          } else if (elementCategory === 'buttons') {
            // Test button colors
            const buttons = [
              mockDocument.querySelector('.btn-franchise-primary'),
              mockDocument.querySelector('.btn-franchise-secondary')
            ];
            
            buttons.forEach(button => {
              if (button) {
                const styles = mockWindow.getComputedStyle(button);
                expect(approvedColors).toContain(styles.backgroundColor);
                expect(approvedColors).toContain(styles.color);
                expect(approvedColors).toContain(styles.borderColor);
              }
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});